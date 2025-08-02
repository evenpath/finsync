// ============================================================================
// 4. src/app/api/partners/[partnerId]/route.ts (new)
// ============================================================================
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: { partnerId: string } }
) {
  try {
    if (!db) {
      return NextResponse.json({
        success: false,
        message: 'Database not available'
      }, { status: 500 });
    }

    const partnerRef = db.collection('partners').doc(params.partnerId);
    const doc = await partnerRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Partner not found'
      }, { status: 404 });
    }

    const partner = {
      id: doc.id,
      ...doc.data()
    };

    return NextResponse.json({
      success: true,
      partner
    });

  } catch (error: any) {
    console.error("Error fetching partner:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch partner"
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { partnerId: string } }
) {
  try {
    if (!db) {
      return NextResponse.json({
        success: false,
        message: 'Database not available'
      }, { status: 500 });
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated via API
    delete updateData.id;
    delete updateData.tenantId;
    delete updateData.createdAt;

    const partnerRef = db.collection('partners').doc(params.partnerId);
    await partnerRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Partner updated successfully'
    });

  } catch (error: any) {
    console.error("Error updating partner:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update partner"
    }, { status: 500 });
  }
}
