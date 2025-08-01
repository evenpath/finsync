// src/lib/firebase-admin.ts
import 'server-only';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App;
let db: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

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
      // Fallback to mock/dummy initialization if needed, or just leave uninitialized
      // For this case, we expect an error if used without real creds.
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
} else {
  app = admin.apps[0]!;
}

// @ts-ignore
if (app) {
  db = getFirestore(app);
  adminAuth = getAuth(app);
} else {
    // This will cause the flows to fail with a clear message if initialization failed.
    // @ts-ignore
    db = null;
    // @ts-ignore
    adminAuth = null;
}


export { db, adminAuth };
