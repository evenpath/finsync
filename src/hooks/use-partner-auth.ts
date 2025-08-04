
// src/hooks/use-partner-auth.ts
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPartnerDetailsAction } from '@/actions/partner-actions';
import type { Partner } from '@/lib/types';
import { useMultiWorkspaceAuth } from './use-multi-workspace-auth';

interface PartnerAuthState {
  partner: Partner | null,
  partnerId: string | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
}

export function usePartnerAuth() {
  const { currentWorkspace, loading: authLoading } = useMultiWorkspaceAuth();
  const [partnerState, setPartnerState] = useState<PartnerAuthState>({
    partner: null,
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
  }, [currentWorkspace, authLoading]);

  return {
    ...partnerState,
    loading: authLoading || partnerState.loading
  };
}
