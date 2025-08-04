// src/app/employee/tasks/page.tsx
"use client";

import React from 'react';
import EmployeeTasks from '@/components/employee/EmployeeTasks';

export default function EmployeeTasksPage() {
  return (
    <div className="space-y-6">
        <EmployeeTasks />
    </div>
  );
}
