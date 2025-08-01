import PartnerHeader from "@/components/partner/PartnerHeader";
import TaskBoard from "@/components/partner/TaskBoard";

export default function PartnerTasksPage() {
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
