// ============================================================================
// 6. src/hooks/use-partner-auth.ts (new)
// ============================================================================
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPartnerDetailsAction } from '@/actions/partner-actions';

interface PartnerAuthState {
  partnerId: string | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
}

export function usePartnerAuth() {
  const { user, loading: authLoading } = useAuth();
  const [partnerState, setPartnerState] = useState<PartnerAuthState>({
    partnerId: null,
    tenantId: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user?.customClaims?.partnerId) {
      setPartnerState({
        partnerId: null,
        tenantId: null,
        loading: false,
        error: 'No partner associated with user'
      });
      return;
    }

    const fetchPartnerDetails = async () => {
      try {
        const result = await getPartnerDetailsAction(user.customClaims.partnerId);
        
        if (result.success) {
          setPartnerState({
            partnerId: user.customClaims.partnerId,
            tenantId: result.tenantId || null,
            loading: false,
            error: null
          });
        } else {
          setPartnerState({
            partnerId: user.customClaims.partnerId,
            tenantId: null,
            loading: false,
            error: result.message
          });
        }
      } catch (error: any) {
        setPartnerState({
          partnerId: user.customClaims.partnerId,
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