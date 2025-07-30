import PartnerHeader from "@/components/partner/PartnerHeader";
import PartnerDashboard from "@/components/partner/PartnerDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PartnerHomePage() {
  return (
    <>
      <PartnerHeader
        title="Dashboard"
        subtitle="Overview of your workspace activities and performance."
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Quick Action
          </Button>
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <PartnerDashboard />
      </main>
    </>
  );
}
