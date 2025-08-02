
// src/app/admin/workflows/page.tsx
"use client";

import React from 'react';
import AdminHeader from "@/components/admin/AdminHeader";
import ChatWorkflowBuilder from '@/components/admin/ChatWorkflowBuilder';

export default function AdminWorkflowsPage() {
  
  return (
    <>
      <AdminHeader
        title="Workflow Templates"
        subtitle="Create and manage AI-powered workflow templates."
      />
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <ChatWorkflowBuilder />
      </main>
    </>
  );
}
