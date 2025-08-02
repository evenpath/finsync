// src/app/admin/layout.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from 'next/link';

function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    // Only 'Super Admin' can access the /admin section.
    return user.customClaims.role === 'Super Admin';
  }, [user, loading, isAuthenticated]);


  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  // If loading, show a skeleton UI.
  if (loading) {
    return (
       <div className="flex h-screen">
            <div className="w-64 p-4 border-r">
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
            </div>
            <div className="flex-1 p-6">
                 <Skeleton className="h-24 w-full mb-6" />
                 <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }
  
  // After loading, if user is not authorized, show access denied message.
  if (!isAuthorized) {
    return (
        <div className="flex h-screen bg-secondary/30 text-foreground">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <Card className="border-destructive">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert />
                    Access Restricted
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-destructive mb-4">
                    You do not have the required permissions to access this page. This area is for Super Admins only.
                </p>
                <Link href="/" className="text-primary hover:underline">
                    Go to Homepage
                </Link>
                </CardContent>
            </Card>
          </div>
        </div>
    )
  }
  
  // If authenticated and authorized, render the children.
  return children;
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <div className="flex h-screen bg-secondary/30 text-foreground">
            <AdminAuthWrapper>
                <AdminSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </AdminAuthWrapper>
        </div>
    </AuthProvider>
  );
}
