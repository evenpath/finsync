
"use client";

import PartnerHeader from "../../../components/partner/PartnerHeader";
import PendingApprovals from "../../../components/partner/PendingApprovals";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";

function PartnerApprovalsPage() {
  return (
    <>
      <PartnerHeader
        title="Pending Approvals"
        subtitle="Review and action tasks that require your approval."
      />
      <main className="flex-1 overflow-auto p-6">
        <PendingApprovals />
      </main>
    </>
  );
}

export default function PartnerApprovalsProtected() {
  return (
    <PartnerAuthWrapper>
      <PartnerApprovalsPage />
    </PartnerAuthWrapper>
  )
}
