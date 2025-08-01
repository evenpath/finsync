// src/ai/flows/get-data-flow.ts
'use server';

import * as admin from 'firebase-admin';
import { z } from 'zod';

// Ensure Firebase Admin is initialized (idempotent)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const DataSchema = z.object({
    id: z.string(),
    Name: z.string().optional(),
});

const GetDataOutputSchema = z.array(DataSchema);
export type GetDataOutput = z.infer<typeof GetDataOutputSchema>;

export async function getData(): Promise<GetDataOutput> {
  console.log("Attempting to fetch from 'data' collection...");
  try {
    const dataRef = db.collection('data');
    const snapshot = await dataRef.get();

    if (snapshot.empty) {
      console.log("'data' collection is empty. Returning empty array.");
      return [];
    }

    const data: GetDataOutput = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Successfully fetched ${data.length} documents.`);
    return data;
  } catch (error) {
    console.error("Error in getData:", error);
    throw new Error(`Failed to fetch data: ${(error as Error).message}`);
  }
}
