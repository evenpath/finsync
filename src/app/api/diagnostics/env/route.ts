
// src/app/api/diagnostics/env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY', 
      'FIREBASE_CLIENT_EMAIL'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    const present = requiredVars.filter(varName => process.env[varName]);

    if (missing.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All required environment variables are present',
        details: `Present: ${present.join(', ')}`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Missing ${missing.length} required environment variables`,
        details: `Missing: ${missing.join(', ')}`
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check environment variables',
      details: error.message
    });
  }
}

// src/app/api/diagnostics/admin-sdk/route.ts
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin SDK is not initialized',
        details: 'Check your environment variables and service account configuration'
      });
    }

    // Test a simple operation to verify SDK works
    await adminAuth.listUsers(1);

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      details: 'Successfully connected to Firebase Auth'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Firebase Admin SDK error',
      details: error.message
    });
  }
}

// src/app/api/diagnostics/multi-tenancy/route.ts
export async function GET() {
  try {
    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin SDK not initialized',
        details: 'Cannot test multi-tenancy without Admin SDK'
      });
    }

    // Test if we can access tenant manager
    const tenantManager = adminAuth.tenantManager();
    
    // Try to list tenants (this will fail if multi-tenancy is not enabled)
    await tenantManager.listTenants(1);

    return NextResponse.json({
      success: true,
      message: 'Multi-tenancy is enabled and working',
      details: 'Successfully accessed tenant manager'
    });
  } catch (error: any) {
    if (error.message.includes('multi-tenancy')) {
      return NextResponse.json({
        success: false,
        message: 'Multi-tenancy is not enabled',
        details: 'Enable Identity Platform and multi-tenancy in Google Cloud Console'
      });
    } else if (error.code === 'auth/insufficient-permission') {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions for multi-tenancy',
        details: 'Service account needs Identity Platform Admin role'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Multi-tenancy test failed',
        details: error.message
      });
    }
  }
}

// src/app/api/diagnostics/create-test-tenant/route.ts
export async function POST(request: Request) {
  try {
    const { partnerName } = await request.json();

    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        message: 'Firebase Admin SDK not initialized',
        details: 'Cannot create tenant without Admin SDK'
      });
    }

    // Create test tenant
    const tenant = await adminAuth.tenantManager().createTenant({
      displayName: `test-${Date.now()}`,
      emailSignInConfig: {
        enabled: true,
        passwordRequired: true,
      },
    });

    // Immediately delete the test tenant
    await adminAuth.tenantManager().deleteTenant(tenant.tenantId);

    return NextResponse.json({
      success: true,
      message: 'Tenant creation test successful',
      details: `Created and deleted test tenant: ${tenant.tenantId}`
    });
  } catch (error: any) {
    if (error.code === 'auth/insufficient-permission') {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to create tenants',
        details: 'Service account needs Firebase Admin SDK Administrator role'
      });
    } else if (error.message.includes('serviceusage.services.use')) {
      return NextResponse.json({
        success: false,
        message: 'Missing Service Usage Consumer role',
        details: 'Add Service Usage Consumer role to your service account'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Tenant creation failed',
        details: error.message
      });
    }
  }
}
