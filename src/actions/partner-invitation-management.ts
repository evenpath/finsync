// src/actions/partner-invitation-management.ts
'use server';

import { db } from '@/lib/firebase-admin';
import type { InvitationCodeDisplay } from '../../lib/types/invitation';
import { generateInvitationCode as generateCodeService } from '@/services/invitation-code-service';
import { getPartnerTenantId } from '@/services/tenant-service';
import { useAuth } from '../../hooks/use-auth';

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
}) {
  const partnerTenant = await getPartnerTenantId(data.partnerId);

  if (!partnerTenant.success || !partnerTenant.tenantId) {
    return { success: false, message: 'Partner tenant not found.' };
  }

  return await generateCodeService({
    ...data,
    tenantId: partnerTenant.tenantId,
  });
}


/**
 * Cancel an invitation code
 */
export async function cancelInvitationCodeAction(invitationId: string, partnerId: string): Promise<{
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

    // Verify the invitation belongs to this partner
    if (invitationData?.partnerId !== partnerId) {
      return {
        success: false,
        message: 'You do not have permission to cancel this invitation'
      };
    }

    // Can only cancel pending invitations
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
 * Regenerate invitation code (cancel old, create new)
 */
export async function regenerateInvitationCodeAction(invitationId: string, partnerId: string): Promise<{
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

    // Generate new code (reuse the generateInvitationCode service)
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
 * Get invitation statistics for partner dashboard
 */
export async function getInvitationStatsAction(partnerId: string): Promise<{
  success: boolean;
  message: string;
  stats?: {
    totalInvitations: number;
    pendingInvitations: number;
    acceptedInvitations: number;
    expiredInvitations: number;
    recentInvitations: number; // Last 7 days
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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    let totalInvitations = 0;
    let pendingInvitations = 0;
    let acceptedInvitations = 0;
    let expiredInvitations = 0;
    let recentInvitations = 0;

    invitationsQuery.docs.forEach(doc => {
      const data = doc.data();
      totalInvitations++;

      switch (data.status) {
        case 'pending':
          pendingInvitations++;
          break;
        case 'accepted':
          acceptedInvitations++;
          break;
        case 'expired':
          expiredInvitations++;
          break;
      }

      // Check if invitation was created in the last 7 days
      const createdAt = data.invitedAt.toDate();
      if (createdAt >= sevenDaysAgo) {
        recentInvitations++;
      }
    });

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      stats: {
        totalInvitations,
        pendingInvitations,
        acceptedInvitations,
        expiredInvitations,
        recentInvitations
      }
    };

  } catch (error: any) {
    console.error('Error getting invitation stats:', error);
    return {
      success: false,
      message: `Failed to retrieve statistics: ${error.message}`
    };
  }
}
