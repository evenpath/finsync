
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import EnhancedWorkspaceSwitcher from "@/components/worker/WorkspaceSwitcher";
import WorkspaceHeader from "@/components/worker/WorkspaceHeader";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function EmployeeAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }
    if (!isAuthenticated) {
      // If not logged in, redirect to the employee login page
      router.push('/employee/login');
    } else if (user?.customClaims?.role !== 'employee') {
      // If logged in but NOT an employee, redirect away from the employee section to the homepage
      router.push('/');
    }
  }, [loading, isAuthenticated, user, router]);

  // Show a loading skeleton while auth state is being determined or if user is not yet verified as an employee
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
  
  // If authenticated and the user is an employee, show the dashboard
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
