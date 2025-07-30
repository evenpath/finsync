import PartnerHeader from "@/components/partner/PartnerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function PartnerTasksPage() {
  return (
    <>
      <PartnerHeader
        title="Task Overview"
        subtitle="Monitor all tasks within your workspace."
      />
      <main className="flex-1 overflow-auto p-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Target />
                    Task Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This is where you will manage and track all tasks assigned to your team members. A detailed task tracking interface will be implemented here.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
