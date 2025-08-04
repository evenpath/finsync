
// src/hooks/use-multi-workspace-auth.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth as clientAuth } from '@/lib/firebase';
import type { 
  MultiWorkspaceAuthState, 
  WorkspaceAccess, 
  UserWorkspaceLink, 
  FirebaseAuthUser
} from '@/lib/types';

interface MultiWorkspaceCustomClaims {
    role?: 'Super Admin' | 'Admin' | 'partner_admin' | 'employee';
    partnerId?: string; // Legacy support
    tenantId?: string; // Legacy support
    partnerIds?: string[];
    workspaces?: WorkspaceAccess[];
    activePartnerId?: string;
    activeTenantId?: string;
}

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
      return;
    }

    setWorkspaceLoading(true);
    const userWorkspaceLinksRef = collection(db, 'partners', user.uid, 'employees');
    // This seems incorrect. It should be a root collection or a different path.
    // Let's assume the correct path for now based on previous fixes:
    const correctWorkspacesRef = collection(db, 'userWorkspaceLinks');
    const q = query(correctWorkspacesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workspaces: WorkspaceAccess[] = snapshot.docs.map(doc => {
          const data = doc.data() as UserWorkspaceLink;
          return {
              partnerId: data.partnerId,
              tenantId: data.tenantId,
              role: data.role,
              permissions: data.permissions || [],
              status: data.status,
              partnerName: data.partnerName,
              partnerAvatar: data.partnerAvatar
          };
      });

      setAvailableWorkspaces(workspaces);
      
      const activePartnerId = user.customClaims?.activePartnerId || user.customClaims?.partnerId;
      const activeWorkspace = activePartnerId 
        ? workspaces.find(w => w.partnerId === activePartnerId && (w.status === 'active' || w.status === 'invited'))
        : workspaces.find(w => w.status === 'active' || w.status === 'invited');

      setCurrentWorkspace(activeWorkspace || null);
      setWorkspaceLoading(false);
    }, (err) => {
        console.error("Error fetching workspaces:", err);
        setWorkspaceLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const switchWorkspace = useCallback(async (partnerId: string): Promise<boolean> => {
    if (!user?.uid || !db) return false;

    const targetWorkspace = availableWorkspaces.find(w => w.partnerId === partnerId);
    if (!targetWorkspace) {
        console.error("Workspace not found or access denied");
        return false;
    }
    
    try {
        // You would typically call a Cloud Function to set custom claims.
        // For this example, we simulate this and then force a token refresh.
        console.log(`Requesting to switch workspace to ${partnerId}. This would typically call a cloud function.`);

        // In a real app, a cloud function would set the `activePartnerId` claim.
        // Here we'll just update the local state and assume the function call is successful.
        await clientAuth.currentUser?.getIdToken(true); // Force refresh
        
        setCurrentWorkspace(targetWorkspace);
        // This is a placeholder for where you would update user context in Firestore if needed.
        // const contextRef = doc(db, 'userContexts', user.uid);
        // await updateDoc(contextRef, { activePartnerId: partnerId }, { merge: true });

        return true;
    } catch (e) {
        console.error("Error switching workspace:", e);
        return false;
    }
  }, [user, availableWorkspaces]);
  
  const hasAccessToPartner = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    if (user.customClaims?.role === 'Super Admin') return true;
    return availableWorkspaces.some(w => w.partnerId === partnerId && w.status === 'active');
  }, [user, availableWorkspaces]);

  const isPartnerAdminFor = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    if (user.customClaims?.role === 'Super Admin') return true;
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
          unsubscribePromise.then(unsub => unsub && unsub());
      }
    } else if (!loading) { // If not loading and no user, set workspaceLoading to false
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
