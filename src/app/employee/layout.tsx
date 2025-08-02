
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceSwitcher from "@/components/worker/WorkspaceSwitcher";
import WorkspaceHeader from "@/components/worker/WorkspaceHeader";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function EmployeeAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    const role = user.customClaims.role;
    // A Super Admin should be able to see the employee portal.
    return role === 'Super Admin' || role === 'partner_admin' || role === 'employee';
  }, [user, loading, isAuthenticated]);

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/partner/login'); // Employees log in via partner portal
      } else if (!isAuthorized) {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen">
        <div className="w-20 p-4 border-r">
            <Skeleton className="h-10 w-10 rounded-lg mb-4" />
            <Skeleton className="h-12 w-12 rounded-full mb-2" />
            <Skeleton className="h-12 w-12 rounded-full mb-2" />
        </div>
        <div className="flex-1">
            <div className="p-4 border-b">
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="p-6">
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }
  
  return children;
}


export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <EmployeeAuthWrapper>
        <div className="flex h-screen bg-secondary/30">
          <WorkspaceSwitcher />
          <div className="flex flex-1 flex-col">
            <WorkspaceHeader />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </EmployeeAuthWrapper>
  );
}
