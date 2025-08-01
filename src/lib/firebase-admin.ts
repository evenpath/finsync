// src/lib/firebase-admin.ts
import 'server-only';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let db: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
    // Check if the app is already initialized
    if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
            // Decode the Base64 service account key
            const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
            const serviceAccount = JSON.parse(serviceAccountJson);

            // Initialize the Firebase Admin SDK
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin SDK initialized successfully.");
        } else {
            console.warn("Firebase Admin credentials not found. Using mock data. Please set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 in your .env file for a full backend experience.");
        }
    }
    // Get the Firestore and Auth instances if the app was initialized
    if (admin.apps.length > 0) {
        db = getFirestore();
        adminAuth = getAuth();
    }
} catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Do not throw, allow app to run with mock data, db and adminAuth will be null
}


// Export the initialized services to be used throughout the server-side of the app.
// They can be null if initialization failed.
export { db, adminAuth };
