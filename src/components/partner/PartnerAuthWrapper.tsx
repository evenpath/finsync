"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useMultiWorkspaceAuth } from '../../hooks/use-multi-workspace-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { AlertCircle, LogOut, Settings, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '../../hooks/use-toast';
import { repairPartnerWorkspaceAction } from '../../actions/repair-partner-workspace';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, currentWorkspace, availableWorkspaces, refreshWorkspaces } = useMultiWorkspaceAuth();
  const [isRepairing, setIsRepairing] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (loading) {
      return;
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

  const handleRepairWorkspace = async () => {
    if (!user?.email) {
      toast({ variant: "destructive", title: "User email not found" });
      return;
    }

    setIsRepairing(true);
    try {
      console.log('Starting workspace repair for:', user.email);
      const result = await repairPartnerWorkspaceAction(user.email);
      
      if (result.success) {
        toast({ 
          title: "Workspace Restored!", 
          description: result.message,
          duration: 3000
        });
        
        // Force page reload to get fresh data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Repair Failed", 
          description: result.message 
        });
      }
    } catch (error: any) {
      console.error('Repair error:', error);
      toast({ 
        variant: "destructive", 
        title: "Repair Failed", 
        description: "An unexpected error occurred" 
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshWorkspaces();
      toast({ title: "Refreshed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Refresh failed" });
    }
  };

  // Debug logging
  React.useEffect(() => {
    if (user && !loading) {
      console.log('🔍 PartnerAuthWrapper Debug:');
      console.log('- User:', user.email, user.uid);
      console.log('- Custom Claims:', user.customClaims);
      console.log('- Available Workspaces:', availableWorkspaces.length);
      console.log('- Current Workspace:', currentWorkspace);
    }
  }, [user, availableWorkspaces, currentWorkspace, loading]);

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
                Workspace Access Missing
              </CardTitle>
              <CardDescription>
                You're signed in as a partner admin, but your workspace access needs to be restored. 
                This can happen with accounts created before the latest updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <Button 
                onClick={handleRepairWorkspace} 
                disabled={isRepairing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2"/>
                {isRepairing ? 'Restoring Access...' : 'Restore Workspace Access'}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                This will restore access to your organization's workspace
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <Button onClick={handleRefresh} variant="outline" size="sm" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2"/>
                  Refresh
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
                  <LogOut className="w-4 h-4 mr-2"/>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
  }

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
  
  return null;
}