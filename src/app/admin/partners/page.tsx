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
        
        // Render a specific error component if data fetching fails
        return (
             <div className="flex items-center justify-center h-full p-6">
                 <Card className="w-full max-w-lg border-destructive">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="w-12 h-12 text-destructive" />
                            <div>
                                <h3 className="text-lg font-bold text-destructive">Error Connecting to Database</h3>
                                <p className="text-muted-foreground mt-2">Could not fetch partner data from Firestore. Please ensure your Firebase Admin credentials are correctly configured in your `.env` file.</p>
                                <p className="text-xs text-muted-foreground mt-4"><strong>Details:</strong> {errorMessage}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
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
