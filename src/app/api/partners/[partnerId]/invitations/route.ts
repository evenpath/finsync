// src/app/api/partners/[partnerId]/invitations/route.ts (v2)
import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import { TeamNotificationService } from '@/services/team-notifications-service';

interface InvitationTemplate {
  id: string;
  name: string;
  role: 'partner_admin' | 'employee';
  expiryHours: number;
  autoReminders: boolean;
  customMessage?: string;
  permissions?: string[];
}

interface BulkInvitationRequest {
  invitations: Array<{
    phoneNumber: string;
    name: string;
    email?: string;
    role: 'partner_admin' | 'employee';
    templateId?: string;
    customMessage?: string;
  }>;
  templateId?: string;
  sendImmediately?: boolean;
  scheduledFor?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const partnerId = params.partnerId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    // Build query
    let query = db.collection('invitationCodes').where('partnerId', '==', partnerId);
    
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    if (!includeExpired) {
      query = query.where('expiresAt', '>', new Date());
    }

    // Get paginated results
    const invitationsSnapshot = await query
      .orderBy('invitedAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    // Get total count for pagination
    const totalSnapshot = await db.collection('invitationCodes')
      .where('partnerId', '==', partnerId)
      .get();

    const invitations = invitationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        invitationCode: data.invitationCode,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        role: data.role,
        status: data.status,
        invitedAt: data.invitedAt.toDate().toISOString(),
        expiresAt: data.expiresAt.toDate().toISOString(),
        acceptedAt: data.acceptedAt?.toDate().toISOString(),
        acceptedBy: data.acceptedBy,
        invitedBy: data.invitedBy,
        customMessage: data.customMessage,
        remindersSent: data.remindersSent || 0,
        lastReminderAt: data.lastReminderAt?.toDate().toISOString(),
        // Calculate time-based properties
        isExpired: new Date() > data.expiresAt.toDate(),
        expiresInHours: Math.max(0, Math.floor((data.expiresAt.toDate().getTime() - Date.now()) / (1000 * 60 * 60))),
        daysSinceInvited: Math.floor((Date.now() - data.invitedAt.toDate().getTime()) / (1000 * 60 * 60 * 24))
      };
    });

    // Get invitation statistics
    const stats = await getInvitationStatistics(partnerId);

    return NextResponse.json({
      success: true,
      data: {
        invitations,
        pagination: {
          total: totalSnapshot.size,
          limit,
          offset,
          hasMore: offset + limit < totalSnapshot.size
        },
        statistics: stats
      }
    });

  } catch (error: any) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch invitations"
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization') || '';
    const body = await request.json();
    const partnerId = params.partnerId;

    // Verify authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const customClaims = decodedToken;
    const isPartnerAdmin = customClaims.role === 'partner_admin' && customClaims.partnerId === partnerId;
    const isSuperAdmin = customClaims.role === 'Super Admin' || customClaims.role === 'Admin';
    
    if (!isPartnerAdmin && !isSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    // Determine if this is bulk or single invitation
    if (body.invitations && Array.isArray(body.invitations)) {
      return await handleBulkInvitations(body as BulkInvitationRequest, partnerId, decodedToken.uid);
    } else {
      return await handleSingleInvitation(body, partnerId, decodedToken.uid);
    }

  } catch (error: any) {
    console.error("Error creating invitations:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create invitations"
    }, { status: 500 });
  }
}

