
// src/components/admin/ChatWorkflowBuilder.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SuggestWorkflowStepsOutput, WorkflowTemplate } from '@/lib/types';
import { Plus, MessageSquare, User, CheckCircle, Zap, Bot, ArrowDown, X, Check, ChevronDown, ChevronRight, Play, Save, Settings, Users, Clock, AlertCircle, Calendar, Bell, FileText } from 'lucide-react';

// Step types available in the platform
const stepTypes: any = {
  trigger: {
    'chat_message': {
      name: 'AI Chat Analysis',
      icon: MessageSquare,
      description: 'When AI detects specific intent, urgency, or patterns in chat messages',
      color: 'bg-blue-100 text-blue-600'
    },
    'keyword_mention': {
      name: 'Keyword Mention',
      icon: AlertCircle,
      description: 'When specific keywords are mentioned in chat',
      color: 'bg-purple-100 text-purple-600'
    },
    'user_joins': {
      name: 'User Joins Chat',
      icon: Users,
      description: 'When someone joins a workspace or chat',
      color: 'bg-green-100 text-green-600'
    }
  },
  action: {
    'create_todo': {
      name: 'Create To-Do Item',
      icon: CheckCircle,
      description: 'Add item to personal or team to-do list',
      color: 'bg-green-100 text-green-600'
    },
    'assign_task': {
      name: 'Assign Task',
      icon: User,
      description: 'Create and assign a task to a team member',
      color: 'bg-blue-100 text-blue-600'
    },
    'request_approval': {
      name: 'Request Approval',
      icon: CheckCircle,
      description: 'Ask manager or admin to approve something',
      color: 'bg-yellow-100 text-yellow-600'
    },
    'send_email': {
      name: 'Send Email',
      icon: MessageSquare,
      description: 'Send email notification to internal or external contacts',
      color: 'bg-purple-100 text-purple-600'
    },
    'create_calendar_event': {
      name: 'Schedule Meeting',
      icon: Calendar,
      description: 'Create calendar event or schedule meeting',
      color: 'bg-indigo-100 text-indigo-600'
    },
    'update_status': {
      name: 'Update Status',
      icon: Settings,
      description: 'Change project, task, or customer status',
      color: 'bg-orange-100 text-orange-600'
    },
    'ai_analysis': {
      name: 'AI Analysis',
      icon: Bot,
      description: 'Let AI analyze, classify, or process content',
      color: 'bg-pink-100 text-pink-600'
    },
    'log_information': {
      name: 'Log Information',
      icon: FileText,
      description: 'Record important information or notes',
      color: 'bg-gray-100 text-gray-600'
    },
    'send_notification': {
      name: 'Send Notification',
      icon: Bell,
      description: 'Send in-app or push notification to users',
      color: 'bg-red-100 text-red-600'
    }
  }
};

// Generic assignment options for templates
const assignmentOptions = [
  { id: 'manager', label: 'Manager', description: 'Workspace manager' },
  { id: 'senior_worker', label: 'Senior Worker', description: 'Most experienced team member' },
  { id: 'any_worker', label: 'Any Available Worker', description: 'Next available team member' },
  { id: 'message_sender', label: 'Message Sender', description: 'Person who sent the original message' },
  { id: 'custom_role', label: 'Custom Role', description: 'Define specific role criteria' },
  { id: 'partner_admin', label: 'Partner Admin', description: 'Workspace administrator' }
];

const approverOptions = [
  { id: 'manager', label: 'Manager', description: 'Direct manager approval' },
  { id: 'partner_admin', label: 'Partner Admin', description: 'Workspace administrator' },
  { id: 'senior_worker', label: 'Senior Worker', description: 'Experienced team member' },
  { id: 'custom_approver', label: 'Custom Approver', description: 'Define approval criteria' }
];

