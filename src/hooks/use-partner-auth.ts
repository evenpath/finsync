
// src/hooks/use-partner-auth.ts
"use client";

import { useEffect, useState } from 'react';
import type { Partner, TeamMember } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

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
        error: null
      });
      return;
    }

    setPartnerState(prev => ({ ...prev, loading: true, error: null, partnerId }));

    // Listen for employee updates from the root 'teamMembers' collection
    const employeesRef = collection(db, 'teamMembers');
    const q = query(
        employeesRef, 
        where("partnerId", "==", partnerId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamMember));
      setPartnerState(prev => ({ ...prev, employees: membersData, loading: false, error: null }));
    }, (err) => {
      console.error("Error fetching employees:", err);
      // This is a more specific and helpful error message.
      setPartnerState(prev => ({ ...prev, loading: false, error: 'Could not fetch team members. Please check Firestore permissions.' }));
    });

    return () => unsubscribe();

  }, [partnerId]);

  return {
    ...partnerState,
    loading: partnerState.loading
  };
}
