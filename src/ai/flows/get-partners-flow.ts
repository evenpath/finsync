'use server';

/**
 * @fileOverview A Genkit flow for fetching all partners from Firestore.
 * If the partners collection is empty, it will be seeded with mock data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';
import { GetPartnersOutputSchema, Partner } from '@/lib/types';
import { mockPartners } from '@/lib/mockData';

// This function will be called by the client component.
export async function getPartners(): Promise<z.infer<typeof GetPartnersOutputSchema>> {
  return getPartnersFlow();
}

// Define the Genkit flow.
const getPartnersFlow = ai.defineFlow(
  {
    name: 'getPartnersFlow',
    outputSchema: GetPartnersOutputSchema,
  },
  async () => {
    // Ensure Firebase Admin is initialized (idempotent)
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.firestore();
    
    console.log('Fetching partners from Firestore...');
    try {
      const partnersRef = db.collection('partners');
      let snapshot = await partnersRef.get();

      // If the collection is empty, seed it with mock data.
      if (snapshot.empty) {
        console.log('Partners collection is empty. Seeding with mock data...');
        const writeBatch = db.batch();
        // NOTE: We are using mockPartners which do not have id fields.
        // Firestore will auto-generate IDs.
        mockPartners.forEach(partner => {
          // Create a new ref for each partner to get a new auto-generated ID
          const newPartnerRef = partnersRef.doc();
          // We are explicitly casting here. A more robust solution might validate/transform the mock data.
          writeBatch.set(newPartnerRef, partner as any);
        });
        await writeBatch.commit();
        console.log('Mock data seeded successfully.');

        // Re-fetch the data after seeding.
        snapshot = await partnersRef.get();
      }
      
      const partners: Partner[] = [];
      snapshot.forEach(doc => {
        // Important: We add the document ID to our partner object
        partners.push({ id: doc.id, ...doc.data() } as Partner);
      });
      
      console.log(`Fetched ${partners.length} partners.`);
      return partners;

    } catch (error) {
      console.error('Error in getPartnersFlow:', error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }
);
