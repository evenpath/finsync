// src/app/partner/(protected)/layout.tsx
"use client";

import PartnerSidebar from "../../../components/partner/PartnerSidebar";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";
import { AuthProvider } from '../../../hooks/use-auth';

export default function ProtectedPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <PartnerAuthWrapper>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <PartnerSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
            {children}
            </div>
        </div>
        </PartnerAuthWrapper>
    </AuthProvider>
  );
}
