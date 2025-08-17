// src/components/partner/PartnerAuthWrapper.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useMultiWorkspaceAuth } from '../../hooks/use-multi-workspace-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, currentWorkspace } = useMultiWorkspaceAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }
    if (!isAuthenticated) {
      router.push('/partner/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
       <div className="flex h-screen bg-secondary/30">
            <div className="w-64 bg-card border-r p-4">
                <Skeleton className="h-12 w-full mb-6" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex-1 flex flex-col">
                 <header className="bg-card border-b px-6 py-4">
                    <Skeleton className="h-10 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </header>
                <main className="flex-1 p-6">
                    <Skeleton className="h-96 w-full" />
                </main>
            </div>
        </div>
    );
  }

  if (isAuthenticated && !currentWorkspace) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-secondary/30">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle />
              No Workspace Found
            </CardTitle>
            <CardDescription>
              Your account is not yet associated with a workspace. Please use an invitation code to join one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/employee/join">
              <Button variant="outline">Join a Workspace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      )
  }

  // If authenticated and we have a workspace, show the content.
  if (isAuthenticated && currentWorkspace) {
      return <>{children}</>;
  }
  
  // This will be shown briefly during redirect.
  return null;
}
