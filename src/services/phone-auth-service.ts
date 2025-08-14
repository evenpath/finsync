// src/services/phone-auth-service.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { UserWorkspaceLink, WorkspaceAccess, TeamMember } from '../../lib/types';
import type { UserRecord } from 'firebase-admin/auth';

export interface PhoneAuthResult {
  success: boolean;
  message: string;
  userId?: string;
  workspaces?: WorkspaceAccess[];
  hasMultipleWorkspaces?: boolean;
}

/**
 * Handle user authentication after phone verification
 * Check if user exists and has workspace access
 */
export async function handlePhoneAuthUser(phoneNumber: string, uid: string): Promise<PhoneAuthResult> {
  if (!db || !adminAuth) {
    console.error("handlePhoneAuthUser failed: Firebase Admin SDK not initialized.");
    return {
      success: false,
      message: 'Authentication failed: The server is not configured correctly. Please contact support.'
    };
  }

  try {
    // Get or create user profile using admin SDK
    let userProfile = null;
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      // Create user profile if it doesn't exist
      userProfile = {
        uid,
        phoneNumber,
        displayName: phoneNumber,
        email: null,
        role: 'employee',
        onboardingCompleted: false,
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            email: false,
            push: true,
            sms: false,
            workflowCompleted: true,
            workflowFailed: true,
            newTeamMember: true,
            systemUpdates: false
          },
          dashboard: {
            defaultView: 'overview',
            widgetLayout: [],
            refreshInterval: 30
          },
          emailDigest: 'never'
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastActiveAt: FieldValue.serverTimestamp(),
        isActive: true,
        timezone: 'UTC'
      };

      await userDocRef.set(userProfile);
    } else {
      userProfile = userDoc.data();
      
      // Update last active time
      await userDocRef.update({
        lastActiveAt: FieldValue.serverTimestamp(),
        isActive: true
      });
    }

    // Get user's workspace access using admin SDK
    const workspacesQuery = db.collection('userWorkspaceLinks')
      .where('userId', '==', uid)
      .where('status', 'in', ['active', 'invited']);
    
    const workspacesSnapshot = await workspacesQuery.get();
    const workspaceLinks = workspacesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserWorkspaceLink[];

    if (workspaceLinks.length === 0) {
      return {
        success: false,
        message: 'No workspace access found. Please contact your organization admin to get invited.'
      };
    }

    // Convert workspace links to WorkspaceAccess format
    const workspaces: WorkspaceAccess[] = workspaceLinks.map(link => ({
      partnerId: link.partnerId,
      tenantId: link.tenantId,
      role: link.role,
      permissions: link.permissions,
      status: link.status,
      partnerName: link.partnerName,
      partnerAvatar: link.partnerAvatar
    }));

    // Update Firebase Auth custom claims
    const activeWorkspace = workspaces.find(w => w.status === 'active') || workspaces[0];
    const partnerIds = workspaces.map(w => w.partnerId);

    await adminAuth.setCustomUserClaims(uid, {
      role: activeWorkspace.role,
      partnerId: activeWorkspace.partnerId,
      tenantId: activeWorkspace.tenantId,
      partnerIds,
      workspaces: workspaces.map(w => ({
        partnerId: w.partnerId,
        tenantId: w.tenantId,
        role: w.role,
        permissions: w.permissions,
        status: w.status
      })),
      activePartnerId: activeWorkspace.partnerId,
      activeTenantId: activeWorkspace.tenantId
    });

    return {
      success: true,
      message: 'Authentication successful',
      userId: uid,
      workspaces,
      hasMultipleWorkspaces: workspaces.length > 1
    };

  } catch (error: any) {
    console.error('Error handling phone auth user:', error);
    return {
      success: false,
      message: `Authentication failed: ${error.message}`
    };
  }
}


/**
 * Creates or links an employee to a partner workspace using their phone number.
 */
