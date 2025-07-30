import PartnerHeader from "@/components/partner/PartnerHeader";
import TaskBoard from "@/components/partner/TaskBoard";

export default function PartnerTasksPage() {
  return (
    <>
      <PartnerHeader
        title="Task Board"
        subtitle="Visualize and manage your team's workflow."
      />
      <main className="flex-1 overflow-x-auto">
        <TaskBoard />
      </main>
    </>
  );
}
