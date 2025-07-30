import PartnerHeader from "@/components/partner/PartnerHeader";
import WorkflowManagement from "@/components/partner/WorkflowManagement";

export default function PartnerWorkflowsPage() {
  return (
    <>
      <PartnerHeader
        title="My Workflows"
        subtitle="Customize and manage your assigned workflows."
      />
      <main className="flex-1 overflow-auto p-6">
        <WorkflowManagement />
      </main>
    </>
  );
}
