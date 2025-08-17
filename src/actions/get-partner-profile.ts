'use server';

import { db } from '../lib/firebase-admin';
import type { Partner } from '../lib/types';

export async function getPartnerProfileAction(partnerId: string): Promise<{
  success: boolean;
  message: string;
  partner?: Partner;
}> {
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  if (!partnerId) {
    return {
      success: false,
      message: "Partner ID is required"
    };
  }

  try {
    console.log('Fetching partner profile for ID:', partnerId);
    
    const partnerRef = db.collection('partners').doc(partnerId);
    const partnerDoc = await partnerRef.get();
    
    if (!partnerDoc.exists) {
      console.log('Partner document not found for ID:', partnerId);
      return {
        success: false,
        message: "Partner profile not found"
      };
    }

    const partnerData = partnerDoc.data();
    console.log('Found partner data:', partnerData?.name || partnerData?.businessName);
    
    // Convert timestamps to strings
    const partner: Partner = {
      id: partnerDoc.id,
      ...partnerData,
      createdAt: partnerData?.createdAt?.toDate ? partnerData.createdAt.toDate().toISOString() : partnerData?.createdAt,
      updatedAt: partnerData?.updatedAt?.toDate ? partnerData.updatedAt.toDate().toISOString() : partnerData?.updatedAt,
      joinedDate: partnerData?.joinedDate?.toDate ? partnerData.joinedDate.toDate().toISOString() : partnerData?.joinedDate,
    } as Partner;

    return {
      success: true,
      message: "Partner profile retrieved successfully",
      partner
    };

  } catch (error: any) {
    console.error('Error fetching partner profile:', error);
    return {
      success: false,
      message: `Failed to fetch partner profile: ${error.message}`
    };
  }
}