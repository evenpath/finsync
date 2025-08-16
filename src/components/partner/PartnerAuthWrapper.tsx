// src/components/partner/PartnerAuthWrapper.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useMultiWorkspaceAuth } from '../../hooks/use-multi-workspace-auth';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useMultiWorkspaceAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    const role = user.customClaims.role;
    // A Super Admin or partner_admin can see the partner portal.
    return role === 'Super Admin' || role === 'Admin' || role === 'partner_admin';
  }, [user, loading, isAuthenticated]);

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/partner/login');
      } else if (user?.customClaims?.role === 'employee') {
        // Redirect employees to their specific dashboard
        router.push('/employee');
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router, user]);

  if (loading || !isAuthenticated || !isAuthorized) {
    return (
        <div className="flex-1 flex flex-col h-full">
            <header className="bg-card border-b px-6 py-4">
                 <Skeleton className="h-10 w-1/3 mb-2" />
                 <Skeleton className="h-4 w-1/2" />
            </header>
            <main className="flex-1 p-6">
                <Skeleton className="h-96 w-full" />
            </main>
        </div>
    );
  }
  
  return <>{children}</>;
}