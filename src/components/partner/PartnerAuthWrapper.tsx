
// src/components/partner/PartnerAuthWrapper.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    const role = user.customClaims.role;
    // A Super Admin or partner_admin can see the partner portal.
    // Employees are now routed to /employee
    return role === 'Super Admin' || role === 'partner_admin';
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

  if (loading || !isAuthenticated) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // Render children if authenticated, authorization is handled at page level now
  // for components that need workspace context.
  return children;
}
