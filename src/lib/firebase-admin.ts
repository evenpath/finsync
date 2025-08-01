// src/lib/firebase-admin.ts
import 'server-only';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App | null = null;
let db: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
  } else {
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
        'Firebase Admin credentials not found. Using mock data. Please set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 in your .env file for a full backend experience.'
      );
    }
  }

  if (app) {
    db = getFirestore(app);
    adminAuth = getAuth(app);
  }
}

// Initialize on first import
initializeAdmin();

export { db, adminAuth };
