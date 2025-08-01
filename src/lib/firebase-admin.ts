
// src/lib/firebase-admin.ts
import 'server-only';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { serviceAccount } from './firebase-admin-config';

// This file is the single source of truth for the initialized Firebase Admin SDK.
// By centralizing it here, we ensure it's initialized only once.

const isInitialized = admin.apps.length > 0;

if (!isInitialized) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
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
