// src/app/admin/partners/page.tsx
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import { getPartners, seedInitialPartners } from "@/services/partner-service";
import type { Partner } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";


// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
    try {
        await seedInitialPartners(); // Ensure mock data exists if db is empty
        const partners = await getPartners();
        return <PartnerManagementUI initialPartners={partners} />;
    } catch (error: any) {
        console.error("Failed to fetch partners on server:", error.message);
        // Pass the error to the client component to display
        return <PartnerManagementUI initialPartners={[]} error={error.message} />;
    }
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
