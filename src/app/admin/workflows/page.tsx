
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
import { Sparkles, Loader2, ArrowRight, Bot, User, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SuggestedStep = {
    type: string;
    title: string;
    description: string;
};

export default function AdminWorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedSteps, setSuggestedSteps] = useState<SuggestedStep[]>([]);
  const { toast } = useToast();

  const handleCreateNew = () => {
    setWorkflowDescription('');
    setSuggestedSteps([]);
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
    setSuggestedSteps([]);
    try {
        const result = await suggestWorkflowSteps({ workflowDescription });
        if (result.suggestedSteps && result.suggestedSteps.length > 0) {
            setSuggestedSteps(result.suggestedSteps);
        } else {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: "The AI could not suggest any steps for this description. Please try being more specific.",
            });
        }
    } catch (error) {
        console.error("Error generating workflow:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDeployWorkflow = () => {
    // This is where you would save the new workflow to your database.
    // For this example, we'll create a new template object and add it to the local state.
    const newTemplate: WorkflowTemplate = {
        id: `wf-${Date.now()}`,
        title: workflowDescription.substring(0, 50), // Use the start of the description as a title
        description: workflowDescription,
        category: 'AI-Generated',
        complexity: 'medium',
        steps: suggestedSteps.map(s => ({ ...s, id: `step-${Math.random()}`, configuration: {}, order: 0, isRequired: true })),
        aiAgents: suggestedSteps.filter(s => s.type === 'ai_agent').length,
        estimatedTime: `${suggestedSteps.length * 5} min`,
        usageCount: 0,
        lastModified: new Date().toISOString().split('T')[0],
        tags: ['AI-Generated', 'New'],
        icon: '🤖',
        templateType: 'ai_generated',
        isFeatured: false,
        successRate: 0,
        avgSetupTimeHours: 0.1,
        roiPercentage: 0,
        apiIntegrations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setTemplates(prev => [newTemplate, ...prev]);

    toast({
        title: "Workflow Deployed!",
        description: `The new workflow "${newTemplate.title}" has been added to your templates.`,
    });

    setIsCreateModalOpen(false);
    setWorkflowDescription('');
    setSuggestedSteps([]);
  }

  const getStepIcon = (type: string) => {
    switch (type) {
        case 'ai_agent': return <Bot className="w-5 h-5 text-purple-500" />;
        case 'manual_input': return <User className="w-5 h-5 text-blue-500" />;
        default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Sparkles className="text-purple-500" />
                Create a New AI Workflow
            </DialogTitle>
            <DialogDescription>
              Describe the process or problem you want to solve. The AI will generate the workflow steps for you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Input */}
            <div>
              <Label htmlFor="workflow-description" className="font-medium">1. Describe your workflow</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="w-full mt-2"
                rows={12}
                placeholder="e.g., 'A workflow to handle customer support requests. First, an AI should categorize the request. If it's urgent, notify the support lead. Otherwise, create a ticket in our system and send an automated confirmation to the customer.'"
                disabled={isGenerating || suggestedSteps.length > 0}
              />
               <Button
                onClick={handleGenerateWorkflow}
                disabled={isGenerating || !workflowDescription.trim() || suggestedSteps.length > 0}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Workflow</>
                )}
              </Button>
            </div>

            {/* Right side: Output */}
            <div className="border-l -ml-3 pl-6">
              <Label className="font-medium">2. Review & Deploy</Label>
              <div className="mt-2 p-4 bg-secondary rounded-lg h-[320px] overflow-y-auto">
                {isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>AI is generating steps...</p>
                    </div>
                )}
                {!isGenerating && suggestedSteps.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>Suggested steps will appear here.</p>
                    </div>
                )}
                {suggestedSteps.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Suggested Workflow:</h4>
                        <ul className="space-y-3">
                           {suggestedSteps.map((step, index) => (
                             <li key={index} className="flex items-start gap-3 p-3 bg-card rounded-md">
                               <div className="mt-1">{getStepIcon(step.type)}</div>
                               <div>
                                 <div className="flex items-center gap-2">
                                     <h5 className="font-medium">{step.title}</h5>
                                     <Badge variant="outline" className="text-xs">{step.type.replace('_', ' ')}</Badge>
                                 </div>
                                 <p className="text-sm text-muted-foreground">{step.description}</p>
                               </div>
                             </li>
                           ))}
                        </ul>
                    </div>
                )}
              </div>
               <Button
                  onClick={handleDeployWorkflow}
                  disabled={suggestedSteps.length === 0}
                  className="w-full mt-4"
                >
                  Deploy Workflow
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
