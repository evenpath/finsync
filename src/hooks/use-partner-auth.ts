// src/hooks/use-partner-auth.ts
"use client";

import { useEffect, useState } from 'react';
import type { Partner, TeamMember } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { getPartnerDetailsAction } from '@/actions/partner-actions';

interface PartnerAuthState {
  partner: Partner | null;
  employees: TeamMember[];
  partnerId: string | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
}

export function usePartnerAuth(partnerId?: string | null) {
  const [partnerState, setPartnerState] = useState<PartnerAuthState>({
    partner: null,
    employees: [],
    partnerId: null,
    tenantId: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!partnerId) {
      setPartnerState({
        partner: null,
        employees: [],
        partnerId: null,
        tenantId: null,
        loading: false,
        error: null // Not an error state, just no partner selected
      });
      return;
    }

    setPartnerState(prev => ({ ...prev, loading: true, partnerId }));

    const fetchPartnerDetails = async () => {
      try {
        const result = await getPartnerDetailsAction(partnerId);
        
        if (result.success && result.partner) {
          setPartnerState(prev => ({
            ...prev,
            partner: result.partner,
            tenantId: result.tenantId || null,
            error: null
          }));
        } else {
          setPartnerState(prev => ({
            ...prev,
            partner: null,
            tenantId: null,
            error: result.message
          }));
        }
      } catch (error: any) {
        setPartnerState(prev => ({
          ...prev,
          partner: null,
          tenantId: null,
          error: 'Failed to fetch partner details'
        }));
      }
    };
    
    fetchPartnerDetails();

    // Listen for employee updates from the correct subcollection: partners/{partnerId}/employees
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

  }, [partnerId]);

  return {
    ...partnerState,
    loading: partnerState.loading
  };
}
