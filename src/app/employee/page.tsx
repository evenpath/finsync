// src/app/employee/page.tsx
"use client";

import React from 'react';
import WorkerDashboard from '@/components/worker/WorkerDashboard';

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <WorkerDashboard />
    </div>
  );
}
