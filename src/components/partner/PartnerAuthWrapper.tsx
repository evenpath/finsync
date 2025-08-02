
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
    // A Super Admin, partner_admin, or employee can see the partner portal.
    return role === 'Super Admin' || role === 'partner_admin' || role === 'employee';
  }, [user, loading, isAuthenticated]);

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/partner/login');
      } else if (!isAuthorized) {
        // If not authorized for this section, redirect to a safe default page.
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  if (loading || !isAuthorized) {
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
  
  return children;
}
