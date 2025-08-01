// src/app/admin/partners/page.tsx
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import { getPartners, seedInitialPartners } from "@/services/partner-service";
import type { Partner } from '@/lib/types';


// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
    try {
        let partners = await getPartners();

        // If the collection is empty, seed it with mock data
        if (partners.length === 0) {
            await seedInitialPartners();
            // Fetch the data again after seeding
            partners = await getPartners();
        }
        
        // Use JSON stringify/parse to ensure plain objects are passed to the client component.
        return <PartnerManagementUI initialPartners={JSON.parse(JSON.stringify(partners))} />;

    } catch (error) {
        console.error("Error in PartnerManagement component:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return <PartnerManagementUI initialPartners={[]} error={`Failed to fetch partners: ${errorMessage}`} />;
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
