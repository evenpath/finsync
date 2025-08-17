// src/app/partner/(protected)/layout.tsx
// This is a new layout for protected partner pages (e.g., dashboard, settings).
"use client";

import PartnerSidebar from "../../../components/partner/PartnerSidebar";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";

export default function ProtectedPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PartnerAuthWrapper>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <PartnerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </PartnerAuthWrapper>
  );
}
