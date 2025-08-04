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
  
  // Check if user has workspace access
  if (availableWorkspaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>No Workspace Access</CardTitle>
                <CardDescription>
                  You don't have access to any workspaces yet.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Contact your organization admin to get invited to a workspace, or check if you have pending invitations.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Refresh
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                className="flex-1"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show workspace selection if no current workspace
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Select Workspace
            </CardTitle>
            <CardDescription>
              Choose a workspace to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableWorkspaces.map((workspace) => (
              <Button
                key={workspace.partnerId}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  // For now, we'll just refresh the page
                  // In production, this would switch workspace properly
                  window.location.reload();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
                    {workspace.partnerName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{workspace.partnerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {workspace.role === 'partner_admin' ? 'Admin' : 'Employee'}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If authorized and has workspace, show the employee dashboard
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
