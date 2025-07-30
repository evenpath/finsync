// src/components/admin/WorkflowBuilder.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  CheckCircle,
  Database,
  Edit3,
  FileText,
  Globe,
  Layers,
  Mail,
  Play,
  Plus,
  Save,
  Settings,
  Target,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import StepConfigPanel from './StepConfigPanel';
import { stepTypes } from '@/lib/mockData';
import type { WorkflowTemplate, WorkflowStep } from '@/lib/types';


interface WorkflowBuilderProps {
    template?: WorkflowTemplate | null;
    onBack: () => void;
    onSave: (workflowData: any) => void;
}

export default function WorkflowBuilder({ template, onBack, onSave }: WorkflowBuilderProps) {
  const [workflowData, setWorkflowData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    category: template?.category || '',
    complexity: template?.complexity || 'simple',
    icon: template?.icon || '⚡',
    tags: template?.tags || [],
    steps: template?.steps || []
  });
  
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [showStepLibrary, setShowStepLibrary] = useState(false);

  const handleAddStep = (stepType: any) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: stepType.id,
      title: stepType.name,
      description: stepType.description,
      configuration: getDefaultConfig(stepType.id),
      order: workflowData.steps.length,
      isRequired: true
    };

    setWorkflowData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    setShowStepLibrary(false);
    setSelectedStep(newStep);
  };

  const getDefaultConfig = (stepType: any) => {
    switch (stepType) {
      case 'ai_agent':
        return {
          agentType: 'summarize',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '',
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: ''
        };
      case 'human_input':
        return {
          inputType: 'text',
          required: true,
          placeholder: '',
          validation: ''
        };
      case 'approval':
        return {
          approverRole: 'partner_admin',
          autoApprove: false,
          timeoutHours: 24
        };
      case 'notification':
        return {
          channel: 'email',
          recipients: [],
          template: '',
          urgent: false
        };
      case 'api_call':
        return {
          method: 'GET',
          endpoint: '',
          headers: {},
          body: ''
        };
      case 'condition':
        return {
          condition: '',
          trueStepId: null,
          falseStepId: null
        };
      default:
        return {};
    }
  };

  const updateStepConfig = (stepId: string, config: any) => {
    const newSteps = workflowData.steps.map(step => 
      step.id === stepId ? { ...step, configuration: { ...step.configuration, ...config } } : step
    );
    setWorkflowData(prev => ({ ...prev, steps: newSteps }));
    setSelectedStep(prev => prev ? { ...prev, configuration: { ...prev.configuration, ...config } } : null);
  };
  
  const updateStepInfo = (stepId: string, newInfo: Partial<WorkflowStep>) => {
    const newSteps = workflowData.steps.map(step => 
        step.id === stepId ? { ...step, ...newInfo } : step
      );
      setWorkflowData(prev => ({ ...prev, steps: newSteps }));
      setSelectedStep(prev => prev ? { ...prev, ...newInfo } : null);
  }

  const deleteStep = (stepId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
    setSelectedStep(null);
  };

  const getStepIcon = (stepType: string) => {
    const typeInfo = stepTypes.find(t => t.id === stepType);
    return typeInfo ? typeInfo.icon : Layers;
  };
   const getStepColor = (stepType: string) => {
    const typeInfo = stepTypes.find(t => t.id === stepType);
    return typeInfo ? typeInfo.color : 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex-1 flex overflow-hidden">
        {/* Workflow Canvas */}
        <div className="flex-1 relative bg-secondary/50 overflow-auto">
          {/* Step Library Toggle */}
          <div className="absolute top-4 left-4 z-10">
            <Button 
              variant={showStepLibrary ? "default" : "outline"}
              onClick={() => setShowStepLibrary(!showStepLibrary)}
            >
              <Plus className="w-4 h-4" />
              Add Step
            </Button>
          </div>

          {/* Step Library Sidebar */}
          {showStepLibrary && (
            <div className="absolute top-16 left-4 w-80 bg-card rounded-lg shadow-lg border z-20 max-h-[calc(100vh-10rem)] overflow-y-auto">
              <CardHeader>
                  <CardTitle>Step Library</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {stepTypes.map(stepType => {
                  const Icon = stepType.icon;
                  return (
                    <button
                      key={stepType.id}
                      onClick={() => handleAddStep(stepType)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stepType.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{stepType.name}</p>
                        <p className="text-sm text-muted-foreground">{stepType.description}</p>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </div>
          )}

          {/* Workflow Steps */}
          <div className="p-8 pt-20">
            {workflowData.steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                <Layers className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Start Building Your Workflow</h3>
                <p className="mb-6 max-w-md">
                  Add steps from the step library to create your AI-powered workflow. 
                  You can connect simple tasks or build complex automation pipelines.
                </p>
                <Button onClick={() => setShowStepLibrary(true)}>
                  <Plus className="w-4 h-4" />
                  Add First Step
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {workflowData.steps.map((step, index) => {
                  const Icon = getStepIcon(step.type);
                  const color = getStepColor(step.type);
                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      {/* Step Number */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        {index < workflowData.steps.length - 1 && (
                          <div className="w-0.5 h-16 bg-border mt-2"></div>
                        )}
                      </div>

                      {/* Step Card */}
                      <Card 
                        className={`flex-1 cursor-pointer transition-all ${
                          selectedStep?.id === step.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedStep(step)}
                      >
                         <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    {step.type === 'ai_agent' && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-primary font-medium">
                                        {step.configuration?.provider?.toUpperCase()} • {step.configuration?.model}
                                        </span>
                                    </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="w-8 h-8">
                                    <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStep(step.id);
                                    }}>
                                    <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step Configuration Panel */}
        {selectedStep && (
          <div className="w-96 bg-card border-l flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between mb-4">
                    <CardTitle>Configure Step</CardTitle>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setSelectedStep(null)}>
                    <X className="w-4 h-4" />
                    </Button>
                </div>
                 <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStepColor(selectedStep.type)}`}>
                        {React.createElement(getStepIcon(selectedStep.type), { className: "w-6 h-6 text-white"})}
                    </div>
                    <div>
                    <h4 className="font-medium text-foreground">{selectedStep.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedStep.type}</p>
                    </div>
                </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <StepConfigPanel 
                step={selectedStep} 
                onConfigChange={(config) => updateStepConfig(selectedStep.id, config)}
                onInfoChange={(info) => updateStepInfo(selectedStep.id, info)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
