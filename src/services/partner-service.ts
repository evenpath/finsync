
// src/services/partner-service.ts
import 'server-only';
import { db } from '@/lib/firebase-admin'; // Use the centralized admin instance
import { mockPartners, industries } from '@/lib/mockData';
import type { Partner } from '@/lib/types';
import * as admin from 'firebase-admin';

/**
 * Fetches all partners from the Firestore collection.
 * @returns {Promise<Partner[]>} A promise that resolves to an array of partners.
 */
export async function getPartners(): Promise<Partner[]> {
    // No need to call getDb() anymore, just use the imported db instance.
    const partnersRef = db.collection('partners');
    const snapshot = await partnersRef.orderBy('name').get();
    
    if (snapshot.empty) {
        return [];
    }

    const partners: Partner[] = [];
    snapshot.forEach(doc => {
        partners.push({ id: doc.id, ...doc.data() } as Partner);
    });

    return partners;
}

/**
 * Seeds the Firestore database with initial mock partner data.
 * This should only be run once when the collection is empty.
 */
export async function seedInitialPartners(): Promise<void> {
    const partnersRef = db.collection('partners');
    const snapshot = await partnersRef.limit(1).get();

    if (!snapshot.empty) {
        console.log('Partners collection is not empty. Skipping seed.');
        return;
    }

    console.log('Seeding initial partner data...');
    const batch = db.batch();
    
    mockPartners.forEach(partnerData => {
        const industryInfo = industries.find(i => i.slug === partnerData.industry?.slug) || null;
        
        const partnerToSeed: Omit<Partner, 'id' | 'businessProfile' | 'aiMemory'> & { businessProfile: null, aiMemory: null, createdAt: admin.firestore.FieldValue, updatedAt: admin.firestore.FieldValue } = {
            name: partnerData.name,
            businessName: partnerData.businessName,
            contactPerson: partnerData.contactPerson,
            email: partnerData.email,
            phone: partnerData.phone,
            status: partnerData.status,
            plan: partnerData.plan,
            joinedDate: partnerData.joinedDate,
            industry: industryInfo,
            businessSize: partnerData.businessSize,
            employeeCount: partnerData.employeeCount,
            monthlyRevenue: partnerData.monthlyRevenue,
            location: partnerData.location,
            aiProfileCompleteness: partnerData.aiProfileCompleteness,
            stats: partnerData.stats,
            businessProfile: null, 
            aiMemory: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const partnerRef = db.collection('partners').doc(partnerData.id);
        batch.set(partnerRef, partnerToSeed);
    });

    await batch.commit();
    console.log('Seeding complete.');
}
