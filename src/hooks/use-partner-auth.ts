
// src/hooks/use-partner-auth.ts
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPartnerDetailsAction } from '@/actions/partner-actions';
import type { Partner } from '@/lib/types';

interface PartnerAuthState {
  partner: Partner | null,
  partnerId: string | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
}

export function usePartnerAuth() {
  const { user, loading: authLoading } = useAuth();
  const [partnerState, setPartnerState] = useState<PartnerAuthState>({
    partner: null,
    partnerId: null,
    tenantId: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (authLoading) return;

    const partnerId = user?.customClaims?.partnerId;

    if (!partnerId) {
      setPartnerState({
        partner: null,
        partnerId: null,
        tenantId: null,
        loading: false,
        error: 'No partner associated with user'
      });
      return;
    }

    const fetchPartnerDetails = async () => {
      try {
        const result = await getPartnerDetailsAction(partnerId);
        
        if (result.success && result.partner) {
          setPartnerState({
            partner: result.partner,
            partnerId: partnerId,
            tenantId: result.tenantId || null,
            loading: false,
            error: null
          });
        } else {
          setPartnerState({
            partner: null,
            partnerId: partnerId,
            tenantId: null,
            loading: false,
            error: result.message
          });
        }
      } catch (error: any) {
        setPartnerState({
          partner: null,
          partnerId: partnerId,
          tenantId: null,
          loading: false,
          error: 'Failed to fetch partner details'
        });
      }
    };

    fetchPartnerDetails();
  }, [user, authLoading]);

  return {
    ...partnerState,
    loading: authLoading || partnerState.loading
  };
}
