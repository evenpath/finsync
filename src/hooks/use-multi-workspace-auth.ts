
// src/hooks/use-multi-workspace-auth.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Corrected path
import { switchWorkspaceAction } from '@/actions/workspace-actions';
import type { 
  MultiWorkspaceAuthState, 
  WorkspaceAccess, 
  UserWorkspaceLink, 
  FirebaseAuthUser,
  MultiWorkspaceCustomClaims
} from '../../lib/types';

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

    try {
      setWorkspaceLoading(true);

      // Query for user's workspace links
      const workspacesQuery = query(
        collection(db, 'userWorkspaceLinks'),
        where('userId', '==', user.uid),
        where('status', 'in', ['active', 'invited'])
      );

      const unsubscribe = onSnapshot(workspacesQuery, (snapshot) => {
        const workspaceLinks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserWorkspaceLink[];

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

        // Filter out duplicates to prevent React key errors
        const uniqueWorkspaces = workspaces.filter((workspace, index, self) =>
          index === self.findIndex((w) => (
            w.partnerId === workspace.partnerId
          ))
        );

        setAvailableWorkspaces(uniqueWorkspaces);

        // Set current workspace based on custom claims or first available
        const activePartnerId = user.customClaims?.activePartnerId || user.customClaims?.partnerId;
        const activeWorkspace = activePartnerId 
          ? uniqueWorkspaces.find(w => w.partnerId === activePartnerId)
          : uniqueWorkspaces.find(w => w.status === 'active');
        
        setCurrentWorkspace(activeWorkspace || null);
        setWorkspaceLoading(false);
      });

      return unsubscribe;

    } catch (error) {
      console.error('Error fetching workspaces:', error);
      
      // Fallback to custom claims if database query fails
      const { partnerId, tenantId, role, partnerIds } = user.customClaims || {};
      
      if (partnerId && tenantId && (role === 'partner_admin' || role === 'employee')) {
        const fallbackWorkspace: WorkspaceAccess = {
          partnerId,
          tenantId,
          role,
          permissions: [],
          status: 'active',
          partnerName: user.displayName || `Partner ${partnerId}`,
          partnerAvatar: undefined
        };
        
        const allWorkspaces = user.customClaims.workspaces || [fallbackWorkspace]
        
        setAvailableWorkspaces(allWorkspaces);
        setCurrentWorkspace(fallbackWorkspace);
      } else {
        setAvailableWorkspaces([]);
        setCurrentWorkspace(null);
      }
      
      setWorkspaceLoading(false);
      return () => {}; // Return a no-op unsubscribe function
    }
  }, [user]);

  // Switch to a different workspace
  const switchWorkspace = useCallback(async (partnerId: string): Promise<boolean> => {
    if (!user?.uid || !db) return false;

    try {
      const targetWorkspace = availableWorkspaces.find(w => w.partnerId === partnerId);
      if (!targetWorkspace) {
        console.error('Workspace not found or access denied:', partnerId);
        return false;
      }
      
      const result = await switchWorkspaceAction(user.uid, partnerId);
      
      if(result.success) {
          // Force token refresh to get updated claims
          await user.getIdToken(true);
          setCurrentWorkspace(result.workspace);
          return true;
      } else {
          console.error("Failed to switch workspace:", result.message);
          return false;
      }

    } catch (error) {
      console.error('Error switching workspace:', error);
      return false;
    }
  }, [user, availableWorkspaces]);

  // Permission checking functions
  const hasAccessToPartner = useCallback((partnerId: string): boolean => {
    if (!user) return false;
    
    // Super Admin and Admin have access to all partners
    if (user.customClaims?.role === 'Super Admin' || 
        user.customClaims?.role === 'Admin' ||
        user.email === 'core@socket.com') {
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
        user.email === 'core@socket.com') {
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
      const unsubscribePromise = refreshWorkspaces();
      return () => {
        Promise.resolve(unsubscribePromise).then(unsub => unsub && unsub());
      };
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
