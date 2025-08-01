// src/lib/firebase-admin.ts
import 'server-only';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App | null = null;
let db: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
    ? Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64,
        'base64'
      ).toString('utf-8')
    : null;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (admin.apps.length === 0) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      app = admin.apps[0];
    }
  } else {
    console.warn(
      'Firebase Admin credentials not found in FIREBASE_SERVICE_ACCOUNT_JSON_BASE64. App will run in mock mode. Please set this environment variable for a full backend experience.'
    );
  }
} catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
}


if (app) {
  db = getFirestore(app);
  adminAuth = getAuth(app);
}

export { db, adminAuth };