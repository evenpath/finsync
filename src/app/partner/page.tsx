// src/app/partner/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { Skeleton } from '../../components/ui/skeleton';

export default function PartnerRootPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.replace('/partner/login');
      } else {
        // Authenticated, check role and redirect to the main protected page
        const role = user?.customClaims?.role;
        if (role === 'employee') {
          router.replace('/employee');
        } else if (role === 'Super Admin' || role === 'Admin' || role === 'partner_admin') {
          // The main page for the partner section is now at the root of the protected group.
          // This page's purpose is to redirect to the correct place.
          // Since this page is at /partner, and the protected page is also at /partner,
          // the layout will handle showing the correct content. No redirect needed here if authorized.
        } else {
          // Fallback if role is not recognized
          router.replace('/partner/login');
        }
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // This is a transitional page, showing a loading state is appropriate.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full animate-pulse" />
        <p className="text-muted-foreground">Loading Workspace...</p>
      </div>
    </div>
  );
}
