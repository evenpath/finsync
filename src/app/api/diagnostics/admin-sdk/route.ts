// src/app/api/diagnostics/admin-sdk/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';

export async function GET() {
  try {
    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin SDK is not initialized.',
        details: 'The `adminAuth` object from `firebase-admin` is not available. This usually happens when environment variables are missing or incorrect.',
        fix: 'Check your server environment variables (`.env.local` or hosting configuration) for FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and NEXT_PUBLIC_FIREBASE_PROJECT_ID.'
      }, { status: 500 });
    }

    // A simple, low-impact operation to verify the SDK can communicate with Firebase services.
    await adminAuth.listUsers(1);

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is initialized and connected.',
      details: 'Successfully authenticated with Firebase services using the provided credentials.'
    });
  } catch (error: any) {
    let message = 'An unexpected error occurred while testing the Admin SDK.';
    let fix = 'Check your service account permissions in the Google Cloud IAM console.';

    if (error.code === 'auth/insufficient-permission') {
        message = 'The service account has insufficient permissions to list users.';
        fix = "Add the 'Firebase Authentication Admin' or 'Firebase Admin SDK Administrator Service Agent' role to your service account in the IAM console.";
    } else if (error.code) {
        message = `A Firebase error occurred: ${error.code}.`;
    }

    return NextResponse.json({
      success: false,
      message: message,
      details: error.message,
      fix: fix
    }, { status: 500 });
  }
}
