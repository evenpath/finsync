import PartnerHeader from "@/components/partner/PartnerHeader";
import PartnerAnalytics from "@/components/partner/PartnerAnalytics";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PartnerAnalyticsPage() {
  return (
    <>
      <PartnerHeader
        title="Workspace Analytics"
        subtitle="Performance insights for your clients, workflows, and team."
        actions={
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <PartnerAnalytics />
      </main>
    </>
  );
}
