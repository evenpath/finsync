// src/app/admin/partners/page.tsx
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import { getPartners, seedInitialPartners } from "@/services/partner-service";
import type { Partner } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";


// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
    // The server-side fetching is removed to rely solely on the client-side
    // real-time listener in PartnerManagementUI, which avoids the permission error
    // during the initial render. The client component will handle loading and display.
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
