// src/app/admin/partners/page.tsx
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import type { Partner } from '@/lib/types';


// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
    // We will no longer fetch initial partners on the server.
    // The client component will handle all data fetching in real-time.
    return <PartnerManagementUI initialPartners={[]} />;
}


export default function AdminPartnersPage() {
  return (
    <>
      <AdminHeader
        title="Partner Management"
        subtitle="Manage partner organizations and their access."
      />
      <main className="flex-1 overflow-hidden">
        <PartnerManagement />
      </main>
    </>
  );
}
