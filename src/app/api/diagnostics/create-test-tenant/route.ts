
// src/app/api/diagnostics/create-test-tenant/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

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

    const testTenantId = `test-${Date.now()}`;
    
    // Create test tenant
    const tenant = await adminAuth.tenantManager().createTenant({
      displayName: `test-diagnostic-tenant`,
    });

    // Immediately delete the test tenant
    await adminAuth.tenantManager().deleteTenant(tenant.tenantId);

    return NextResponse.json({
      success: true,
      message: 'Tenant creation test successful',
      details: `Created and deleted test tenant: ${tenant.tenantId}`
    });
  } catch (error: any) {
    if (error.code === 'auth/insufficient-permission' || (error.message && error.message.includes('permission'))) {
      if (error.message && error.message.includes('serviceusage.services.use')) {
         return NextResponse.json({
            success: false,
            message: 'Missing "Service Usage Consumer" role',
            details: `Your service account needs this role to verify if APIs like Identity Platform are enabled. Error: ${error.message}`
        });
      }
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to create tenants',
        details: `Service account needs "Identity Platform Admin" or "Firebase Admin SDK Administrator" role. Error: ${error.message}`
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
