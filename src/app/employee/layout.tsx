
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import EnhancedWorkspaceSwitcher from "@/components/worker/WorkspaceSwitcher";
import WorkspaceHeader from "@/components/worker/WorkspaceHeader";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';
import { Skeleton } from '@/components/ui/skeleton';

function EmployeeAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useMultiWorkspaceAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/employee/login');
      } else if (user?.customClaims?.role && user.customClaims.role !== 'employee') {
        // If logged in but not an employee, redirect to partner portal as a fallback.
        router.push('/partner');
      }
    }
  }, [loading, isAuthenticated, router, user]);

  if (loading || !isAuthenticated || user?.customClaims?.role !== 'employee') {
    return (
      <div className="flex h-screen">
        <div className="w-20 p-4 border-r bg-gray-100">
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
  
  if (isAuthenticated && user?.customClaims?.role === 'employee') {
    return (
        <div className="flex h-screen bg-secondary/30">
          <EnhancedWorkspaceSwitcher />
          <div className="flex flex-1 flex-col">
            <WorkspaceHeader />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
    );
  }

  return null;
}


export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <EmployeeAuthWrapper>
        {children}
      </EmployeeAuthWrapper>
    </AuthProvider>
  );
}
