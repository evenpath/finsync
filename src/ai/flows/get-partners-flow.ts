'use server';

/**
 * @fileOverview A Genkit flow for fetching all partners from Firestore.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import {GetPartnersOutputSchema} from '@/lib/types';

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export async function getPartners(): Promise<z.infer<typeof GetPartnersOutputSchema>> {
  return getPartnersFlow();
}

const getPartnersFlow = ai.defineFlow(
  {
    name: 'getPartnersFlow',
    outputSchema: GetPartnersOutputSchema,
  },
  async () => {
    console.log('Fetching partners from Firestore...');
    try {
      const partnersRef = db.collection('partners');
      const snapshot = await partnersRef.get();
      if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
      }
      
      const partners: any[] = [];
      snapshot.forEach(doc => {
        partners.push({id: doc.id, ...doc.data()});
      });
      
      console.log(`Fetched ${partners.length} partners.`);
      return partners;

    } catch (error) {
      console.error('Error fetching partners from Firestore:', error);
      // It's better to let the error propagate to be handled by the caller
      // but for debugging, we log it here.
      throw error;
    }
  }
);
