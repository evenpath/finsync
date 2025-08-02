"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    const role = user.customClaims.role;
    return role === 'partner_admin' || role === 'employee';
  }, [user, loading, isAuthenticated]);

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/partner/login');
      } else if (!isAuthorized) {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen">
        <div className="w-64 p-4 border-r">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  return children;
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PartnerAuthWrapper>
        <div className="flex h-screen bg-secondary/30 text-foreground">
          <PartnerSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </PartnerAuthWrapper>
    </AuthProvider>
  );
}