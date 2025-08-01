import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import {config} from 'dotenv';

config(); // Load environment variables from .env file

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
       console.error("Firebase Admin SDK credentials are not set in .env file. Some server-side functionality will not work.");
    } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
          databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        console.log("Firebase Admin SDK initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}


export const ai = genkit({
  plugins: [googleAI()],
});

// Export a function to get the database instance
// This ensures that db is only accessed where admin has been successfully initialized.
export function getDb() {
  if (admin.apps.length === 0) {
    // Return a mock or limited-functionality db instance if you want the app to run without full backend
    // For now, we throw an error or handle it as best as we can.
    console.error("Firebase Admin not initialized, Firestore is not available.");
    // Depending on the use case, you might return null or a mock object.
    // For this app, we'll proceed, and individual calls will fail, which is captured in components.
  }
  return admin.firestore();
}

// For backwards compatibility with existing files that import 'db' directly.
export const db = admin.apps.length ? admin.firestore() : null;
