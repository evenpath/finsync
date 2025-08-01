'use server';

/**
 * @fileOverview A secure Genkit flow to fetch all partner documents from Firestore.
 * This flow is intended to be called from the admin client.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, getDocs } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { Partner } from '@/lib/types';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

export const GetPartnersOutputSchema = z.array(z.any());
export type GetPartnersOutput = z.infer<typeof GetPartnersOutputSchema>;

async function fetchPartnersFromFirestore(): Promise<Partner[]> {
  const partnersCollection = collection(db, 'partners');
  const partnerSnapshot = await getDocs(partnersCollection);
  
  if (partnerSnapshot.empty) {
    return [];
  }

  const partnersList = partnerSnapshot.docs.map(doc => {
    const data = doc.data();
    // Ensure nested objects and dates are handled correctly
    return {
      id: doc.id,
      ...data,
      // Manually cast to ensure type safety, especially for nested objects
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

  return partnersList;
}

export const getPartnersFlow = ai.defineFlow(
  {
    name: 'getPartnersFlow',
    inputSchema: z.void(),
    outputSchema: GetPartnersOutputSchema,
  },
  async () => {
    console.log('Executing getPartnersFlow on the server...');
    try {
      const partners = await fetchPartnersFromFirestore();
      console.log(`Fetched ${partners.length} partners.`);
      return partners;
    } catch (error) {
      console.error("Error in getPartnersFlow:", error);
      // It's better to throw the error to be handled by the caller
      // Or return a structured error response
      throw new Error(`Failed to fetch partners: ${(error as Error).message}`);
    }
  }
);

// Wrapper function to be called from the client component.
export async function getPartners(): Promise<Partner[]> {
  return await getPartnersFlow();
}
