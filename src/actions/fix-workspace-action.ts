'use server';

import { adminAuth, db } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserWorkspaceLink } from '../lib/types';

export async function fixUserWorkspaceAction(userEmail: string): Promise<{
  success: boolean;
  message: string;
  workspaceInfo?: any;
}> {
  if (!adminAuth || !db) {
    return {
      success: false,
      message: "Server configuration error"
    };
  }

  try {
    console.log('Fixing workspace for user:', userEmail);

    // 1. Find user mapping to get tenant and partner info
    const userMappingRef = db.collection('userMappings').doc(userEmail.toLowerCase());
    const userMappingDoc = await userMappingRef.get();
    
    if (!userMappingDoc.exists) {
      return {
        success: false,
        message: "User mapping not found. Please contact support."
      };
    }

    const mappingData = userMappingDoc.data();
    const tenantId = mappingData?.tenantId;
    const partnerId = mappingData?.partnerId;

    if (!tenantId || !partnerId) {
      return {
        success: false,
        message: "Invalid user mapping data"
      };
    }

    console.log('Found mapping - TenantId:', tenantId, 'PartnerId:', partnerId);

    // 2. Get user from tenant
    const tenantAuth = adminAuth.tenantManager().authForTenant(tenantId);
    const userRecord = await tenantAuth.getUserByEmail(userEmail);
    
    if (!userRecord) {
      return {
        success: false,
        message: "User not found in tenant"
      };
    }

    console.log('Found user in tenant:', userRecord.uid);

    // 3. Get partner information
    const partnerRef = db.collection('partners').doc(partnerId);
    const partnerDoc = await partnerRef.get();
    
    if (!partnerDoc.exists) {
      return {
        success: false,
        message: "Partner not found"
      };
    }

    const partnerData = partnerDoc.data();
    const partnerName = partnerData?.name || partnerData?.businessName || 'Workspace';

    console.log('Found partner:', partnerName);

    // 4. Check if userWorkspaceLink already exists
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userRecord.uid}_${partnerId}`);
    const existingLink = await workspaceLinkRef.get();

    if (existingLink.exists) {
      return {
        success: true,
        message: "Workspace link already exists",
        workspaceInfo: existingLink.data()
      };
    }

    // 5. Create the missing userWorkspaceLink
    const workspaceLinkData: UserWorkspaceLink = {
      userId: userRecord.uid,
      partnerId: partnerId,
      tenantId: tenantId,
      role: 'partner_admin', // Assuming partner admin for the main account
      status: 'active',
      permissions: [],
      joinedAt: FieldValue.serverTimestamp() as any,
      partnerName: partnerName,
      partnerAvatar: null,
    };

    await workspaceLinkRef.set(workspaceLinkData);
    console.log('Created userWorkspaceLink for user:', userRecord.uid);

    // 6. Update user's custom claims
    const claims = {
      role: 'partner_admin',
      partnerId: partnerId,
      tenantId: tenantId,
      activePartnerId: partnerId,
      activeTenantId: tenantId,
      partnerIds: [partnerId],
      workspaces: [{
        partnerId: partnerId,
        tenantId: tenantId,
        role: 'partner_admin',
        status: 'active',
        partnerName: partnerName,
        permissions: []
      }]
    };

    await tenantAuth.setCustomUserClaims(userRecord.uid, claims);
    console.log('Updated custom claims for user:', userRecord.uid);

    // 7. Create or update TeamMember document if missing
    const teamMemberRef = db.collection('teamMembers').doc(userRecord.uid);
    const teamMemberDoc = await teamMemberRef.get();

    if (!teamMemberDoc.exists) {
      const teamMemberData = {
        userId: userRecord.uid,
        partnerId: partnerId,
        tenantId: tenantId,
        name: userRecord.displayName || 'Partner Admin',
        email: userRecord.email || '',
        phone: userRecord.phoneNumber || '',
        role: 'partner_admin',
        status: 'active',
        avatar: `https://placehold.co/40x40.png?text=${(userRecord.displayName || 'A').charAt(0)}`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        avgCompletionTime: '-',
        skills: [],
        createdAt: FieldValue.serverTimestamp(),
      };
      
      await teamMemberRef.set(teamMemberData);
      console.log('Created TeamMember document for user:', userRecord.uid);
    }

    return {
      success: true,
      message: "Workspace access has been restored successfully!",
      workspaceInfo: {
        partnerId,
        tenantId,
        partnerName,
        role: 'partner_admin'
      }
    };

  } catch (error: any) {
    console.error('Error fixing workspace:', error);
    return {
      success: false,
      message: `Failed to fix workspace: ${error.message}`
    };
  }
}