'use server';

/**
 * @fileOverview A secure server-side function to fetch all partner documents from Firestore.
 * This function is intended to be called from the admin client.
 */

import * as admin from 'firebase-admin';
import type { Partner } from '@/lib/types';

// The Firebase Admin SDK is initialized in `src/ai/genkit.ts`.
// We can safely get the firestore instance here.
const db = admin.firestore();

// This function is called from the client component.
export async function getPartners(): Promise<Partner[]> {
  console.log('Executing getPartners on the server...');
  try {
    const partnersCollection = db.collection('partners');
    const partnerSnapshot = await partnersCollection.get();
    
    if (partnerSnapshot.empty) {
      return [];
    }

    const partnersList = partnerSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure nested objects and dates are handled correctly
      return {
        id: doc.id,
        ...data,
        industry: data.industry || null,
        location: data.location || { city: '', state: '' },
        stats: data.stats || {},
        businessProfile: data.businessProfile || null,
        aiMemory: data.aiMemory || null,
        joinedDate: data.joinedDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Partner;
    });

    console.log(`Fetched ${partnersList.length} partners.`);
    return partnersList;
  } catch (error) {
    console.error("Error in getPartners:", error);
    throw new Error(`Failed to fetch partners: ${(error as Error).message}`);
  }
}
