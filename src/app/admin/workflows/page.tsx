
// src/app/admin/workflows/page.tsx
"use client";

import React, { useState } from 'react';
import AdminHeader from "@/components/admin/AdminHeader";
import WorkflowTemplateGrid from "@/components/admin/WorkflowTemplateGrid";
import type { WorkflowTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { suggestWorkflowSteps } from '@/ai/flows/suggest-workflow-steps';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AdminWorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleGenerateWorkflow = async () => {
    if (!workflowDescription.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter a description for the workflow.",
        });
        return;
    }
    
    setIsGenerating(true);
    try {
        const result = await suggestWorkflowSteps({ workflowDescription });
        console.log("Generated workflow steps:", result.suggestedSteps);

        // This is where you would typically create a new workflow template object
        // and add it to your state/database.
        // For this example, we'll just show a success toast.
        
        toast({
            title: "Workflow Generated!",
            description: `Successfully generated a workflow with ${result.suggestedSteps.length} steps.`,
        });

        setWorkflowDescription('');
        setIsCreateModalOpen(false);

    } catch (error) {
        console.error("Error generating workflow:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Could not generate workflow steps. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  };


  return (
    <>
      <AdminHeader
        title="Workflow Templates"
        subtitle="Create and manage global AI workflow templates."
      />
      <main className="flex-1 overflow-auto p-6">
        <WorkflowTemplateGrid
          templates={templates}
          onTemplateSelect={(template) => console.log("Selected template:", template)} // Simplified for now
          onCreateNew={handleCreateNew}
        />
      </main>

       {/* Create Workflow Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Sparkles className="text-purple-500" />
                Create a New AI Workflow
            </DialogTitle>
            <DialogDescription>
              Describe the process or problem you want to solve in plain language. The AI will generate the workflow steps for you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="workflow-description" className="font-medium">Describe your workflow</Label>
            <Textarea
              id="workflow-description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="w-full mt-2"
              rows={8}
              placeholder="e.g., 'A workflow to handle customer support requests. First, an AI should categorize the request. If it's urgent, notify the support lead. Otherwise, create a ticket in our system and send an automated confirmation to the customer.'"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isGenerating}>Cancel</Button>
            <Button
              onClick={handleGenerateWorkflow}
              disabled={isGenerating || !workflowDescription.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                </>
              ) : (
                <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Workflow
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
