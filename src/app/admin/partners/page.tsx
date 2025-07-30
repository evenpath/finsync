import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagement from "@/components/admin/PartnerManagement";

export default function AdminPartnersPage() {
  return (
    <>
      <AdminHeader
        title="Partner Management"
        subtitle="Manage partner organizations and their access."
      />
      <main className="flex-1 overflow-auto p-6">
        <PartnerManagement />
      </main>
    </>
  );
}
