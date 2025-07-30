import AdminHeader from "@/components/admin/AdminHeader";
import SystemOverview from "@/components/admin/SystemOverview";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader
        title="System Overview"
        subtitle="Monitor system health and performance metrics."
        actions={
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <SystemOverview />
      </main>
    </>
  );
}
