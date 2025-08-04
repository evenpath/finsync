// src/lib/firebase-admin.ts
import 'server-only';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App;
let db: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, '\n');
}

// This pattern ensures that the SDK is initialized only once.
if (admin.apps.length === 0) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (privateKey && clientEmail && projectId) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formatPrivateKey(privateKey),
        }),
        projectId,
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      // Throw an error if essential variables are missing.
      // This prevents the application from running in a broken state.
      throw new Error(
        'Firebase Admin credentials not found. Ensure FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set in your environment.'
      );
    }
  } catch (error: any) {
    console.error("CRITICAL: Error initializing Firebase Admin SDK:", error.message);
    // Re-throw the error to halt initialization if it fails
    throw error;
  }
} else {
  app = admin.apps[0]!;
}

// @ts-ignore - This allows db and adminAuth to be uninitialized if creds are missing.
if (app!) {
  db = getFirestore(app);
  adminAuth = getAuth(app);
}

export { db, adminAuth };
