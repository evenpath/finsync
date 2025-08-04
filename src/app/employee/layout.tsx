// src/app/employee/layout.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import EnhancedWorkspaceSwitcher from "@/components/worker/WorkspaceSwitcher";
import WorkspaceHeader from "@/components/worker/WorkspaceHeader";
import { AuthProvider } from '@/hooks/use-auth';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function EmployeeAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, currentWorkspace, availableWorkspaces } = useMultiWorkspaceAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login
        router.push('/login');
      } else if (user.customClaims?.role && user.customClaims.role !== 'employee' && user.customClaims.role !== 'partner_admin') {
         // If logged in but not an employee or partner_admin, redirect to home
        router.push('/');
      }
    }
  }, [user, loading, router]);

  // Show loading skeleton while auth state is being determined
  if (loading) {
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

  // After loading, if user is not authorized, they will be redirected by the useEffect.
  // We can show a simple message or skeleton in the meantime.
  if (!user || (user.customClaims?.role !== 'employee' && user.customClaims?.role !== 'partner_admin')) {
      return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting...</p>
        </div>
      );
  }
  
  // If authorized, show the employee dashboard. The dashboard itself will handle
  // the case where there are no workspaces.
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
