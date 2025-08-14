
// src/app/admin/system/page.tsx
import React from 'react';
import { Metadata } from 'next';
import MigrationTools from '../../../components/admin/MigrationTools';

export const metadata: Metadata = {
  title: 'System Management | Admin Dashboard',
  description: 'System administration and migration tools',
};

export default function SystemManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Management</h1>
        <p className="text-muted-foreground">
          Administrative tools for system maintenance and data migration.
        </p>
      </div>
      
      <MigrationTools />
    </div>
  );
}
