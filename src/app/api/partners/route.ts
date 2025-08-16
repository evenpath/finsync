// ============================================================================
// 3. src/app/api/partners/route.ts (new)
// ============================================================================
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({
        success: false,
        message: 'Database not available'
      }, { status: 500 });
    }

    const partnersSnapshot = await db.collection('partners').get();
    const partners = partnersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      partners
    });

  } catch (error: any) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch partners"
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, businessName, phone, industry } = body;

    if (!name || !email) {
      return NextResponse.json({
        success: false,
        message: "Name and email are required"
      }, { status: 400 });
    }

    // Create tenant and partner using existing flow
    const { createTenant } = await import('@/ai/flows/create-tenant-flow');
    
    const result = await createTenant({
      partnerName: name,
      email: email
    });

    if (result.success) {
      // Update partner with additional details if provided
      if (db && result.partnerId && (businessName || phone || industry)) {
        try {
          await db.collection('partners').doc(result.partnerId).update({
            businessName: businessName || name,
            phone: phone || '',
            industry: industry || null,
            updatedAt: new Date(),
          });
        } catch (updateError) {
          console.warn("Failed to update partner details:", updateError);
        }
      }

      return NextResponse.json({
        success: true,
        partnerId: result.partnerId,
        tenantId: result.tenantId,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error creating partner:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create partner"
    }, { status: 500 });
  }
}

