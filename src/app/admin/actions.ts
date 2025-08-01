// src/app/admin/actions.ts
'use server';

import * as admin from 'firebase-admin';

// Ensure you have the necessary environment variables in a .env.local file
// NEXT_PUBLIC_FIREBASE_PROJECT_ID
// FIREBASE_CLIENT_EMAIL
// FIREBASE_PRIVATE_KEY

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key must be properly formatted. Replace \\n with \n
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully in Server Action.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error in Server Action:", error);
  }
}

const db = admin.firestore();

interface DataItem {
  id: string;
  [key: string]: any;
}

/**
 * Fetches all documents from the 'data' collection in Firestore using the Admin SDK.
 * This is a Next.js Server Action.
 *
 * @returns {Promise<{data: DataItem[] | null, error: string | null}>} An object containing the data or an error message.
 */
export async function getData(): Promise<{data: DataItem[] | null, error: string | null}> {
  console.log("Attempting to fetch data with Admin SDK via Server Action...");

  if (!admin.apps.length) {
    const errorMessage = "Firebase Admin SDK is not initialized.";
    console.error(errorMessage);
    return { data: null, error: errorMessage };
  }

  try {
    const dataRef = db.collection('data');
    const snapshot = await dataRef.get();

    if (snapshot.empty) {
      console.log('No documents found in "data" collection.');
      return { data: [], error: null };
    }

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Successfully fetched ${data.length} documents via Server Action.`);
    return { data, error: null };

  } catch (error) {
    console.error("Error in getData Server Action:", error);
    const err = error as Error;
    // It's better to return a generic error message to the client
    return { data: null, error: `Failed to fetch data: ${err.message}` };
  }
}
