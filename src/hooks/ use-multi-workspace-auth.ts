// src/hooks/use-multi-workspace-auth.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  MultiWorkspaceAuthState, 
  WorkspaceAccess, 
  UserWorkspaceLink, 
  UserWorkspaceContext 
} from '@/lib/types/multi-workspace';

export function useMultiWorkspaceAuth(): MultiWorkspaceAuthState {
  const { user: baseUser, loading, error, isAuthenticated } = useAuth();
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceAccess[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceAccess | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  // Convert base user to multi-workspace user
  const user = useMemo(() => {
    if (!baseUser) return null;
    return {
      ...baseUser,
      customClaims: baseUser.customClaims as MultiWorkspaceCustomClaims
    };
  }, [baseUser]);

  // Fetch user's workspace memberships
  const refreshWorkspaces = useCallback(async () => {
    if (!user?.uid || !db) {
      setAvailableWorkspaces([]);
      setCurrentWorkspace(null);
      setWorkspaceLoading(false);
      return;
    }

    try {
      setWorkspaceLoading(true);
      
      const userWorkspaceLinksRef = collection(db, 'userWorkspaceLinks');
      const q = query(
        userWorkspaceLinksRef,
        where('userId', '==', user.uid),
        where('status', '==', 'active')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const workspaces: WorkspaceAccess[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as UserWorkspaceLink;
          workspaces.push({
            partnerId: data.partnerId,
            tenantId: data.tenantId,
            role: data.role,
            permissions: data.permissions || [],
            status: data.status
          });
        });

        setAvailableWorkspaces(workspaces);

        // Set current workspace if not set
        if (!currentWorkspace && workspaces.length > 0) {
          // Try to use the active workspace from custom claims
          const activePartnerId = user.customClaims?.activePartnerId;
          const activeWorkspace = activePartnerId 
            ? workspaces.find(w => w.partnerId === activePartnerId)
            : workspaces[0];
          
          setCurrentWorkspace(activeWorkspace || workspaces[0]);
        }

        setWorkspaceLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setWorkspaceLoading(false);
    }
  }, [user?.uid, user?.customClaims?.activePartnerId, currentWorkspace]);

  // Switch to a different workspace
  const switchWorkspace = useCallback(async (partnerId: string): Promise<boolean> => {
    if (!user?.uid || !db) return false;

    try {
      const targetWorkspace = availableWorkspaces.find(w => w.partnerId === partnerId);
      if (!targetWorkspace) {
        console.error('Workspace not found or access denied:', partnerId);
        return false;
      }

      // Update user's workspace context
      const contextRef = doc(db, 'userWorkspaceContext', user.uid);
      await updateDoc(contextRef, {
        activePartnerId: partnerId,
        activeTenantId: targetWorkspace.tenantId,
        lastSwitchedAt: serverTimestamp(),
        availableWorkspaces: availableWorkspaces.map(w => w.partnerId)
      });

      // Update custom claims through cloud function or admin SDK
      // This would trigger a token refresh
      await updateUserCustomClaims(user.uid, {
        ...user.customClaims,
        activePartnerId: partnerId,
        activeTenantId: targetWorkspace.tenantId
      });

      setCurrentWorkspace(targetWorkspace);
      return true;
    } catch (error) {
      console.error('Error switching workspace:', error);
      return false;
    }
  }, [user?.uid, availableWorkspaces, user?.customClaims]);

  // Permission checking functions
  const hasAccessToPartner = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    
    // Super Admin and Admin have access to all partners
    if (user.customClaims?.role === 'Super Admin' || 
        user.customClaims?.role === 'Admin' ||
        user.email === 'core@suupe.com') {
      return true;
    }

    // Check if user has access through workspace memberships
    return availableWorkspaces.some(w => w.partnerId === partnerId && w.status === 'active');
  }, [user, availableWorkspaces]);

  const isPartnerAdminFor = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    
    // Super Admin and Admin are considered partner admin for all partners
    if (user.customClaims?.role === 'Super Admin' || 
        user.customClaims?.role === 'Admin' ||
        user.email === 'core@suupe.com') {
      return true;
    }

    // Check if user is a partner admin for this specific partner
    const workspace = availableWorkspaces.find(w => w.partnerId === partnerId);
    return workspace?.role === 'partner_admin' && workspace.status === 'active';
  }, [user, availableWorkspaces]);

  const canModifyPartner = useCallback((partnerId: string): boolean => {
    return isPartnerAdminFor(partnerId);
  }, [isPartnerAdminFor]);

  // Initialize workspaces when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshWorkspaces();
    } else {
      setAvailableWorkspaces([]);
      setCurrentWorkspace(null);
      setWorkspaceLoading(false);
    }
  }, [user?.uid, refreshWorkspaces]);

  return {
    user,
    loading: loading || workspaceLoading,
    error,
    isAuthenticated,
    currentWorkspace,
    availableWorkspaces,
    switchWorkspace,
    refreshWorkspaces,
    hasAccessToPartner,
    isPartnerAdminFor,
    canModifyPartner
  };
}

// Helper function to update custom claims (would need to be implemented as a cloud function)
async function updateUserCustomClaims(uid: string, claims: any): Promise<void> {
  // This would call a cloud function or API endpoint to update custom claims
  // Example:
  try {
    const response = await fetch('/api/auth/update-claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, claims }),
    });

    if (!response.ok) {
      throw new Error('Failed to update custom claims');
    }
  } catch (error) {
    console.error('Error updating custom claims:', error);
    throw error;
  }
}