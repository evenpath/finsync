// src/app/admin/settings/page.tsx
"use client";

import AdminHeader from "../../../components/admin/AdminHeader";
import AdminSettings from "../../../components/admin/AdminSettings";
import MigrationTools from "../../../components/admin/MigrationTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Wrench } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Configure system-wide settings, diagnostics, and data tools."
      />
      <main className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">
              System Settings
            </TabsTrigger>
            <TabsTrigger value="diagnostics">
              <Wrench className="w-4 h-4 mr-2" />
              Diagnostics & Setup
            </TabsTrigger>
             <TabsTrigger value="migration">
              Data Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <iframe src="/admin/diagnostics-embed" className="w-full h-[1200px] border-none rounded-lg"></iframe>
          </TabsContent>

          <TabsContent value="migration">
            <MigrationTools />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
