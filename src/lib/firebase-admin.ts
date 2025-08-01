
// src/lib/firebase-admin.ts
import 'server-only';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const isInitialized = admin.apps.length > 0;

if (!isInitialized) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is not set. Please encode your service account JSON to Base64 and add it to your .env file.');
    }

    const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // In a production environment, you might want to handle this more gracefully,
    // but for now, we'll throw to make it clear that configuration is needed.
    throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}. Please check your service account credentials.`);
  }
}

// Export the initialized services to be used throughout the server-side of the app.
export const db = getFirestore();
export const adminAuth = getAuth();
export const adminApp = admin.app();
