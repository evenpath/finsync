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
import Link from 'next/link';

function EmployeeAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, availableWorkspaces } = useMultiWorkspaceAuth();
  const router = useRouter();

  // This effect handles redirecting unauthenticated users.
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show a loading skeleton while we verify authentication.
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }
  
  // If the user is authenticated but does not have the correct role, deny access.
  const userRole = user?.customClaims?.role;
  if (userRole && userRole !== 'employee' && userRole !== 'partner_admin') {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle />
                        Access Denied
                    </CardTitle>
                    <CardDescription>
                        Your account role ({userRole}) does not have permission to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/">
                        <Button variant="outline">Go to Homepage</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      );
  }

  // If the user is an employee but has no workspaces, show a helpful message.
  if (availableWorkspaces.length === 0) {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 />
                        No Workspace Access
                    </CardTitle>
                    <CardDescription>
                        Your account is not yet associated with any workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Please contact your organization's administrator. They will need to send you an invitation to join your team's workspace.
                    </p>
                    <Link href="/login">
                        <Button variant="outline">Back to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
  }

  // If all checks pass, show the employee dashboard.
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
