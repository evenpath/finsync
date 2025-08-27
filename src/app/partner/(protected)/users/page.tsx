// src/app/partner/(protected)/users/page.tsx
"use client";

import PartnerHeader from "../../../../components/partner/PartnerHeader";
import TeamManagement from "../../../../components/partner/team/TeamManagement";

export default function PartnerUsersPage() {
  return (
    <>
      <PartnerHeader
        title="Admin Management"
        subtitle="Manage users with administrative privileges for this workspace."
      />
      <main className="flex-1 overflow-auto p-6">
        <TeamManagement roleToShow="partner_admin" />
      </main>
    </>
  );
}
