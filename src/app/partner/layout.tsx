

"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import PartnerSidebar from "../../components/partner/PartnerSidebar";
import { AuthProvider } from '../../hooks/use-auth';

// The main layout for the partner section.
// It conditionally renders the sidebar based on the current route.
export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/partner/login') || pathname.startsWith('/partner/signup') || pathname.startsWith('/partner/join');

  return (
    <AuthProvider>
      <div className="flex h-screen bg-secondary/30 text-foreground">
        {!isAuthPage && <PartnerSidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
