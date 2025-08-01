
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import { getDb } from '@/ai/genkit'; // Use the new function to get db

// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
    const db = getDb();
    if (!db) {
        // Handle the case where the database is not available
        return <PartnerManagementUI initialPartners={[]} error="Firebase Admin SDK is not initialized. Please check your .env file." />;
    }

    let partners = [];
    try {
        const partnersRef = db.collection('partners');
        const snapshot = await partnersRef.get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            // Optionally, you could seed data here if you wanted.
        } else {
            partners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    } catch (error) {
        console.error("Error fetching partners:", error);
        // We can render an error state in the UI component
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return <PartnerManagementUI initialPartners={[]} error={`Failed to fetch partners: ${errorMessage}`} />;
    }

    // Use JSON stringify/parse to ensure plain objects are passed to the client component.
    return <PartnerManagementUI initialPartners={JSON.parse(JSON.stringify(partners))} />;
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
