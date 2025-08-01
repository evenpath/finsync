// src/app/admin/layout.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (!isAuthenticated || loading) return false;
    const role = user?.customClaims?.role;
    return role === 'Admin' || role === 'Super Admin';
  }, [isAuthenticated, user, loading]);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
        router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthorized) {
    // Show a loading skeleton while checking auth and authorization
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

  return children;
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminAuthWrapper>
        <div className="flex h-screen bg-secondary/30 text-foreground">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </AdminAuthWrapper>
    </AuthProvider>
  );
}
