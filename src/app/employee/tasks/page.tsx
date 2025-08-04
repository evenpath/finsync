// src/app/employee/tasks/page.tsx
"use client";

import React from 'react';
import EmployeeTasks from '@/components/employee/EmployeeTasks';
import PartnerHeader from '@/components/partner/PartnerHeader';

export default function EmployeeTasksPage() {
  return (
    <div className="space-y-6">
        <PartnerHeader
            title="My Tasks"
            subtitle="All tasks assigned to you in this workspace."
        />
        <div className="p-6">
            <EmployeeTasks />
        </div>
    </div>
  );
}
