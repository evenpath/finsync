// src/components/partner/PartnerAuthWrapper.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useMultiWorkspaceAuth } from '../../hooks/use-multi-workspace-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '../../hooks/use-toast';
import JoinWorkspaceDialog from '../employee/JoinWorkspaceDialog';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, currentWorkspace, refreshWorkspaces } = useMultiWorkspaceAuth();
  const router = useRouter();
  const auth = getAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }
    if (!isAuthenticated) {
      router.push('/partner/login');
    }
  }, [loading, isAuthenticated, router]);
  
  const handleSignOut = async () => {
      try {
        await signOut(auth);
        toast({ title: "Signed Out" });
        router.push('/partner/login');
      } catch (error) {
        toast({ variant: "destructive", title: "Sign Out Failed" });
      }
  };

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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle />
                No Workspace Found
              </CardTitle>
              <CardDescription>
                Your account is not yet associated with a workspace. Please use an invitation code to join one or sign out.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <JoinWorkspaceDialog 
                trigger={<Button>Join a Workspace</Button>}
                onSuccess={refreshWorkspaces}
              />
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2"/>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      )
  }

  // If authenticated and we have a workspace, show the content.
  if (isAuthenticated && currentWorkspace) {
      const userRole = currentWorkspace?.role;
      if (userRole !== 'partner_admin' && userRole !== 'employee') {
          return (
             <div className="flex h-screen w-full items-center justify-center p-4 bg-secondary/30">
                 <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle />
                            Access Denied
                        </CardTitle>
                        <CardDescription>
                            Your account role ({userRole || 'none'}) does not have permission to access the partner portal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={handleSignOut}>Go to Login</Button>
                    </CardContent>
                 </Card>
             </div>
          )
      }
      return <>{children}</>;
  }
  
  // This will be shown briefly during redirect.
  return null;
}
