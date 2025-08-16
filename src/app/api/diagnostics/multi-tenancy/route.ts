// src/app/api/diagnostics/multi-tenancy/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';

export async function GET() {
  try {
    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin SDK not initialized.',
        details: 'Cannot test multi-tenancy without Admin SDK.',
        fix: 'This is a downstream effect of the Admin SDK failing to initialize. Check your environment variables.'
      }, { status: 500 });
    }

    // This command will fail if multi-tenancy is not enabled or if permissions are missing.
    await adminAuth.tenantManager().listTenants(1);

    return NextResponse.json({
      success: true,
      message: 'Multi-tenancy appears to be enabled and accessible.',
      details: 'Successfully made a call to the tenant manager.'
    });

  } catch (error: any) {
    let message = 'An unexpected error occurred while checking for multi-tenancy.';
    let fix = 'Check the error details below and your Identity Platform configuration in the Google Cloud console.';

    if (error.code === 'auth/insufficient-permission' || (error.message && error.message.includes('PERMISSION_DENIED'))) {
      message = 'The service account has insufficient permissions to access tenant information.';
      fix = "Add the 'Identity Platform Admin' role to your service account in the IAM console.";
    } else if (error.message && error.message.includes('Multi-tenancy is not enabled')) {
      message = 'Firebase Multi-Tenancy is not enabled for this project.';
      fix = "Go to your Google Cloud Console, find 'Identity Platform', go to Settings, and enable it.";
    } else if (error.code) {
        message = `A Firebase error occurred: ${error.code}.`;
    }

    return NextResponse.json({
      success: false,
      message: message,
      details: error.message,
      fix: fix,
    }, { status: 500 });
  }
}
