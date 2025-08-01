// src/lib/firebase-admin.ts
import 'server-only';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let db: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
    if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
            const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
            const serviceAccount = JSON.parse(serviceAccountJson);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
            });
            console.log("Firebase Admin SDK initialized successfully.");
            db = getFirestore();
            adminAuth = getAuth();
        } else {
            console.warn("Firebase Admin credentials not found. Using mock data. Please set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 in your .env file for a full backend experience.");
        }
    } else {
        db = getFirestore();
        adminAuth = getAuth();
    }
} catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Do not throw, allow app to run with mock data
}


// Export the initialized services to be used throughout the server-side of the app.
// They can be null if initialization failed.
export { db, adminAuth };
