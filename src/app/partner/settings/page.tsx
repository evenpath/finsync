
"use client";

import PartnerHeader from "@/components/partner/PartnerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import PartnerAuthWrapper from "@/components/partner/PartnerAuthWrapper";

function PartnerSettingsPage() {
  return (
    <>
      <PartnerHeader
        title="Workspace Settings"
        subtitle="Manage your workspace, integrations, and billing."
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
                <p className="text-muted-foreground">This is where you will configure settings specific to your workspace, such as API keys for integrations, notification preferences, and billing information.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function PartnerSettingsProtected() {
  return (
    <PartnerAuthWrapper>
      <PartnerSettingsPage />
    </PartnerAuthWrapper>
  )
}
