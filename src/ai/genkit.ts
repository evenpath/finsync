import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/firebase-admin-config';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if the essential service account properties are available
    if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } else {
      console.warn("Firebase Admin SDK credentials are not fully set in firebase-admin-config.ts. Server-side functionality will be limited.");
    }
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}

export const ai = genkit({
  plugins: [googleAI()],
});

// Export a function to get the database instance
export function getDb() {
  if (admin.apps.length === 0) {
    throw new Error("Firebase Admin not initialized, Firestore is not available. Please check server logs and your service account configuration.");
  }
  return admin.firestore();
}

// For backwards compatibility with existing files that import 'db' directly.
// This might be null if initialization failed.
export const db = admin.apps.length ? admin.firestore() : null;
