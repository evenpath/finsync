
"use client";

import PartnerHeader from "@/components/partner/PartnerHeader";
import WorkflowManagement from "@/components/partner/WorkflowManagement";
import PartnerAuthWrapper from "@/components/partner/PartnerAuthWrapper";

function PartnerWorkflowsPage() {
  return (
    <>
      <PartnerHeader
        title="My Workflows"
        subtitle="Manage and customize workflows for your clients."
      />
      <main className="flex-1 overflow-auto p-6">
        <WorkflowManagement />
      </main>
    </>
  );
}

export default function PartnerWorkflowsProtected() {
  return (
    <PartnerAuthWrapper>
      <PartnerWorkflowsPage />
    </PartnerAuthWrapper>
  )
}
