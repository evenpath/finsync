// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/firebase-admin-config';

// Global flag to ensure Firebase is initialized only once
let isFirebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (isFirebaseAdminInitialized) {
    return;
  }

  // Prevent re-initialization if a Firebase app is already configured
  if (admin.apps.length > 0) {
    isFirebaseAdminInitialized = true;
    return;
  }

  try {
    // Check if the service account has the necessary properties
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error(
        'Service account is missing necessary properties (project_id, private_key, client_email). ' +
        'Please check your firebase-admin-config.ts file.'
      );
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
    
    console.log("Firebase Admin SDK initialized successfully.");
    isFirebaseAdminInitialized = true;

  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Throw an error to stop execution if initialization fails.
    throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
  }
}

/**
 * Gets the Firestore database instance, initializing Firebase Admin if needed.
 * This function ensures that initialization is attempted only once and provides clear errors.
 * @returns {admin.firestore.Firestore} The Firestore database instance.
 */
export function getDb(): admin.firestore.Firestore {
  try {
    initializeFirebaseAdmin();
    // After initialization, check if we have a valid app instance.
    if (!admin.apps.length || !admin.apps[0]) {
      // This error will be caught by pages/services that try to use the DB
      throw new Error("Firebase Admin not initialized, Firestore is not available. Please check server logs and your service account configuration.");
    }
    return admin.firestore();
  } catch (error: any) {
    const enhancedError = new Error(
      `getDb() error: "Firebase Admin not initialized, Firestore is not available. ${error.message}. Please check your Firebase Admin credentials in your service account configuration."`
    );
    console.error(enhancedError.message);
    throw enhancedError;
  }
}

export const ai = genkit({
  plugins: [googleAI()],
});
