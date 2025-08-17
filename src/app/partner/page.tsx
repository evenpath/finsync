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
        // Authenticated, check role and redirect appropriately
        const role = user?.customClaims?.role;
        if (role === 'employee') {
          // This should ideally not happen due to the auth wrapper, but as a fallback
          router.replace('/employee');
        } else if (role === 'Super Admin' || role === 'Admin' || role === 'partner_admin') {
          // The main dashboard content is now in (protected)/page.tsx, so we don't need to redirect.
          // This page acts as a loading/redirect handler if accessed directly.
          // In the new structure, this page is inside the protected group as page.tsx
          // Let's assume we want to keep a root page that redirects for safety.
          router.replace('/partner/dashboard'); // Keeping this redirect as a logical step
        } else {
          // If role is undefined or not a partner, send to login.
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