const recipientOptions = [
  { id: 'all_team', label: 'All Team Members', description: 'Everyone in workspace' },
  { id: 'managers_only', label: 'Managers Only', description: 'Management team' },
  { id: 'workers_only', label: 'Workers Only', description: 'Front-line team members' },
  { id: 'message_sender', label: 'Message Sender', description: 'Person who sent original message' },
  { id: 'custom_group', label: 'Custom Group', description: 'Define recipient criteria' }
];

interface ChatWorkflowBuilderProps {
  initialData?: SuggestWorkflowStepsOutput | null;
  onSave: (workflow: WorkflowTemplate) => void;
  onCancel: () => void;
}


export default function ChatWorkflowBuilder({ initialData, onSave, onCancel }: ChatWorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [trigger, setTrigger] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [showStepSelector, setShowStepSelector] = useState(false);
  const [selectorType, setSelectorType] = useState('trigger');
  const [selectorIndex, setSelectorIndex] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setWorkflowName(initialData.name);
      setWorkflowDescription(initialData.description);
      
      const fullTrigger = {
        ...initialData.trigger,
        ...(stepTypes.trigger[initialData.trigger.type] || {}),
        config: getDefaultConfig(initialData.trigger.type, 'trigger'),
        configured: false,
      };
      setTrigger(fullTrigger);
      setExpandedStep(fullTrigger.type); // Expand the trigger by default

      const fullActions = initialData.actions.map((action, index) => ({
        id: Date.now().toString() + index,
        ...action,
        ...(stepTypes.action[action.type] || {}),
        config: getDefaultConfig(action.type, 'action'),
        configured: false,
      }));
      setActions(fullActions);
    }
  }, [initialData]);

  const handleStepSelect = (stepKey: string, stepType: 'trigger' | 'action') => {
    const stepDetails = stepTypes[stepType][stepKey];
    const newStep = {
      id: Date.now().toString(),
      type: stepKey,
      ...stepDetails,
      config: getDefaultConfig(stepKey, stepType),
      configured: isStepConfigured(stepKey, getDefaultConfig(stepKey, stepType)),
    };
    
    if (stepType === 'trigger') {
      setTrigger(newStep);
      setExpandedStep(newStep.id);
    } else {
      const newActions = [...actions];
      newActions.splice(selectorIndex, 0, newStep);
      setActions(newActions);
      setExpandedStep(newStep.id);
    }
    setShowStepSelector(false);
  };

  const getDefaultConfig = (stepKey: string, stepType: string) => {
    const configs:any = {
      chat_message: {
        analysisType: 'ai_review',
        aiPrompt: 'Does this message require immediate attention or action? Look for urgency, requests for help, complaints, or approval needs.',
        confidenceThreshold: 75
      },
      keyword_mention: {
        keywords: [],
        caseSensitive: false
      },
      user_joins: {
        channels: 'all'
      },
      create_todo: {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: 1,
        listType: 'personal'
      },
      assign_task: {
        assignee: '',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: 1
      },
      request_approval: {
        approver: '',
        message: '',
        timeout: 24
      },
      send_email: {
        recipients: [],
        subject: '',
        message: '',
        emailType: 'internal'
      },
      create_calendar_event: {
        title: '',
        attendees: [],
        duration: 30,
        description: ''
      },
      update_status: {
        target: 'task',
        newStatus: '',
        notifyTeam: true
      },
      ai_analysis: {
        action: 'summarize',
        prompt: '',
        model: 'gpt-4'
      },
      log_information: {
        category: 'general',
        message: '',
        includeOriginalMessage: true
      },
      send_notification: {
        recipients: [],
        message: '',
        channel: 'in_app',
        priority: 'normal'
      }
    };
    
    return configs[stepKey] || {};
  };

  const updateStepConfig = (stepId: string, newConfig: any) => {
    if (trigger && trigger.id === stepId) {
      const updatedTrigger = {
        ...trigger,
        config: { ...trigger.config, ...newConfig },
      };
      updatedTrigger.configured = isStepConfigured(updatedTrigger.type, updatedTrigger.config);
      setTrigger(updatedTrigger);
    } else {
      setActions(prev => prev.map(action => {
        if (action.id === stepId) {
          const updatedAction = {
            ...action,
            config: { ...action.config, ...newConfig },
          };
          updatedAction.configured = isStepConfigured(updatedAction.type, updatedAction.config);
          return updatedAction;
        }
        return action;
      }));
    }
  };

  const isStepConfigured = (stepType: string, config: any) => {
    switch (stepType) {
      case 'chat_message':
        return !!config.aiPrompt?.trim();
      case 'keyword_mention':
        return config.keywords?.length > 0;
      case 'user_joins':
        return true;
      case 'create_todo':
        return !!config.title?.trim();
      case 'assign_task':
        return !!config.assignee && !!config.title?.trim();
      case 'request_approval':
        return !!config.approver && !!config.message?.trim();
      case 'send_email':
        return config.recipients?.length > 0 && !!config.subject?.trim();
      case 'create_calendar_event':
        return !!config.title?.trim() && config.attendees?.length > 0;
      case 'update_status':
        return !!config.newStatus?.trim();
      case 'ai_analysis':
        return !!config.action && (config.action !== 'custom' || !!config.prompt?.trim());
      case 'log_information':
        return !!config.message?.trim();
      case 'send_notification':
        return config.recipients?.length > 0 && !!config.message?.trim();
      default:
        return false;
    }
  };


  const removeAction = (actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  const addStep = (type: 'trigger' | 'action', index: number) => {
    setSelectorType(type);
    setSelectorIndex(index);
    setShowStepSelector(true);
  };

  const handleSave = () => {
    const finalWorkflow: WorkflowTemplate = {
      id: `wf-${Date.now()}`,
      title: workflowName,
      description: workflowDescription,
      category: 'AI Generated',
      complexity: 'medium',
      steps: [trigger, ...actions].map((s, i) => ({
        id: s.id,
        type: s.type,
        title: s.name,
        description: s.description,
        configuration: s.config,
        order: i,
        isRequired: true,
      })),
      aiAgents: [trigger, ...actions].filter(s => s.type.includes('ai_')).length,
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
  };

  const isWorkflowValid = workflowName && trigger?.configured && actions.length > 0 && actions.every(a => a.configured);

  const renderStepConfig = (step: any, stepId: string) => {
    const { type, config } = step;

    switch (type) {
      case 'chat_message':
        return (
          <div className="space-y-4">
            <div>
              <Label>AI Analysis Prompt</Label>
              <Textarea
                value={config.aiPrompt || ''}
                onChange={(e) => updateStepConfig(stepId, { aiPrompt: e.target.value })}
                placeholder="Does this message require immediate attention or action? Look for urgency, requests for help, complaints, or approval needs."
                rows={4}
                className="w-full resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">AI will analyze each message using this prompt</p>
            </div>

            <div>
              <Label>
                Confidence Threshold ({config.confidenceThreshold || 75}%)
              </Label>
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={config.confidenceThreshold || 75}
                onChange={(e) => updateStepConfig(stepId, { confidenceThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>More sensitive</span>
                <span>Balanced</span>
                <span>High confidence</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> AI analyzes every message using your prompt. 
                If confidence is above {config.confidenceThreshold || 75}%, the workflow triggers.
              </p>
            </div>
          </div>
        );

      case 'assign_task':
        return (
          <div className="space-y-4">
            <div>
              <Label>Assign To</Label>
              <select
                value={config.assignee || ''}
                onChange={(e) => updateStepConfig(stepId, { assignee: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="">Select assignment rule...</option>
                {assignmentOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {config.assignee && (
                <p className="text-xs text-muted-foreground mt-1">
                  {assignmentOptions.find(opt => opt.id === config.assignee)?.description}
                </p>
              )}
            </div>
            
            <div>
              <Label>Task Title</Label>
              <Input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateStepConfig(stepId, { title: e.target.value })}
                placeholder="e.g., Handle customer request from {user_name}"
              />
            </div>
          </div>
        );

      case 'create_todo':
        return (
          <div className="space-y-4">
            <div>
              <Label>Task Title</Label>
              <Input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateStepConfig(stepId, { title: e.target.value })}
                placeholder="e.g., Follow up on customer request"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={config.description || ''}
                onChange={(e) => updateStepConfig(stepId, { description: e.target.value })}
                placeholder="Add more details about the to-do item"
                rows={3}
              />
            </div>
             <div>
                <Label>Priority</Label>
                <select value={config.priority} onChange={(e) => updateStepConfig(stepId, { priority: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
          </div>
        );
      
      case 'request_approval':
        return (
          <div className="space-y-4">
            <div>
              <Label>Request From</Label>
              <select
                value={config.approver || ''}
                onChange={(e) => updateStepConfig(stepId, { approver: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="">Select approver...</option>
                {approverOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Approval Message</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="Please approve this..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <select
                value={config.recipients?.[0] || ''}
                onChange={(e) => updateStepConfig(stepId, { recipients: [e.target.value] })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="">Select recipient group...</option>
                {recipientOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                type="text"
                value={config.subject || ''}
                onChange={(e) => updateStepConfig(stepId, { subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="Write your email content here."
                rows={5}
              />
            </div>
          </div>
        );
      
      case 'create_calendar_event':
        return (
          <div className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateStepConfig(stepId, { title: e.target.value })}
                placeholder="e.g., Follow-up call"
              />
            </div>
            <div>
              <Label>Attendees</Label>
              <select
                value={config.attendees?.[0] || ''}
                onChange={(e) => updateStepConfig(stepId, { attendees: [e.target.value] })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="">Select attendees...</option>
                {recipientOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={config.duration || 30}
                onChange={(e) => updateStepConfig(stepId, { duration: parseInt(e.target.value) })}
                min="15"
                step="15"
              />
            </div>
          </div>
        );

      case 'update_status':
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Entity</Label>
              <select
                value={config.target || 'task'}
                onChange={(e) => updateStepConfig(stepId, { target: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="task">Task</option>
                <option value="project">Project</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <Label>New Status</Label>
              <Input
                type="text"
                value={config.newStatus || ''}
                onChange={(e) => updateStepConfig(stepId, { newStatus: e.target.value })}
                placeholder="e.g., 'Completed', 'Awaiting Feedback'"
              />
            </div>
          </div>
        );

      case 'ai_analysis':
        return (
          <div className="space-y-4">
            <div>
              <Label>Analysis Type</Label>
              <select
                value={config.action || 'summarize'}
                onChange={(e) => updateStepConfig(stepId, { action: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="summarize">Summarize</option>
                <option value="classify">Classify</option>
                <option value="extract">Extract Info</option>
                <option value="custom">Custom Prompt</option>
              </select>
            </div>
            {config.action === 'custom' && (
              <div>
                <Label>Custom AI Prompt</Label>
                <Textarea
                  value={config.prompt || ''}
                  onChange={(e) => updateStepConfig(stepId, { prompt: e.target.value })}
                  placeholder="Your custom prompt for the AI..."
                  rows={4}
                />
              </div>
            )}
          </div>
        );

      case 'log_information':
        return (
          <div className="space-y-4">
            <div>
              <Label>Log Message</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="Information to log..."
                rows={4}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                type="text"
                value={config.category || 'General'}
                onChange={(e) => updateStepConfig(stepId, { category: e.target.value })}
              />
            </div>
          </div>
        );

      case 'send_notification':
        return (
          <div className="space-y-4">
            <div>
              <Label>Send To</Label>
              <select
                value={config.recipients?.[0] || ''}
                onChange={(e) => updateStepConfig(stepId, { recipients: [e.target.value] })}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="">Select recipient group...</option>
                {recipientOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Notification Message</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="Your notification message..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return <div className="text-muted-foreground">This step is fully configured and requires no extra input.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-headline text-foreground">Workflow Builder</h1>
                <p className="text-muted-foreground">Create a workflow template from the AI's suggestion.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button 
                onClick={() => setIsTestMode(true)}
                disabled={!isWorkflowValid}
                variant="secondary"
              >
                <Play className="w-4 h-4" />
                Test
              </Button>
              <Button 
                disabled={!isWorkflowValid}
                onClick={handleSave}
              >
                <Save className="w-4 h-4" />
                Save Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-6">
        {/* Workflow Info */}
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

        {/* Workflow Steps */}
        <div className="space-y-4">
          {/* Trigger */}
          <div className="bg-card rounded-lg border">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                  ⚡
                </div>
                <h3 className="text-lg font-semibold">When this happens...</h3>
                <span className="text-sm text-muted-foreground">(Trigger)</span>
              </div>

              {!trigger ? (
                <button
                  onClick={() => addStep('trigger', 0)}
                  className="w-full p-4 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-secondary transition-colors"
                >
                  <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Choose a chat trigger</p>
                </button>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${trigger.color}`}>
                        <trigger.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{trigger.name}</p>
                        <p className="text-sm text-muted-foreground">{trigger.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trigger.configured && <Check className="w-5 h-5 text-green-600" />}
                      <Button
                        onClick={() => setExpandedStep(expandedStep === trigger.id ? null : trigger.id)}
                        variant="ghost" size="icon"
                      >
                        {expandedStep === trigger.id ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </Button>
                    </div>
                  </div>

                  {expandedStep === trigger.id && (
                    <div className="mt-4 pt-4 border-t">
                      {renderStepConfig(trigger, trigger.id)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          {trigger && (
            <div className="flex justify-center">
              <ArrowDown className="w-6 h-6 text-muted-foreground" />
            </div>
          )}

          {/* Actions */}
          {actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <div className="bg-card rounded-lg border">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold">Then do this...</h3>
                    <span className="text-sm text-muted-foreground">(Action)</span>
                    <div className="ml-auto">
                      <Button variant="ghost" size="icon" onClick={() => removeAction(action.id)}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.configured && <Check className="w-5 h-5 text-green-600" />}
                        <Button
                          onClick={() => setExpandedStep(expandedStep === action.id ? null : action.id)}
                           variant="ghost" size="icon"
                        >
                          {expandedStep === action.id ? 
                            <ChevronDown className="w-5 h-5" /> : 
                            <ChevronRight className="w-5 h-5" />
                          }
                        </Button>
                      </div>
                    </div>

                    {expandedStep === action.id && (
                      <div className="mt-4 pt-4 border-t">
                        {renderStepConfig(action, action.id)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Action Button */}
              <div className="flex justify-center items-center my-2">
                <div className="flex-grow border-t"></div>
                 <Button variant="outline" size="icon" className="rounded-full z-10" onClick={() => addStep('action', index + 1)}>
                    <Plus className="w-4 h-4" />
                </Button>
                <div className="flex-grow border-t"></div>
              </div>
            </React.Fragment>
          ))}

          {/* Initial Add Action Button */}
          {trigger && actions.length === 0 && (
             <div className="bg-card rounded-lg border">
              <div className="p-6">
                <button
                  onClick={() => addStep('action', 0)}
                  className="w-full p-4 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-secondary transition-colors"
                >
                  <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Add an action</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Selector Modal */}
      {showStepSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Choose a {selectorType} step
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowStepSelector(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(stepTypes[selectorType]).map(([key, step]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => handleStepSelect(key, selectorType)}
                    className="p-4 border rounded-lg hover:border-primary hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p className="font-medium">{step.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Mode Overlay */}
      {isTestMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Testing Workflow</h3>
            <p className="text-muted-foreground">Simulating chat triggers and actions...</p>
            <Button 
              onClick={() => setIsTestMode(false)}
              className="mt-4"
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
