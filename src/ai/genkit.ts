
// src/ai/genkit.ts (modified)
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';

// Global flag to track initialization state
let isInitialized = false;
let initializationError: Error | null = null;

// Check if we're running in emulator mode
function isEmulatorMode(): boolean {
  return process.env.FIRESTORE_EMULATOR_HOST !== undefined || 
         process.env.NODE_ENV === 'development';
}

// Validate environment variables
function validateEnvironmentVariables(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

// This function ensures that Firebase Admin is initialized, but only once.
function initializeFirebaseAdmin(): void {
  // If already initialized (success or failure), return
  if (isInitialized || initializationError) {
    if (initializationError) {
      throw initializationError;
    }
    return;
  }

  // Check if the app is already initialized to prevent duplicate initialization
  if (admin.apps.length > 0) {
    console.log("Firebase Admin SDK already initialized (detected existing app)");
    isInitialized = true;
    return;
  }

  try {
    // In emulator mode, use a simpler initialization
    if (isEmulatorMode()) {
      console.log("Initializing Firebase Admin SDK for emulator mode");
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-app"
      });
      isInitialized = true;
      console.log("Firebase Admin SDK initialized successfully for emulator mode");
      return;
    }

    // Production mode - validate environment variables
    const validation = validateEnvironmentVariables();
    if (!validation.isValid) {
      const errorMessage = `Missing required environment variables: ${validation.missingVars.join(', ')}. Please ensure your Firebase Admin credentials are correctly configured in your .env file.`;
      initializationError = new Error(errorMessage);
      throw initializationError;
    }

    // Extract and validate service account credentials
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;

    // Additional validation for private key format
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      const errorMessage = "FIREBASE_PRIVATE_KEY appears to be malformed. Ensure it includes the complete private key with BEGIN and END markers.";
      initializationError = new Error(errorMessage);
      throw initializationError;
    }

    // Additional validation for client email format
    if (!clientEmail.includes('@') || !clientEmail.includes('.iam.gserviceaccount.com')) {
      const errorMessage = "FIREBASE_CLIENT_EMAIL appears to be malformed. It should be a service account email ending with .iam.gserviceaccount.com";
      initializationError = new Error(errorMessage);
      throw initializationError;
    }

    const serviceAccount = {
      projectId,
      privateKey,
      clientEmail,
    };

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    });

    isInitialized = true;
    console.log("Firebase Admin SDK initialized successfully for production mode");

  } catch (error: any) {
    const errorMessage = `Firebase Admin SDK failed to initialize: ${error.message}`;
    initializationError = new Error(errorMessage);
    console.error("Firebase Admin SDK initialization error:", error);
    throw initializationError;
  }
}

/**
 * Gets the Firestore database instance, initializing the Firebase Admin SDK if not already done.
 * This "lazy initialization" pattern is robust and prevents race conditions.
 * @returns {admin.firestore.Firestore} The Firestore database instance.
 */
export function getDb(): admin.firestore.Firestore {
  try {
    initializeFirebaseAdmin();
    
    // Double-check that we have a valid app
    if (admin.apps.length === 0 || !admin.apps[0]) {
      throw new Error("Firebase Admin not properly initialized");
    }

    const db = admin.firestore();
    
    // If in emulator mode, ensure we're connecting to the emulator
    if (isEmulatorMode() && process.env.FIRESTORE_EMULATOR_HOST) {
      console.log("Connecting to Firestore emulator at:", process.env.FIRESTORE_EMULATOR_HOST);
    }
    
    return db;
    
  } catch (error: any) {
    const enhancedError = new Error(
      `Firebase Admin not initialized, Firestore is not available. ${error.message}. Please check your Firebase Admin credentials in your .env file.`
    );
    console.error("getDb() error:", enhancedError.message);
    throw enhancedError;
  }
}

export const ai = genkit({
  plugins: [googleAI()],
});
