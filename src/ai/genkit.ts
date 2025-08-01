import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/firebase-admin-config';

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return;
    }
    try {
        if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
            });
            console.log("Firebase Admin SDK initialized successfully.");
        } else {
            console.warn("Firebase Admin SDK credentials are not fully set in firebase-admin-config.ts. Server-side functionality will be limited.");
        }
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.message);
    }
}

export function getDb() {
  if (!admin.apps.length) {
    initializeFirebaseAdmin();
  }
  if (!admin.apps.length) {
     throw new Error("Firebase Admin not initialized, Firestore is not available. Please check server logs and your service account configuration.");
  }
  return admin.firestore();
}

export const db = getDb();

export const ai = genkit({
  plugins: [googleAI()],
});
