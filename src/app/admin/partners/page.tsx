
import AdminHeader from "@/components/admin/AdminHeader";
import PartnerManagementUI from "@/components/admin/PartnerManagementUI";
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/firebase-admin-config';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// This is a Server Component that fetches data and passes it to the Client Component.
async function PartnerManagement() {
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
        return <PartnerManagementUI initialPartners={[]} error="Failed to fetch partners." />;
    }

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
