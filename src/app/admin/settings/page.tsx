import AdminHeader from "@/components/admin/AdminHeader";
import AdminSettings from "@/components/admin/AdminSettings";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader
        title="Admin Settings"
        subtitle="Configure system-wide settings and preferences."
        actions={
          <Button>
            <CheckCircle className="w-4 h-4" />
            Save Changes
          </Button>
        }
      />
      <main className="flex-1 overflow-auto p-6">
        <AdminSettings />
      </main>
    </>
  );
}
