// src/app/admin/workflows/page.tsx
import AdminHeader from "../../../components/admin/AdminHeader";
import { Card, CardContent } from "../../../components/ui/card";
import { Zap } from "lucide-react";

export default function AdminWorkflowsPage() {
  return (
    <>
      <AdminHeader
        title="Workflow Management"
        subtitle="Create and manage global workflow templates."
      />
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="p-10 text-center">
            <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Under Construction</h2>
            <p className="text-muted-foreground mt-2">
              This section for managing global workflow templates is currently being built.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
