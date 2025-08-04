
// src/hooks/use-partner-auth.ts
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPartnerDetailsAction } from '@/actions/partner-actions';
import type { Partner, TeamMember } from '@/lib/types';
import { useMultiWorkspaceAuth } from './use-multi-workspace-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface PartnerAuthState {
  partner: Partner | null;
  employees: TeamMember[];
  partnerId: string | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
}

export function usePartnerAuth() {
  const { user, currentWorkspace, loading: authLoading } = useMultiWorkspaceAuth();
  const [partnerState, setPartnerState] = useState<PartnerAuthState>({
    partner: null,
    employees: [],
    partnerId: null,
    tenantId: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (authLoading) return;

    const partnerId = currentWorkspace?.partnerId;

    if (!partnerId) {
      setPartnerState({
        partner: null,
        employees: [],
        partnerId: null,
        tenantId: null,
        loading: false,
        error: 'No active partner workspace selected'
      });
      return;
    }

    setPartnerState(prev => ({ ...prev, loading: true }));

    const fetchPartnerDetails = async () => {
      try {
        const result = await getPartnerDetailsAction(partnerId);
        
        if (result.success && result.partner) {
          setPartnerState(prev => ({
            ...prev,
            partner: result.partner,
            partnerId: partnerId,
            tenantId: result.tenantId || null,
            error: null
          }));
        } else {
          setPartnerState(prev => ({
            ...prev,
            partner: null,
            partnerId: partnerId,
            tenantId: null,
            error: result.message
          }));
        }
      } catch (error: any) {
        setPartnerState(prev => ({
          ...prev,
          partner: null,
          partnerId: partnerId,
          tenantId: null,
          error: 'Failed to fetch partner details'
        }));
      }
    };
    
    fetchPartnerDetails();

    // Listen for employee updates
    const employeesRef = collection(db, `partners/${partnerId}/employees`);
    const q = query(employeesRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamMember));
      setPartnerState(prev => ({...prev, employees: membersData, loading: false}));
    }, (error) => {
      console.error("Error fetching employees:", error);
      setPartnerState(prev => ({...prev, loading: false, error: 'Could not fetch team members.'}));
    });

    return () => unsubscribe();

  }, [currentWorkspace, authLoading]);

  return {
    ...partnerState,
    loading: authLoading || partnerState.loading
  };
}
