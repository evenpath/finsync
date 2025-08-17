// src/actions/partner-invitation-management.ts
'use server';

import { db } from '../lib/firebase-admin';
import type { InvitationCodeDisplay } from '../lib/types/invitation';
import { generateInvitationCode as generateCodeService } from '../services/invitation-code-service';
import { getPartnerTenantId } from '../services/tenant-service';

/**
 * Get all invitation codes for a partner's workspace
 */
export async function getPartnerInvitationCodesAction(partnerId: string): Promise<{
  success: boolean;
  message: string;
  invitations?: InvitationCodeDisplay[];
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationsQuery = await db
      .collection('invitationCodes')
      .where('partnerId', '==', partnerId)
      .orderBy('invitedAt', 'desc')
      .get();

    const invitations: InvitationCodeDisplay[] = invitationsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        invitationCode: data.invitationCode,
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: data.role,
        status: data.status,
        createdAt: data.invitedAt.toDate(),
        expiresAt: data.expiresAt.toDate(),
        acceptedAt: data.acceptedAt?.toDate(),
        acceptedBy: data.acceptedBy
      };
    });

    return {
      success: true,
      message: 'Invitations retrieved successfully',
      invitations
    };

  } catch (error: any) {
    console.error('Error getting partner invitation codes:', error);
    return {
      success: false,
      message: `Failed to retrieve invitations: ${error.message}`
    };
  }
}

/**
 * Generate invitation code for a new employee
 */
export async function generateEmployeeInvitationCodeAction(data: {
  phoneNumber: string;
  name: string;
  partnerId: string;
  role: 'employee' | 'partner_admin';
  invitedBy: string;
}): Promise<{
  success: boolean;
  message: string;
  invitationCode?: string;
  expiresAt?: string;
  partnerName?: string;
}> {
  const partnerTenant = await getPartnerTenantId(data.partnerId);

  if (!partnerTenant.success || !partnerTenant.tenantId) {
    return { success: false, message: 'Partner tenant not found.' };
  }

  try {
    const result = await generateCodeService({
      phoneNumber: data.phoneNumber,
      name: data.name,
      partnerId: data.partnerId,
      tenantId: partnerTenant.tenantId,
      role: data.role,
      invitedBy: data.invitedBy
    });

    return result;

  } catch (error: any) {
    console.error('Error generating invitation code:', error);
    return {
      success: false,
      message: `Failed to generate invitation code: ${error.message}`
    };
  }
}

/**
 * Regenerate invitation code
 */
export async function regenerateInvitationCodeAction(
  partnerId: string,
  invitationId: string
): Promise<{
  success: boolean;
  message: string;
  newInvitationCode?: string;
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationRef = db.collection('invitationCodes').doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return {
        success: false,
        message: 'Invitation not found'
      };
    }

    const invitationData = invitationDoc.data();

    if (!invitationData) {
        return { success: false, message: 'Invitation data is missing.' };
    }

    // Verify the invitation belongs to this partner
    if (invitationData?.partnerId !== partnerId) {
      return {
        success: false,
        message: 'You do not have permission to regenerate this invitation'
      };
    }

    // Can only regenerate pending invitations
    if (invitationData?.status !== 'pending') {
      return {
        success: false,
        message: 'Only pending invitations can be regenerated'
      };
    }

    // Cancel the old invitation
    await invitationRef.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    // Generate new code
    const newInvitation = await generateCodeService({
      phoneNumber: invitationData.phoneNumber,
      name: invitationData.name,
      partnerId: invitationData.partnerId,
      tenantId: invitationData.tenantId,
      role: invitationData.role,
      invitedBy: invitationData.invitedBy
    });

    if (!newInvitation.success) {
      return {
        success: false,
        message: newInvitation.message
      };
    }

    return {
      success: true,
      message: 'Invitation code regenerated successfully',
      newInvitationCode: newInvitation.invitationCode
    };

  } catch (error: any) {
    console.error('Error regenerating invitation code:', error);
    return {
      success: false,
      message: `Failed to regenerate invitation: ${error.message}`
    };
  }
}

/**
 * Cancel invitation code
 */
export async function cancelInvitationCodeAction(
  partnerId: string,
  invitationId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationRef = db.collection('invitationCodes').doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return {
        success: false,
        message: 'Invitation not found'
      };
    }

    const invitationData = invitationDoc.data();

    if (invitationData?.partnerId !== partnerId) {
      return {
        success: false,
        message: 'You do not have permission to cancel this invitation'
      };
    }

    if (invitationData?.status !== 'pending') {
      return {
        success: false,
        message: 'Only pending invitations can be cancelled'
      };
    }

    await invitationRef.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    return {
      success: true,
      message: 'Invitation cancelled successfully'
    };

  } catch (error: any) {
    console.error('Error cancelling invitation code:', error);
    return {
      success: false,
      message: `Failed to cancel invitation: ${error.message}`
    };
  }
}

/**
 * Get invitation statistics for partner dashboard
 */
export async function getInvitationStatsAction(partnerId: string): Promise<{
  success: boolean;
  message: string;
  stats?: {
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    cancelled: number;
  };
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const invitationsQuery = await db
      .collection('invitationCodes')
      .where('partnerId', '==', partnerId)
      .get();

    const stats = {
      total: 0,
      pending: 0,
      accepted: 0,
      expired: 0,
      cancelled: 0
    };

    invitationsQuery.docs.forEach(doc => {
      const data = doc.data();
      stats.total++;
      switch (data.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'accepted':
          stats.accepted++;
          break;
        case 'expired':
          stats.expired++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return {
      success: true,
      message: 'Stats retrieved successfully',
      stats
    };

  } catch (error: any) {
    console.error('Error getting invitation stats:', error);
    return {
      success: false,
      message: `Failed to retrieve stats: ${error.message}`
    };
  }
}