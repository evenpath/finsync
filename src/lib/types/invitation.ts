// src/lib/types/invitation.ts

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Code-based invitation document structure
 */
export interface CodeBasedInvitation {
  id?: string;
  invitationCode: string; // 8-character unique code
  phoneNumber: string;
  name: string;
  partnerId: string;
  tenantId: string;
  role: 'partner_admin' | 'employee';
  invitedBy: string; // User ID of inviter
  invitedAt: any; // Firestore timestamp
  expiresAt: Timestamp; // 7 days from creation
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  
  // Partner and inviter details for context
  partnerName: string;
  inviterName: string;
  inviterEmail: string;
  
  // Acceptance tracking
  acceptedAt?: any; // Firestore timestamp
  acceptedBy?: string; // User ID who accepted
  
  // Cancellation tracking  
  cancelledAt?: any; // Firestore timestamp
  expiredAt?: any; // Firestore timestamp
}

/**
 * Input for generating invitation code
 */
export interface CreateInvitationCodeInput {
  phoneNumber: string;
  name: string;
  partnerId: string;
  role?: 'employee' | 'partner_admin';
  invitedBy: string;
}

/**
 * Output from generating invitation code
 */
export interface CreateInvitationCodeOutput {
  success: boolean;
  message: string;
  invitationCode?: string;
  expiresAt?: string;
  partnerName?: string;
}

/**
 * Input for accepting invitation code
 */
export interface AcceptInvitationCodeInput {
  invitationCode: string;
  phoneNumber: string;
  uid: string;
}

/**
 * Output from accepting invitation code
 */
export interface AcceptInvitationCodeOutput {
  success: boolean;
  message: string;
  workspace?: {
    partnerId: string;
    tenantId: string;
    partnerName: string;
    role: string;
  };
}

/**
 * Invitation validation result
 */
export interface InvitationValidationResult {
  success: boolean;
  message: string;
  invitation?: {
    partnerName: string;
    inviterName: string;
    role: string;
    expiresAt: string;
    phoneNumber?: string;
  };
}

/**
 * Dashboard invitation display data
 */
export interface InvitationCodeDisplay {
  id: string;
  invitationCode: string;
  name: string;
  phoneNumber: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
}
