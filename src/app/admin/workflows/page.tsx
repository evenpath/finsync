// src/app/admin/workflows/page.tsx
"use client";

import React, { useState } from 'react';
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { suggestWorkflowSteps, SuggestWorkflowStepsOutput } from '@/ai/flows/suggest-workflow-steps';
import { Sparkles, Loader2 } from 'lucide-react';
import WorkflowTemplateGrid from '@/components/admin/WorkflowTemplateGrid';
import type { WorkflowTemplate } from '@/lib/types';
import ChatWorkflowBuilder from '@/components/admin/ChatWorkflowBuilder';

export default function AdminWorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [currentView, setCurrentView] = useState<'grid' | 'builder'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [initialWorkflow, setInitialWorkflow] = useState<SuggestWorkflowStepsOutput | null>(null);

  const { toast } = useToast();

  const handleGenerateWorkflow = async () => {
    if (!problemDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description is empty',
        description: 'Please describe the problem you want to solve.',
      });
      return;
    }

    setIsGenerating(true);
    setInitialWorkflow(null);

    try {
      const result = await suggestWorkflowSteps({ workflowDescription: problemDescription });
      setInitialWorkflow(result);
      setIsCreateModalOpen(false);
      setCurrentView('builder');
    } catch (error) {
      console.error("Workflow generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI could not generate a workflow. Please try again.",
      });
    } finally {
      setIsGenerating(false);
      setProblemDescription('');
    }
  };

  const handleSaveWorkflow = (workflow: WorkflowTemplate) => {
    setTemplates(prev => [...prev, workflow]);
    setCurrentView('grid');
    setInitialWorkflow(null);
    toast({
        title: "Workflow Saved!",
        description: `The "${workflow.title}" template has been created.`,
    });
  }

  const handleCancelBuilder = () => {
    setCurrentView('grid');
    setInitialWorkflow(null);
  }

  if (currentView === 'builder') {
    return <ChatWorkflowBuilder initialData={initialWorkflow} onSave={handleSaveWorkflow} onCancel={handleCancelBuilder} />;
  }

  return (
    <>
      <AdminHeader
        title="Workflow Templates"
        subtitle="Create and manage AI-powered workflow templates."
      />
      <main className="flex-1 overflow-auto p-6">
        <WorkflowTemplateGrid 
            templates={templates} 
            onTemplateSelect={(template) => console.log("Template selected:", template)}
            onCreateNew={() => {
                setProblemDescription('');
                setIsCreateModalOpen(true);
            }}
        />
      </main>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-500"/>
              Create a New AI Workflow
            </DialogTitle>
            <DialogDescription>
              Describe a business process, and our AI will design a workflow for you to customize. The more detail, the better the result.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="problem-description">Problem Description</Label>
            <Textarea
              id="problem-description"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full mt-2"
              rows={8}
              placeholder="e.g., We handle emergency maintenance for rental properties. When a tenant reports an urgent issue like a water leak, we need to get manager approval within 5 minutes, immediately dispatch an on-call tech via SMS, and then notify all property supervisors. For less urgent issues, we need a different process..."
            />
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateWorkflow} disabled={isGenerating}>
              {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Workflow</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
