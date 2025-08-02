// src/components/admin/ChatWorkflowBuilder.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SuggestWorkflowStepsOutput, WorkflowTemplate } from '@/lib/types';
import { Plus, Zap, Save, ChevronDown, ChevronRight, X } from 'lucide-react';
import Step from './Step';
import { stepIcons } from './step-icons';

interface ChatWorkflowBuilderProps {
  initialData?: SuggestWorkflowStepsOutput | null;
  onSave: (workflow: WorkflowTemplate) => void;
  onCancel: () => void;
}

export default function ChatWorkflowBuilder({ initialData, onSave, onCancel }: ChatWorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setWorkflowName(initialData.name);
      setWorkflowDescription(initialData.description);
      
      const enrichedSteps = initialData.steps.map((step, index) => ({
        ...step,
        id: `step-${Date.now()}-${index}`,
        branches: step.branches?.map((branch:any, branchIndex:number) => ({
          ...branch,
          steps: branch.steps.map((nestedStep:any, nestedIndex:number) => ({
            ...nestedStep,
            id: `step-${Date.now()}-${index}-${branchIndex}-${nestedIndex}`,
            title: nestedStep.name,
            description: nestedStep.description
          }))
        }))
      }));
      setSteps(enrichedSteps);
    }
  }, [initialData]);

  const handleSave = () => {
    setIsSaving(true);
    const finalWorkflow: WorkflowTemplate = {
      id: `wf-${Date.now()}`,
      title: workflowName,
      description: workflowDescription,
      category: 'AI Generated',
      complexity: 'medium',
      steps: steps.map((s, i) => ({
        id: s.id,
        type: s.type,
        title: s.name,
        description: s.description,
        configuration: s.config || {},
        branches: s.branches,
        order: i,
        isRequired: true,
      })),
      aiAgents: steps.filter(s => s.type.includes('ai_')).length,
      estimatedTime: 'N/A',
      usageCount: 0,
      lastModified: new Date().toLocaleDateString(),
      tags: ['AI Generated', workflowName.split(' ')[0]],
      icon: '🤖',
      templateType: 'ai_generated',
      isFeatured: false,
      successRate: 0,
      avgSetupTimeHours: 0,
      roiPercentage: 0,
      apiIntegrations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onSave(finalWorkflow);
    setIsSaving(false);
  };
  
  const handleDeleteStep = (id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
  };
  
  const handleUpdateStep = (stepId: string, updatedData: any) => {
    setSteps(prevSteps => prevSteps.map(step => {
        if (step.id === stepId) {
            return { ...step, ...updatedData };
        }
        return step;
    }));
  };

  const isWorkflowValid = workflowName && steps.length > 0;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-headline text-foreground">Workflow Editor</h1>
                <p className="text-muted-foreground">Customize the AI's suggested workflow.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button 
                disabled={!isWorkflowValid || isSaving}
                onClick={handleSave}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Workflow'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-6">
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Workflow Template Details</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Template Name</Label>
              <Input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Handle urgent customer requests"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="When customers mention urgent issues, get manager approval and assign to senior team member"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
           {steps.map((step, index) => (
            <Step 
              key={step.id} 
              step={{
                ...step,
                title: step.name, // mapping name to title for the Step component
              }} 
              index={index} 
              onDelete={() => handleDeleteStep(step.id)} 
              onUpdate={(updatedData) => handleUpdateStep(step.id, updatedData)}
            />
          ))}

          <div className="flex justify-center">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
