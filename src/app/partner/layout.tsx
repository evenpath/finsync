
"use client";

import React from 'react';
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import { AuthProvider } from '@/hooks/use-auth';

// The main layout for the partner section. It no longer handles auth directly.
// Auth is handled by the PartnerAuthWrapper on a per-page basis.
export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-secondary/30 text-foreground">
        <PartnerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
