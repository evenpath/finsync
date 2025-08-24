"use client";

import React from 'react';
import EmployeeTasks from '../../../components/employee/EmployeeTasks';

export default function EmployeeTasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Tasks</h1>
          <p className="text-muted-foreground">
            View and manage your assigned tasks from all workspaces
          </p>
        </div>

        {/* Employee Tasks Component */}
        <EmployeeTasks />
      </div>
    </div>
  );
}