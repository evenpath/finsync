"use client";

import PartnerSidebar from "../../components/partner/PartnerSidebar";
import { AuthProvider } from "../../hooks/use-auth";
import PartnerAuthWrapper from "../../components/partner/PartnerAuthWrapper";

export default function PartnerLayout({
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