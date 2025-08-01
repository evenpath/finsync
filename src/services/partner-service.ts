// src/services/partner-service.ts
import 'server-only';
import { db } from '@/lib/firebase-admin';
import { mockPartners } from '@/lib/mockData';
import type { Partner } from '@/lib/types';
import * as admin from 'firebase-admin';

/**
 * Fetches all partners. If a database connection is available, it fetches from Firestore.
 * Otherwise, it returns mock data.
 * @returns {Promise<Partner[]>} A promise that resolves to an array of partners.
 */
export async function getPartners(): Promise<Partner[]> {
    if (!db) {
        console.log("Database not connected, returning mock partners.");
        return Promise.resolve(mockPartners);
    }
    
    const partnersRef = db.collection('partners');
    const snapshot = await partnersRef.orderBy('name').get();
    
    if (snapshot.empty) {
        return [];
    }

    const partners: Partner[] = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        // Ensure numeric fields are correctly typed
        const partnerData: Partner = {
            id: doc.id,
            ...data,
            employeeCount: Number(data.employeeCount) || 0,
            aiProfileCompleteness: Number(data.aiProfileCompleteness) || 0,
        } as Partner;
        partners.push(partnerData);
    });

    return partners;
}

/**
 * Seeds the Firestore database with initial mock partner data if the collection is empty
 * and a database connection is available.
 */
export async function seedInitialPartners(): Promise<void> {
    if (!db) {
        console.log("Database not connected, skipping partner seeding.");
        return;
    }

    const partnersRef = db.collection('partners');
    const snapshot = await partnersRef.limit(1).get();

    if (!snapshot.empty) {
        console.log('Partners collection is not empty. Skipping seed.');
        return;
    }

    console.log('Seeding initial partner data...');
    const batch = db.batch();
    
    mockPartners.forEach(partnerData => {
        const { id, ...dataToSeed } = partnerData;

        // Ensure the data being seeded matches the expected structure.
        const partnerToSeed = {
            ...dataToSeed,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Ensure these potentially complex objects are null if not present
            businessProfile: dataToSeed.businessProfile || null,
            aiMemory: dataToSeed.aiMemory || null,
            industry: dataToSeed.industry || null,
        };

        const partnerRef = db.collection('partners').doc(id);
        batch.set(partnerRef, partnerToSeed);
    });

    await batch.commit();
    console.log('Seeding complete.');
}
