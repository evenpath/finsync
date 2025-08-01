import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/firebase-admin-config';


// This function ensures that Firebase Admin is initialized, but only once.
function initializeFirebaseAdmin() {
    // Check if the app is already initialized to prevent errors.
    if (admin.apps.length > 0) {
        return;
    }
    
    // Check for essential service account properties before attempting to initialize.
    if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
            });
            console.log("Firebase Admin SDK initialized successfully.");
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
            // Throwing an error here is important to stop execution if initialization fails.
            throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
        }
    } else {
        // This warning is crucial for debugging missing environment variables.
        console.warn("Firebase Admin SDK credentials are not fully set in firebase-admin-config.ts. Server-side functionality will be limited.");
    }
}


/**
 * Gets the Firestore database instance, initializing the Firebase Admin SDK if not already done.
 * This "lazy initialization" pattern is robust and prevents race conditions.
 * @returns {admin.firestore.Firestore} The Firestore database instance.
 */
export function getDb(): admin.firestore.Firestore {
  initializeFirebaseAdmin();
  
  // After attempting initialization, we check again. If it's still not initialized, something is wrong.
  if (admin.apps.length === 0 || !admin.apps[0]) {
    // This error will be caught by pages/services that try to use the DB
    throw new Error("Firebase Admin not initialized, Firestore is not available. Please check server logs and your service account configuration.");
  }
  return admin.firestore();
}

export const ai = genkit({
  plugins: [googleAI()],
});
