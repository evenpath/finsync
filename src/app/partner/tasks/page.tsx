// src/app/partner/tasks/page.tsx
"use client";

import PartnerHeader from "../../../components/partner/PartnerHeader";
import TaskBoard from "../../../components/partner/TaskBoard";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";

function PartnerTasksPage() {
  return (
    <>
      <PartnerHeader
        title="Task Overview"
        subtitle="Visualize and manage your team's workflow and assignments."
      />
      <main className="flex-1 overflow-x-auto p-6">
        <TaskBoard />
      </main>
    </>
  );
}

export default function PartnerTasksProtected() {
  return (
    <PartnerAuthWrapper>
      <PartnerTasksPage />
    </PartnerAuthWrapper>
  )
}