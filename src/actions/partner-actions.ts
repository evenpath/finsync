// src/actions/partner-actions.ts
'use server';

import { getPartners, seedInitialPartners } from '@/services/partner-service';
import type { Partner } from '@/lib/types';

/**
 * Server action to get all partners.
 * This is the proper way to call server functions from client components.
 */
export async function getPartnersAction(): Promise<Partner[]> {
  try {
    return await getPartners();
  } catch (error: any) {
    console.error("Error in getPartnersAction:", error);
    // In a real app, you might want to return a more specific error object
    return [];
  }
}

/**
 * Server action to seed initial partner data.
 */
export async function seedPartnersAction(): Promise<void> {
    try {
        await seedInitialPartners();
    } catch (error: any) {
        console.error("Error in seedPartnersAction:", error);
        // Handle or throw the error as needed
    }
}
