import PartnerHeader from "@/components/partner/PartnerHeader";
import TeamManagement from "@/components/partner/TeamManagement";

export default function PartnerTeamPage() {
  return (
    <>
      <PartnerHeader
        title="Team Management"
        subtitle="Manage your team members, roles, and permissions."
      />
      <main className="flex-1 overflow-auto p-6">
        <TeamManagement />
      </main>
    </>
  );
}
