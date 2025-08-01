// src/services/partner-service.ts
import 'server-only';
import { db } from '@/lib/firebase-admin';
import { mockPartners } from '@/lib/mockData';
import type { Partner } from '@/lib/types';
import * as admin from 'firebase-admin';

/**
 * Fetches partners. If a tenantId is provided, it fetches the specific partner for that tenant.
 * If no tenantId is provided (e.g., for an admin), it fetches all partners.
 * Falls back to mock data if the database is not connected.
 * @param {string} [tenantId] - The tenant ID to filter partners.
 * @returns {Promise<Partner[]>} A promise that resolves to an array of partners.
 */
export async function getPartners(tenantId?: string): Promise<Partner[]> {
    if (!db) {
        console.log("Database not connected, returning mock partners.");
        // If a tenantId is provided, we would ideally filter mock data too.
        // For now, returning all mock partners for any case.
        return Promise.resolve(mockPartners);
    }
    
    const partnersRef = db.collection('partners');
    let query: admin.firestore.Query<admin.firestore.DocumentData> = partnersRef;

    // If a tenantId is provided, filter the query to only get that partner.
    if (tenantId) {
        query = partnersRef.where('tenantId', '==', tenantId).limit(1);
    } else {
        // If no tenantId, assume it's an admin call and fetch all partners, ordered by name.
        query = partnersRef.orderBy('name');
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
        // If it was a tenant-specific query and nothing was found, it's not an error.
        // If it was a global query, it means the collection is empty.
        return [];
    }

    const partners: Partner[] = [];
    snapshot.forEach(doc => {
        const data = doc.data();
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
            tenantId: `tenant_${dataToSeed.name.replace(/\s+/g, '_').toLowerCase()}` // Add a mock tenantId
        };

        const partnerRef = db.collection('partners').doc(id);
        batch.set(partnerRef, partnerToSeed);
    });

    await batch.commit();
    console.log('Seeding complete.');
}
