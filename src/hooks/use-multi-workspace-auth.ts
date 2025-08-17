"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAuth, getIdTokenResult } from 'firebase/auth';
import { app } from '../lib/firebase';
import type { 
  MultiWorkspaceAuthState, 
  WorkspaceAccess, 
  UserWorkspaceLink, 
  FirebaseAuthUser,
  MultiWorkspaceCustomClaims
} from '../lib/types';

interface MultiWorkspaceFirebaseAuthUser extends FirebaseAuthUser {
  customClaims?: MultiWorkspaceCustomClaims;
}

export function useMultiWorkspaceAuth(): MultiWorkspaceAuthState {
  const { user: baseUser, loading: authHookLoading, error: authError, isAuthenticated } = useAuth();
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceAccess[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceAccess | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  const user = useMemo(() => baseUser as MultiWorkspaceFirebaseAuthUser | null, [baseUser]);

  const refreshUserClaims = useCallback(async () => {
    const currentUser = getAuth(app).currentUser;
    if (currentUser) {
      try {
        const tokenResult = await getIdTokenResult(currentUser, true);
        return tokenResult.claims as MultiWorkspaceCustomClaims;
      } catch (error) {
        console.error('Error refreshing user claims:', error);
        return null;
      }
    }
    return null;
  }, []);

  const switchWorkspace = useCallback(async (partnerId: string): Promise<boolean> => {
    if (!user?.uid || !db) return false;

    const workspace = availableWorkspaces.find(w => w.partnerId === partnerId);
    if (!workspace) {
        console.error(`Switch failed: Workspace with partnerId ${partnerId} not found`);
        return false;
    }

    try {
        const userContextRef = doc(db, 'userWorkspaceContexts', user.uid);
        await setDoc(userContextRef, {
            activePartnerId: partnerId,
            activeTenantId: workspace.tenantId,
            lastSwitchedAt: serverTimestamp()
        }, { merge: true });

        await refreshUserClaims();
        window.location.reload();
        return true;
    } catch (error) {
        console.error('Error switching workspace:', error);
        return false;
    }
  }, [user?.uid, availableWorkspaces, refreshUserClaims]);

  const hasAccessToPartner = useCallback((partnerId: string): boolean => {
    return availableWorkspaces.some(w => w.partnerId === partnerId && w.status === 'active');
  }, [availableWorkspaces]);

  const refreshWorkspaces = useCallback(async () => {
    if (!user?.uid || !db) {
      setAvailableWorkspaces([]);
      setCurrentWorkspace(null);
      setWorkspaceLoading(false);
      return () => {};
    }

    setWorkspaceLoading(true);
    
    // First try to get workspaces from custom claims
    const claims = user.customClaims as MultiWorkspaceCustomClaims;
    if (claims?.workspaces && claims.workspaces.length > 0) {
      console.log('Loading workspaces from custom claims:', claims.workspaces);
      
      const workspacesFromClaims: WorkspaceAccess[] = claims.workspaces.map(ws => ({
        partnerId: ws.partnerId,
        tenantId: ws.tenantId,
        role: ws.role,
        permissions: ws.permissions || [],
        status: ws.status as 'active' | 'invited' | 'suspended',
        partnerName: ws.partnerName || 'Workspace',
        partnerAvatar: ws.partnerAvatar || null,
      }));
      
      setAvailableWorkspaces(workspacesFromClaims);
      
      // Set current workspace
      const activePartnerId = claims.activePartnerId || claims.partnerId;
      const currentWs = workspacesFromClaims.find(w => w.partnerId === activePartnerId) || workspacesFromClaims[0];
      setCurrentWorkspace(currentWs);
      setWorkspaceLoading(false);
      return () => {};
    }

    // Fallback: Query userWorkspaceLinks collection
    console.log('Loading workspaces from userWorkspaceLinks collection for user:', user.uid);
    const workspacesQuery = query(
        collection(db, 'userWorkspaceLinks'),
        where('userId', '==', user.uid),
        where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(workspacesQuery, (snapshot) => {
        console.log(`Found ${snapshot.docs.length} workspace links for user ${user.uid}`);
        
        const fetchedWorkspaces: WorkspaceAccess[] = snapshot.docs.map(doc => {
            const data = doc.data() as UserWorkspaceLink;
            console.log('Workspace link data:', data);
            return {
                partnerId: data.partnerId,
                tenantId: data.tenantId,
                role: data.role,
                permissions: data.permissions || [],
                status: data.status,
                partnerName: data.partnerName,
                partnerAvatar: data.partnerAvatar,
            };
        });

        const uniqueWorkspaces = fetchedWorkspaces.filter((ws, index, self) =>
            index === self.findIndex((w) => w.partnerId === ws.partnerId)
        );

        setAvailableWorkspaces(uniqueWorkspaces);
        
        // Set current workspace
        const activePartnerId = claims?.activePartnerId || claims?.partnerId;
        let activeWorkspace = null;
        if (activePartnerId) {
            activeWorkspace = uniqueWorkspaces.find(w => w.partnerId === activePartnerId) || null;
        }
        
        if (!activeWorkspace && uniqueWorkspaces.length > 0) {
            activeWorkspace = uniqueWorkspaces[0];
        }

        setCurrentWorkspace(activeWorkspace);
        setWorkspaceLoading(false);
    }, (err) => {
        console.error("Error fetching workspaces:", err);
        setWorkspaceLoading(false);
    });

    return unsubscribe;
  }, [user?.uid, user?.customClaims]);
  
  useEffect(() => {
    if (authHookLoading) {
      setWorkspaceLoading(true);
      return;
    }
    if (user?.uid) {
        const unsubscribePromise = refreshWorkspaces();
        return () => {
            Promise.resolve(unsubscribePromise).then(unsub => unsub && unsub());
        };
    } else {
        setWorkspaceLoading(false);
        setAvailableWorkspaces([]);
        setCurrentWorkspace(null);
    }
  }, [user?.uid, authHookLoading, refreshWorkspaces]);

  const isPartnerAdminFor = useCallback((partnerId: string): boolean => {
    const workspace = availableWorkspaces.find(w => w.partnerId === partnerId);
    return workspace?.role === 'partner_admin';
  }, [availableWorkspaces]);

  const canModifyPartner = useCallback((partnerId: string): boolean => {
    return isPartnerAdminFor(partnerId);
  }, [isPartnerAdminFor]);

  return {
    user,
    loading: authHookLoading || workspaceLoading,
    error: authError,
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