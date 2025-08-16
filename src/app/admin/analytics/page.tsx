import AdminHeader from "../../components/admin/AdminHeader";
import SystemAnalytics from "../../components/admin/SystemAnalytics";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <>
      <AdminHeader
        title="System Analytics"
        subtitle="Comprehensive system performance and usage analytics."
        actions={
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <SystemAnalytics />
      </main>
    </>
  );
}
