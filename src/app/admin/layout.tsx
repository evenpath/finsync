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

  // The user is authorized if they are authenticated and have the 'Admin' or 'Super Admin' role.
  const isAuthorized = React.useMemo(() => {
    if (loading || !isAuthenticated || !user?.customClaims) {
      return false;
    }
    const role = user.customClaims.role;
    return role === 'Admin' || role === 'Super Admin';
  }, [user, loading, isAuthenticated]);


  React.useEffect(() => {
    // Wait until the loading is complete before checking auth state.
    if (!loading) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to login.
        router.push('/auth/login');
      } else if (!isAuthorized) {
        // If authenticated but not authorized, redirect to the home page.
        router.push('/'); 
      }
    }
  }, [loading, isAuthenticated, isAuthorized, router]);

  // Display a skeleton loader while authentication is in progress OR if the user is not authorized yet.
  // This prevents child components from attempting to fetch data before permissions are confirmed.
  if (loading || !isAuthorized) {
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
