
"use client";

import PartnerHeader from "../../components/partner/PartnerHeader";
import TeamManagement from "../../components/partner/TeamManagement";
import PartnerAuthWrapper from "../../components/partner/PartnerAuthWrapper";

function PartnerTeamPage() {
  return (
    <PartnerAuthWrapper>
      <PartnerHeader
        title="Team Management"
        subtitle="Manage your team members, roles, and permissions."
      />
      <main className="flex-1 overflow-auto p-6">
        <TeamManagement />
      </main>
    </PartnerAuthWrapper>
  );
}

export default PartnerTeamPage;
