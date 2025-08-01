import PartnerHeader from "@/components/partner/PartnerHeader";
import PendingApprovals from "@/components/partner/PendingApprovals";

export default function PartnerApprovalsPage() {
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
