import AdminHeader from "@/components/admin/AdminHeader";
import WorkflowTemplates from "@/components/admin/WorkflowTemplates";

export default function AdminWorkflowsPage() {
  return (
    <>
      <AdminHeader
        title="Workflow Templates"
        subtitle="Create and manage global AI workflow templates."
      />
      <main className="flex-1 overflow-auto p-6">
        <WorkflowTemplates />
      </main>
    </>
  );
}
