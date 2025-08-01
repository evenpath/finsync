
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import { getDb } from '@/ai/genkit';
import type { Partner } from '@/lib/types';
import { mockPartners, industries } from '@/lib/mockData';
import * as admin from 'firebase-admin';

// Helper function to seed data
async function seedData(db: admin.firestore.Firestore) {
    console.log('Seeding initial partner data...');
    const batch = db.batch();
    
    mockPartners.forEach(partnerData => {
        // Find the full industry object from mockData
        const industryInfo = industries.find(i => i.slug === partnerData.industry?.slug) || null;
        
        const fullPartnerData: Omit<Partner, 'id'> & { createdAt: admin.firestore.FieldValue } = {
            ...partnerData,
            industry: industryInfo, // Make sure to embed the full object
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // We exclude 'id' from the data we write to Firestore document body
        delete (fullPartnerData as any).id;

        const partnerRef = db.collection('partners').doc(partnerData.id);
        batch.set(partnerRef, fullPartnerData);
    });

    await batch.commit();
    console.log('Seeding complete.');
}


// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
    try {
        const db = getDb();
        const partnersRef = db.collection('partners');
        let snapshot = await partnersRef.get();

        // If the collection is empty, seed it with mock data
        if (snapshot.empty) {
            await seedData(db);
            // Fetch the data again after seeding
            snapshot = await partnersRef.get();
        }
        
        const partners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Use JSON stringify/parse to ensure plain objects are passed to the client component.
        return <PartnerManagementUI initialPartners={JSON.parse(JSON.stringify(partners))} />;

    } catch (error) {
        console.error("Error fetching partners:", error);
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
