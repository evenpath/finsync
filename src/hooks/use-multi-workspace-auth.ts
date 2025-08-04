
// src/hooks/use-multi-workspace-auth.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  MultiWorkspaceAuthState, 
  WorkspaceAccess, 
  UserWorkspaceLink, 
  FirebaseAuthUser,
  MultiWorkspaceCustomClaims
} from '@/lib/types';


interface MultiWorkspaceFirebaseAuthUser extends FirebaseAuthUser {
  customClaims?: MultiWorkspaceCustomClaims;
}


export function useMultiWorkspaceAuth(): MultiWorkspaceAuthState {
  const { user: baseUser, loading, error, isAuthenticated } = useAuth();
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceAccess[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceAccess | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  const user = useMemo(() => baseUser as MultiWorkspaceFirebaseAuthUser | null, [baseUser]);

  const refreshWorkspaces = useCallback(async () => {
    if (!user?.uid || !db) {
      setAvailableWorkspaces([]);
      setCurrentWorkspace(null);
      setWorkspaceLoading(false);
      return () => {}; // Return a no-op unsubscribe function
    }

    setWorkspaceLoading(true);
    // This is a placeholder for where you would query for a user's workspaces.
    // In a real multi-workspace app, you'd have a 'userWorkspaceLinks' collection or similar.
    // For now, we construct a "workspace" from the user's primary claim.
    const { partnerId, tenantId, role } = user.customClaims || {};

    if (partnerId && tenantId && (role === 'partner_admin' || role === 'employee')) {
        const constructedWorkspace: WorkspaceAccess = {
            partnerId,
            tenantId,
            role,
            permissions: [], // Permissions would also come from a DB record
            status: 'active', // Assume active if they can log in
            partnerName: user.displayName || `Partner ${partnerId}`, // Fallback name
        };
        setAvailableWorkspaces([constructedWorkspace]);
        setCurrentWorkspace(constructedWorkspace);
    } else {
        setAvailableWorkspaces([]);
        setCurrentWorkspace(null);
    }

    setWorkspaceLoading(false);
    return () => {}; // Return a no-op unsubscribe function for consistency
  }, [user]);

  const switchWorkspace = useCallback(async (partnerId: string): Promise<boolean> => {
    // This is a placeholder. In a real app, this would involve a backend call
    // to update the user's 'activePartnerId' claim, then forcing a token refresh.
    console.log(`Switching workspace to ${partnerId}`);
    const targetWorkspace = availableWorkspaces.find(w => w.partnerId === partnerId);
    if(targetWorkspace) {
        setCurrentWorkspace(targetWorkspace);
        return true;
    }
    return false;
  }, [availableWorkspaces]);
  
  const hasAccessToPartner = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    if (user.customClaims?.role === 'Super Admin' || user.customClaims?.role === 'Admin') return true;
    return availableWorkspaces.some(w => w.partnerId === partnerId && w.status === 'active');
  }, [user, availableWorkspaces]);

  const isPartnerAdminFor = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    if (user.customClaims?.role === 'Super Admin' || user.customClaims?.role === 'Admin') return true;
    const workspace = availableWorkspaces.find(w => w.partnerId === partnerId);
    return workspace?.role === 'partner_admin' && workspace.status === 'active';
  }, [user, availableWorkspaces]);

  const canModifyPartner = useCallback((partnerId: string): boolean => {
    return isPartnerAdminFor(partnerId);
  }, [isPartnerAdminFor]);


  useEffect(() => {
    if (user?.uid) {
      const unsubscribePromise = refreshWorkspaces();
      return () => {
          Promise.resolve(unsubscribePromise).then(unsub => unsub && unsub());
      }
    } else if (!loading) { 
      setWorkspaceLoading(false);
    }
  }, [user?.uid, loading, refreshWorkspaces]);
  
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
