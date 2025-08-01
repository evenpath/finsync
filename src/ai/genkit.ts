// src/ai/genkit.ts (modified)
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

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
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    // Validate that the required environment variables are present
    if (!projectId || !privateKey || !clientEmail) {
      const missingVars = [];
      if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
      if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');

      throw new Error(`Missing required Firebase Admin credentials in .env file: ${missingVars.join(', ')}`);
    }

    // Correctly format the private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: formattedPrivateKey,
        clientEmail,
      }),
      databaseURL: `https://${projectId}.firebaseio.com`,
    });
    
    console.log("Firebase Admin SDK initialized successfully.");
    isFirebaseAdminInitialized = true;

  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Throwing an error here is important to stop execution if initialization fails.
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
      `getDb() error: "Firebase Admin not initialized, Firestore is not available. ${error.message}. Please check your Firebase Admin credentials in your .env file."`
    );
    console.error(enhancedError.message);
    throw enhancedError;
  }
}

export const ai = genkit({
  plugins: [googleAI()],
});
