import PartnerHeader from "@/components/partner/PartnerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function PartnerSettingsPage() {
  return (
    <>
      <PartnerHeader
        title="Workspace Settings"
        subtitle="Manage your workspace preferences."
      />
      <main className="flex-1 overflow-auto p-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Settings />
                    Workspace Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This is where you will configure settings specific to your workspace, such as member permissions, notification preferences, and integrations.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
