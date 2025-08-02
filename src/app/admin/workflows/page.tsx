
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
import { Sparkles, Loader2, Plus, ArrowRight, ArrowDown, Bot, CheckCircle, MessageSquare, Trash2, Edit2, Play, Save } from 'lucide-react';
import WorkflowTemplateGrid from '@/components/admin/WorkflowTemplateGrid';
import type { WorkflowTemplate, WorkflowStep } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const stepIcons: { [key: string]: React.ElementType } = {
    trigger_chat_message: MessageSquare,
    action_ai_analysis: Bot,
    action_assign_task: CheckCircle,
    default: Zap,
};

export default function AdminWorkflowsPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [suggestedWorkflow, setSuggestedWorkflow] = useState<SuggestWorkflowStepsOutput | null>(null);
  const [editableWorkflow, setEditableWorkflow] = useState<SuggestWorkflowStepsOutput | null>(null);

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
    setEditableWorkflow(null);

    try {
      const result = await suggestWorkflowSteps({ workflowDescription: problemDescription });
      setSuggestedWorkflow(result);
      setEditableWorkflow(JSON.parse(JSON.stringify(result))); // Deep copy for editing
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
    if (!editableWorkflow) return;
    
    const newTemplate: WorkflowTemplate = {
      id: `wf-${Date.now()}`,
      title: editableWorkflow.name,
      description: editableWorkflow.description,
      category: 'AI Generated',
      complexity: 'medium',
      steps: editableWorkflow.steps.map((s, i) => ({
          ...s, 
          id: s.type, 
          configuration: {}, 
          order: i, 
          isRequired: true, 
          title: s.name
      })),
      aiAgents: editableWorkflow.steps.filter(s => s.type.startsWith('action_ai_')).length,
      estimatedTime: 'N/A',
      usageCount: 0,
      lastModified: new Date().toLocaleDateString(),
      tags: ['AI Generated', editableWorkflow.name.split(' ')[0]],
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
      description: `The "${editableWorkflow.name}" workflow is now available.`,
    });

    resetCreation();
    setIsCreateModalOpen(false);
  };
  
  const resetCreation = () => {
    setProblemDescription('');
    setSuggestedWorkflow(null);
    setEditableWorkflow(null);
    setIsGenerating(false);
  }

  const updateStepDescription = (index: number, newDescription: string) => {
    if (!editableWorkflow) return;

    const updatedSteps = [...editableWorkflow.steps];
    updatedSteps[index].description = newDescription;

    setEditableWorkflow({
      ...editableWorkflow,
      steps: updatedSteps,
    });
  };
  
  const removeStep = (index: number) => {
    if (!editableWorkflow) return;
    const updatedSteps = editableWorkflow.steps.filter((_, i) => i !== index);
     setEditableWorkflow({
      ...editableWorkflow,
      steps: updatedSteps,
    });
  }

  const addStep = (index: number) => {
    if (!editableWorkflow) return;
    
    const newStep = {
      type: 'action_log_information',
      name: 'New Step',
      description: 'Configure this new step.'
    };
    
    const updatedSteps = [...editableWorkflow.steps];
    updatedSteps.splice(index, 0, newStep);

    setEditableWorkflow({
      ...editableWorkflow,
      steps: updatedSteps,
    });
  };

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

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-500"/>
              Create a New AI Workflow
            </DialogTitle>
            <DialogDescription>
              Describe a business process, and the AI will design an editable workflow for you.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            {!suggestedWorkflow ? (
              <div className="py-4">
                <Label htmlFor="problem-description">Problem Description</Label>
                <Textarea
                  id="problem-description"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full mt-2"
                  rows={8}
                  placeholder="e.g., A customer support request comes in via chat. If it mentions 'urgent' or 'complaint', create a high-priority ticket in our helpdesk and notify the support manager immediately."
                />
              </div>
            ) : (
            editableWorkflow && (
              <div className="py-4 space-y-2">
                <div>
                    <Label htmlFor='workflow-name'>Workflow Name</Label>
                    <Input 
                        id="workflow-name"
                        value={editableWorkflow.name} 
                        onChange={(e) => setEditableWorkflow({...editableWorkflow, name: e.target.value})}
                        className="text-lg font-bold"
                    />
                </div>
                 <div>
                    <Label htmlFor='workflow-desc'>Description</Label>
                    <Textarea 
                        id="workflow-desc"
                        value={editableWorkflow.description} 
                        onChange={(e) => setEditableWorkflow({...editableWorkflow, description: e.target.value})}
                    />
                </div>
                
                <div className="pt-4 space-y-2">
                  {editableWorkflow.steps.map((step, index) => {
                    const Icon = stepIcons[step.type] || stepIcons.default;
                    const isTrigger = index === 0;

                    return (
                        <React.Fragment key={index}>
                            <div className="bg-card border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isTrigger ? 'bg-green-100' : 'bg-blue-100'}`}>
                                            <Icon className={`w-5 h-5 ${isTrigger ? 'text-green-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{step.name}</h4>
                                             <Badge variant="outline">{step.type}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => removeStep(index)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                {isTrigger && (
                                    <div className="grid grid-cols-3 gap-2">
                                      {['Chat', 'Email', 'Text Message'].map(source => (
                                        <Button key={source} variant={source === 'Chat' ? 'default' : 'outline'}>{source}</Button>
                                      ))}
                                    </div>
                                )}
                                <Textarea 
                                    value={step.description}
                                    onChange={(e) => updateStepDescription(index, e.target.value)}
                                    placeholder="Step description..."
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-center items-center">
                                <div className="w-px h-4 bg-border"></div>
                                <Button variant="outline" size="icon" className="rounded-full z-10 -my-2" onClick={() => addStep(index + 1)}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-4 bg-border"></div>
                            </div>
                        </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )
          )}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
             {suggestedWorkflow ? (
                <>
                    <Button variant="outline" onClick={resetCreation}>
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Back
                    </Button>
                    <Button onClick={() => console.log('test')} variant="secondary">
                        <Play className="w-4 h-4 mr-2" />
                        Test
                    </Button>
                    <Button onClick={handleDeployWorkflow} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Deploy Workflow
                    </Button>
                </>
             ) : (
                <>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleGenerateWorkflow} disabled={isGenerating}>
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                        ) : (
                            <><Sparkles className="w-4 h-4 mr-2" />Generate Workflow</>
                        )}
                    </Button>
                </>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
