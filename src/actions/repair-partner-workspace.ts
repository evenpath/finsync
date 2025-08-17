'use server';

import { adminAuth, db } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserWorkspaceLink } from '../lib/types';

export async function repairPartnerWorkspaceAction(userEmail: string): Promise<{
  success: boolean;
  message: string;
  partnerInfo?: any;
}> {
  if (!adminAuth || !db) {
    return {
      success: false,
      message: "Server configuration error"
    };
  }

  try {
    console.log('=== REPAIRING PARTNER WORKSPACE ===');
    console.log('User email:', userEmail);

    // 1. Get user mapping to find tenant and partner
    const userMappingRef = db.collection('userMappings').doc(userEmail.toLowerCase());
    const userMappingDoc = await userMappingRef.get();
    
    if (!userMappingDoc.exists) {
      console.log('No user mapping found');
      return {
        success: false,
        message: "User mapping not found. This account may not be properly set up."
      };
    }

    const mappingData = userMappingDoc.data();
    const tenantId = mappingData?.tenantId;
    const partnerId = mappingData?.partnerId;

    console.log('Found mapping - Tenant:', tenantId, 'Partner:', partnerId);

    if (!tenantId || !partnerId) {
      return {
        success: false,
        message: "Invalid user mapping data"
      };
    }

    // 2. Get the user from the tenant
    const tenantAuth = adminAuth.tenantManager().authForTenant(tenantId);
    let userRecord;
    
    try {
      userRecord = await tenantAuth.getUserByEmail(userEmail);
      console.log('Found user in tenant:', userRecord.uid);
    } catch (error) {
      console.log('User not found in tenant:', error);
      return {
        success: false,
        message: "User not found in the specified tenant"
      };
    }

    // 3. Verify partner exists
    const partnerRef = db.collection('partners').doc(partnerId);
    const partnerDoc = await partnerRef.get();
    
    if (!partnerDoc.exists) {
      console.log('Partner document not found');
      return {
        success: false,
        message: "Partner organization not found"
      };
    }

    const partnerData = partnerDoc.data();
    const partnerName = partnerData?.name || partnerData?.businessName || 'Your Organization';
    console.log('Found partner:', partnerName);

    // 4. Check if userWorkspaceLink exists
    const workspaceLinkId = `${userRecord.uid}_${partnerId}`;
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(workspaceLinkId);
    const existingLink = await workspaceLinkRef.get();

    if (existingLink.exists) {
      console.log('Workspace link already exists');
      return {
        success: true,
        message: "Workspace access already established",
        partnerInfo: { partnerName, partnerId, tenantId }
      };
    }

    // 5. Create the missing userWorkspaceLink
    console.log('Creating missing userWorkspaceLink...');
    const workspaceLinkData: UserWorkspaceLink = {
      userId: userRecord.uid,
      partnerId: partnerId,
      tenantId: tenantId,
      role: 'partner_admin', // Partner admin by default
      status: 'active',
      permissions: [],
      joinedAt: FieldValue.serverTimestamp() as any,
      partnerName: partnerName,
      partnerAvatar: null,
    };

    await workspaceLinkRef.set(workspaceLinkData);
    console.log('✅ Created userWorkspaceLink');

    // 6. Update user's custom claims
    console.log('Updating custom claims...');
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
    console.log('✅ Updated custom claims');

    // 7. Ensure TeamMember document exists
    const teamMemberRef = db.collection('teamMembers').doc(userRecord.uid);
    const teamMemberDoc = await teamMemberRef.get();

    if (!teamMemberDoc.exists) {
      console.log('Creating missing TeamMember document...');
      const teamMemberData = {
        userId: userRecord.uid,
        partnerId: partnerId,
        tenantId: tenantId,
        name: userRecord.displayName || partnerName + ' Admin',
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
      console.log('✅ Created TeamMember document');
    }

    console.log('=== REPAIR COMPLETE ===');

    return {
      success: true,
      message: `Successfully restored access to ${partnerName}!`,
      partnerInfo: {
        partnerName,
        partnerId,
        tenantId,
        role: 'partner_admin'
      }
    };

  } catch (error: any) {
    console.error('❌ Error repairing workspace:', error);
    return {
      success: false,
      message: `Repair failed: ${error.message}`
    };
  }
}