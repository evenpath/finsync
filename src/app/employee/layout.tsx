// src/app/employee/layout.tsx
"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import EnhancedWorkspaceSwitcher from "../../components/worker/WorkspaceSwitcher";
import WorkspaceHeader from "../../components/worker/WorkspaceHeader";
import { AuthProvider, useAuth } from '@/hooks/use-auth.tsx';
import { Skeleton } from '../../components/ui/skeleton';
import { Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

function EmployeeAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
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
      <div className="flex h-screen w-full items-center justify-center bg-secondary/30">
        <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4 h-full">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col">
            <header className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6">
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
      </div>
    );
  }
  
  // If the user is authenticated but does not have the correct role, deny access.
  const userRole = user?.customClaims?.role;
  if (userRole && userRole !== 'employee' && userRole !== 'partner_admin') {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-secondary/30">
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
