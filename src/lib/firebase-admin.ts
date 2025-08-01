// src/lib/firebase-admin.ts
import 'server-only';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App;
let db: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

// This pattern ensures that the SDK is initialized only once.
if (admin.apps.length === 0) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
      ? Buffer.from(
          process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
          'base64'
        ).toString('utf-8')
      : null;

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn(
        'Firebase Admin credentials not found. App will run in a limited mode. Please set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable for full functionality.'
      );
      // Fallback to a "not initialized" state which can be checked in services.
    }
  } catch (error: any) {
    console.error("Error initializing Firebase Admin SDK:", error.message);
  }
} else {
  app = admin.apps[0]!;
}

// @ts-ignore - This allows db and adminAuth to be uninitialized if creds are missing.
// Services that use them will check for their existence and handle the error gracefully.
if (app!) {
  db = getFirestore(app);
  adminAuth = getAuth(app);
}

export { db, adminAuth };
