// src/ai/flows/get-data-flow.ts
'use server';

/**
 * @fileOverview A server-side function to fetch all documents from the 'data' collection.
 * This uses the Firebase Admin SDK, which bypasses security rules.
 *
 * - getData - Fetches all documents from the 'data' collection.
 */

import { db } from '@/ai/genkit'; // Use the initialized admin instance

interface DataItem {
  id: string;
  [key: string]: any;
}

/**
 * Fetches all documents from the 'data' collection in Firestore using the Admin SDK.
 *
 * @returns {Promise<DataItem[]>} A promise that resolves to an array of documents.
 */
export async function getData(): Promise<DataItem[]> {
  console.log("Attempting to fetch data with Admin SDK...");

  try {
    const dataRef = db.collection('data');
    const snapshot = await dataRef.get();

    if (snapshot.empty) {
      console.log('No documents found in "data" collection.');
      return [];
    }

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Successfully fetched ${data.length} documents.`);
    return data;

  } catch (error) {
    console.error("Error in getData with Admin SDK:", error);
    // Cast to error to satisfy typescript
    const err = error as Error;
    throw new Error(`Failed to fetch data via Admin SDK: ${err.message}`);
  }
}
