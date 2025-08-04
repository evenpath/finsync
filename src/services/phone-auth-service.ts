// src/services/phone-auth-service.ts
'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import { query, where, getDocs, collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserWorkspaceLink, WorkspaceAccess } from '@/lib/types';

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
    // Get or create user profile
    let userProfile = null;
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists()) {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        isActive: true,
        timezone: 'UTC'
      };

      await setDoc(userDocRef, userProfile);
    } else {
      userProfile = userDoc.data();
      
      // Update last active time
      await updateDoc(userDocRef, {
        lastActiveAt: serverTimestamp(),
        isActive: true
      });
    }

    // Get user's workspace access
    const workspacesQuery = query(
      collection(db, 'userWorkspaceLinks'),
      where('userId', '==', uid),
      where('status', 'in', ['active', 'invited'])
    );
    
    const workspacesSnapshot = await getDocs(workspacesQuery);
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
 * Create a new employee with phone number
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
    // Create Firebase Auth user with phone number
    const userRecord = await adminAuth.createUser({
      phoneNumber: input.phoneNumber,
      displayName: input.displayName,
      email: input.email || undefined
    });

    // Create user profile
    const userProfile = {
      uid: userRecord.uid,
      phoneNumber: input.phoneNumber,
      displayName: input.displayName,
      email: input.email || null,
      role: input.role,
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      isActive: true,
      timezone: 'UTC'
    };

    await setDoc(doc(db, 'users', userRecord.uid), userProfile);

    // Create workspace link
    const workspaceLink: Omit<UserWorkspaceLink, 'id'> = {
      userId: userRecord.uid,
      partnerId: input.partnerId,
      tenantId: input.tenantId,
      role: input.role,
      status: 'invited',
      permissions: [],
      joinedAt: serverTimestamp() as any,
      invitedBy: input.invitedBy,
      invitedAt: serverTimestamp() as any,
      partnerName: '', // Will be updated by partner service
      partnerAvatar: undefined,
      lastAccessedAt: serverTimestamp() as any
    };

    const linkId = `${userRecord.uid}_${input.partnerId}`;
    await setDoc(doc(db, 'userWorkspaceLinks', linkId), workspaceLink);

    // Set initial custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: input.role,
      partnerId: input.partnerId,
      tenantId: input.tenantId,
      partnerIds: [input.partnerId],
      activePartnerId: input.partnerId,
      activeTenantId: input.tenantId
    });

    return {
      success: true,
      message: 'Employee created successfully',
      userId: userRecord.uid
    };

  } catch (error: any) {
    console.error('Error creating employee with phone:', error);
    return {
      success: false,
      message: `Failed to create employee: ${error.message}`
    };
  }
}
