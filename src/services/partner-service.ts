// src/services/partner-service.ts
import 'server-only';
import { db } from '@/lib/firebase-admin';
import { mockPartners, industries } from '@/lib/mockData';
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
        partners.push({ id: doc.id, ...doc.data() } as Partner);
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
        const industryInfo = industries.find(i => i.slug === partnerData.industry?.slug) || null;
        
        const partnerToSeed: Omit<Partner, 'id'| 'createdAt' | 'updatedAt'> & { businessProfile: null, aiMemory: null, createdAt: admin.firestore.FieldValue, updatedAt: admin.firestore.FieldValue } = {
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
