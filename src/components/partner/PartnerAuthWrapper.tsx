"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '../../hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '../../hooks/use-toast';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
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

  // Debug logging
  React.useEffect(() => {
    if (user && !loading) {
      console.log('🔍 PartnerAuthWrapper Debug:');
      console.log('- User:', user.email, user.uid);
      console.log('- Custom Claims:', user.customClaims);
      console.log('- Partner ID:', user.customClaims?.partnerId);
      console.log('- Tenant ID:', user.customClaims?.tenantId);
      console.log('- Role:', user.customClaims?.role);
    }
  }, [user, loading]);

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

  if (isAuthenticated && !user?.customClaims?.partnerId) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-secondary/30">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle />
                Profile Setup Incomplete
              </CardTitle>
              <CardDescription>
                Your account is missing partner organization data. Please contact support to complete your setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                <strong>Debug Info:</strong><br/>
                User ID: {user?.uid}<br/>
                Email: {user?.email}<br/>
                Role: {user?.customClaims?.role || 'none'}<br/>
                Partner ID: {user?.customClaims?.partnerId || 'missing'}
              </div>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="w-4 h-4 mr-2"/>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      )
  }

  if (isAuthenticated && user?.customClaims?.partnerId) {
      const userRole = user.customClaims?.role;
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