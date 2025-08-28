// src/app/admin/workflows/page.tsx
import AdminHeader from "../../../components/admin/AdminHeader";
import { Card, CardContent } from "../../../components/ui/card";
import { Zap, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import Link from 'next/link';

export default function AdminWorkflowsPage() {
  return (
    <>
      <AdminHeader
        title="Workflow Management"
        subtitle="Create and manage global workflow templates."
        actions={
          <Button asChild>
            <Link href="/admin/workflows/builder">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Link>
          </Button>
        }
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