async function handleBulkInvitations(
  request: BulkInvitationRequest,
  partnerId: string,
  invitedBy: string
) {
  const { invitations, templateId, sendImmediately = true, scheduledFor } = request;

  if (!invitations || invitations.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'Invitations array is required'
    }, { status: 400 });
  }

  if (invitations.length > 100) {
    return NextResponse.json({
      success: false,
      message: 'Maximum 100 invitations allowed per request'
    }, { status: 400 });
  }

  // Get partner and template details
  const partnerDoc = await db.collection('partners').doc(partnerId).get();
  const partnerData = partnerDoc.data();
  
  let template: InvitationTemplate | null = null;
  if (templateId) {
    const templateDoc = await db.collection('invitationTemplates').doc(templateId).get();
    template = templateDoc.exists ? { id: templateId, ...templateDoc.data() } as InvitationTemplate : null;
  }

  const results = [];
  const batch = db.batch();

  for (const invitation of invitations) {
    try {
      // Validate phone number format
      if (!invitation.phoneNumber || !invitation.name) {
        results.push({
          phoneNumber: invitation.phoneNumber,
          success: false,
          message: 'Phone number and name are required'
        });
        continue;
      }

      // Check for existing pending invitation
      const existingSnapshot = await db
        .collection('invitationCodes')
        .where('phoneNumber', '==', invitation.phoneNumber)
        .where('partnerId', '==', partnerId)
        .where('status', '==', 'pending')
        .get();

      if (!existingSnapshot.empty) {
        results.push({
          phoneNumber: invitation.phoneNumber,
          success: false,
          message: 'Pending invitation already exists for this phone number'
        });
        continue;
      }

      // Generate invitation code
      const invitationCode = generateInvitationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (template?.expiryHours || 72)); // Default 72 hours

      const invitationData = {
        invitationCode,
        partnerId,
        partnerName: partnerData?.name || 'Organization',
        tenantId: partnerData?.tenantId,
        name: invitation.name,
        phoneNumber: invitation.phoneNumber,
        email: invitation.email,
        role: invitation.role || template?.role || 'employee',
        status: 'pending',
        invitedBy,
        invitedAt: FieldValue.serverTimestamp(),
        expiresAt: expiresAt,
        customMessage: invitation.customMessage || template?.customMessage,
        templateId: templateId,
        remindersSent: 0,
        autoReminders: template?.autoReminders || false
      };

      const invitationRef = db.collection('invitationCodes').doc();
      batch.set(invitationRef, invitationData);

      results.push({
        phoneNumber: invitation.phoneNumber,
        success: true,
        invitationCode,
        expiresAt: expiresAt.toISOString()
      });

    } catch (error: any) {
      results.push({
        phoneNumber: invitation.phoneNumber,
        success: false,
        message: error.message
      });
    }
  }

  // Commit batch
  await batch.commit();

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  // Create audit log
  await db.collection('auditLogs').add({
    action: 'BULK_INVITATIONS_CREATED',
    performedBy: invitedBy,
    partnerId: partnerId,
    details: {
      totalInvitations: invitations.length,
      successCount,
      failureCount,
      templateId
    },
    timestamp: FieldValue.serverTimestamp(),
    ipAddress: null
  });

  // Send notifications for successful invitations
  if (sendImmediately && successCount > 0) {
    // Here you would integrate with your notification service
    console.log(`Sending ${successCount} invitations immediately`);
  }

  return NextResponse.json({
    success: successCount > 0,
    message: `Bulk invitations created: ${successCount} successful, ${failureCount} failed`,
    results,
    summary: {
      total: invitations.length,
      successful: successCount,
      failed: failureCount
    }
  });
}

async function handleSingleInvitation(body: any, partnerId: string, invitedBy: string) {
  const { phoneNumber, name, email, role = 'employee', customMessage, expiryHours = 72 } = body;

  if (!phoneNumber || !name) {
    return NextResponse.json({
      success: false,
      message: 'Phone number and name are required'
    }, { status: 400 });
  }

  // Check for existing pending invitation
  const existingSnapshot = await db
    .collection('invitationCodes')
    .where('phoneNumber', '==', phoneNumber)
    .where('partnerId', '==', partnerId)
    .where('status', '==', 'pending')
    .get();

  if (!existingSnapshot.empty) {
    return NextResponse.json({
      success: false,
      message: 'Pending invitation already exists for this phone number'
    }, { status: 400 });
  }

  // Get partner details
  const partnerDoc = await db.collection('partners').doc(partnerId).get();
  const partnerData = partnerDoc.data();

  // Generate invitation
  const invitationCode = generateInvitationCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  const invitationData = {
    invitationCode,
    partnerId,
    partnerName: partnerData?.name || 'Organization',
    tenantId: partnerData?.tenantId,
    name,
    phoneNumber,
    email,
    role,
    status: 'pending',
    invitedBy,
    invitedAt: FieldValue.serverTimestamp(),
    expiresAt: expiresAt,
    customMessage,
    remindersSent: 0
  };

  await db.collection('invitationCodes').add(invitationData);

  return NextResponse.json({
    success: true,
    message: 'Invitation created successfully',
    data: {
      invitationCode,
      expiresAt: expiresAt.toISOString(),
      partnerName: partnerData?.name
    }
  });
}

async function getInvitationStatistics(partnerId: string) {
  const invitationsSnapshot = await db
    .collection('invitationCodes')
    .where('partnerId', '==', partnerId)
    .get();

  const now = new Date();
  const invitations = invitationsSnapshot.docs.map(doc => doc.data());

  return {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired: invitations.filter(i => i.status === 'expired' || (i.status === 'pending' && now > i.expiresAt.toDate())).length,
    cancelled: invitations.filter(i => i.status === 'cancelled').length,
    expiringIn24Hours: invitations.filter(i => {
      if (i.status !== 'pending') return false;
      const expiresAt = i.expiresAt.toDate();
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
    }).length,
    averageAcceptanceTime: 0, // Would need to calculate from acceptance times
    acceptanceRate: invitations.length > 0 
      ? Math.round((invitations.filter(i => i.status === 'accepted').length / invitations.length) * 100) 
      : 0
  };
}

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}