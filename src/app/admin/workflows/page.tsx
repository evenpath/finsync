
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
import { Sparkles, Loader2, Plus, ArrowRight } from 'lucide-react';
import WorkflowTemplateGrid from '@/components/admin/WorkflowTemplateGrid';
import type { WorkflowTemplate } from '@/lib/types';

export default function AdminWorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [suggestedWorkflow, setSuggestedWorkflow] = useState<SuggestWorkflowStepsOutput | null>(null);

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
    setSuggestedWorkflow(null);

    try {
      const result = await suggestWorkflowSteps({ workflowDescription: problemDescription });
      setSuggestedWorkflow(result);
    } catch (error) {
      console.error("Workflow generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI could not generate a workflow. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployWorkflow = () => {
    if (!suggestedWorkflow) return;
    
    // In a real app, this would be a more complex object.
    // For now, we create a basic template object from the suggestion.
    const newTemplate: WorkflowTemplate = {
      id: `wf-${Date.now()}`,
      title: suggestedWorkflow.name,
      description: suggestedWorkflow.description,
      category: 'AI Generated',
      complexity: 'medium',
      steps: suggestedWorkflow.steps.map(s => ({...s, id: s.type, configuration: {}, order: 0, isRequired: true, title: s.name})),
      aiAgents: suggestedWorkflow.steps.filter(s => s.type.startsWith('action_ai_')).length,
      estimatedTime: 'N/A',
      usageCount: 0,
      lastModified: new Date().toLocaleDateString(),
      tags: ['AI Generated', suggestedWorkflow.name.split(' ')[0]],
      icon: '🤖',
      templateType: 'ai_generated',
      isFeatured: false,
      successRate: 0,
      avgSetupTimeHours: 0,
      roiPercentage: 0,
      apiIntegrations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTemplates(prev => [...prev, newTemplate]);
    
    toast({
      title: "Workflow Deployed!",
      description: `The "${suggestedWorkflow.name}" workflow is now available.`,
    });

    // Reset state and close modal
    setIsCreateModalOpen(false);
    setProblemDescription('');
    setSuggestedWorkflow(null);
  };
  
  const resetCreation = () => {
    setProblemDescription('');
    setSuggestedWorkflow(null);
    setIsGenerating(false);
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
                resetCreation();
                setIsCreateModalOpen(true);
            }}
        />
      </main>

      {/* Workflow Creation Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-500"/>
              Create a New AI Workflow
            </DialogTitle>
            <DialogDescription>
              Describe a business process or problem, and the AI will design a workflow for you.
            </DialogDescription>
          </DialogHeader>

          {!suggestedWorkflow ? (
            // Step 1: User Input
            <>
              <div className="py-4">
                <Label htmlFor="problem-description">Problem Description</Label>
                <Textarea
                  id="problem-description"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full mt-2"
                  rows={6}
                  placeholder="e.g., A customer support request comes in via chat. If it mentions 'urgent' or 'complaint', create a high-priority ticket in our helpdesk and notify the support manager immediately."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateWorkflow} disabled={isGenerating}>
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
            </>
          ) : (
            // Step 2: Review & Deploy
            <div className="py-4">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-foreground mb-1">{suggestedWorkflow.name}</h3>
                <p className="text-sm text-muted-foreground">{suggestedWorkflow.description}</p>
              </div>

              <div className="space-y-4">
                {suggestedWorkflow.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                       <p className="text-xs text-muted-foreground mt-1">({step.type})</p>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="mt-6">
                 <Button variant="outline" onClick={resetCreation}>
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back
                 </Button>
                <Button onClick={handleDeployWorkflow}>
                  Deploy Workflow
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
