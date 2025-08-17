"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '../../hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function PartnerAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    const role = user.customClaims.role;
    // A Super Admin or partner_admin can see the partner portal.
    return role === 'Super Admin' || role === 'Admin' || role === 'partner_admin';
  }, [user, loading, isAuthenticated]);

  React.useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/partner/login');
      } else if (!isAuthorized) {
        // If the user is authenticated but not authorized for the partner portal,
        // redirect them to the employee dashboard.
        router.push('/employee');
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <header className="bg-card border-b px-6 py-4">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </header>
        <main className="flex-1 p-6">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 bg-secondary/30">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle />
              Access Denied
            </CardTitle>
            <CardDescription>
              Your account role ({user?.customClaims?.role || 'user'}) does not
              have permission to access the partner dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/employee">
              <Button variant="outline">Go to Employee Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}