export async function createEmployeeWithPhone(input: {
  phoneNumber: string;
  displayName: string;
  email?: string;
  partnerId: string;
  tenantId: string;
  role: 'employee' | 'partner_admin';
  invitedBy: string;
}): Promise<PhoneAuthResult> {
  if (!db || !adminAuth) {
    console.error("createEmployeeWithPhone failed: Firebase Admin SDK not initialized.");
    return {
      success: false,
      message: 'The server is not configured correctly. Please contact support.'
    };
  }

  try {
    let userRecord: UserRecord;

    // 1. Check if a user with this phone number already exists
    try {
      userRecord = await adminAuth.getUserByPhoneNumber(input.phoneNumber);
      console.log(`User already exists with phone number: ${input.phoneNumber}, UID: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // 2. If user doesn't exist, create them
        console.log(`No user found for ${input.phoneNumber}. Creating new user.`);
        userRecord = await adminAuth.createUser({
          phoneNumber: input.phoneNumber,
          displayName: input.displayName,
          email: input.email || undefined,
        });
        console.log(`New user created with UID: ${userRecord.uid}`);
      } else {
        // Rethrow other errors
        throw error;
      }
    }

    // 3. Check if the user is already a member of this specific partner's team
    const workspaceLinkRef = db.collection('userWorkspaceLinks').doc(`${userRecord.uid}_${input.partnerId}`);
    const workspaceLinkDoc = await workspaceLinkRef.get();
    
    if (workspaceLinkDoc.exists) {
      return {
        success: false,
        message: 'This employee is already a member of your team.'
      };
    }
    
    const partnerDoc = await db.collection('partners').doc(input.partnerId).get();
    const partnerName = partnerDoc.exists ? partnerDoc.data()?.name : 'Unknown Organization';

    // 4. Create the UserWorkspaceLink to add the user to the team
    const workspaceLinkData: Omit<UserWorkspaceLink, 'id'> = {
      userId: userRecord.uid,
      partnerId: input.partnerId,
      tenantId: input.tenantId,
      role: input.role,
      status: 'active', // Adding user directly as active
      permissions: [],
      joinedAt: FieldValue.serverTimestamp() as any,
      invitedBy: input.invitedBy,
      invitedAt: FieldValue.serverTimestamp() as any,
      partnerName: partnerName,
      partnerAvatar: null,
      lastAccessedAt: FieldValue.serverTimestamp() as any
    };
    await workspaceLinkRef.set(workspaceLinkData);
    console.log(`Created workspace link for UID ${userRecord.uid} to partner ${input.partnerId}`);

    // 5. Create or update the TeamMember document
    const teamMemberRef = db.collection('teamMembers').doc(userRecord.uid);
    const teamMemberData: Omit<TeamMember, 'id' | 'createdAt'> = {
        userId: userRecord.uid,
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        name: input.displayName,
        email: input.email || userRecord.email || '',
        phone: input.phoneNumber,
        role: input.role,
        status: 'active', // User is now active
        avatar: `https://placehold.co/40x40.png?text=${input.displayName.charAt(0)}`,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        avgCompletionTime: '-',
        skills: [],
    };
    // Use set with merge to create if not exists, or update if user has a profile from another team.
    await teamMemberRef.set({ ...teamMemberData, createdAt: FieldValue.serverTimestamp() }, { merge: true });
    console.log(`Created/updated team member document for UID ${userRecord.uid}`);
    
    // In a multi-workspace context, we would add the new workspace to the user's claims
    // instead of overwriting them. This part would need more complex logic to merge claims.
    // For now, we'll set it as the active one.
    const currentClaims = userRecord.customClaims || {};
    const existingWorkspaces = (currentClaims.workspaces as WorkspaceAccess[] || []).filter(w => w.partnerId !== input.partnerId);
    
    const newWorkspaceAccess: WorkspaceAccess = {
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        role: input.role,
        permissions: [],
        status: 'active',
        partnerName: partnerName,
        partnerAvatar: undefined,
    };
    
    const updatedWorkspaces = [...existingWorkspaces, newWorkspaceAccess];
    
    await adminAuth.setCustomUserClaims(userRecord.uid, {
        ...currentClaims,
        role: input.role,
        partnerId: input.partnerId, // Set active workspace context
        tenantId: input.tenantId,
        partnerIds: updatedWorkspaces.map(w => w.partnerId),
        workspaces: updatedWorkspaces,
        activePartnerId: input.partnerId,
        activeTenantId: input.tenantId
    });


    return {
      success: true,
      message: 'Employee added to your team successfully!',
      userId: userRecord.uid,
    };

  } catch (error: any) {
    console.error('Error in createEmployeeWithPhone:', error);
    // Provide more user-friendly error messages
    let message = `Failed to add employee: ${error.message}`;
    if (error.code === 'auth/phone-number-already-exists' && error.message.includes('already in use by another user')) {
      // This case should be handled by the logic above, but as a fallback:
      message = "The phone number is already in use by another user account.";
    } else if (error.code === 'auth/invalid-phone-number') {
      message = "The phone number provided is not valid. Please use the E.164 format (e.g., +15551234567).";
    }
    return {
      success: false,
      message: message
    };
  }
}
