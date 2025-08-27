// src/components/workflow/builder/PromptWorkflowGenerator.tsx

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Wand2, 
  Lightbulb, 
  Zap, 
  ArrowRight,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react';
import type { WorkflowBuilderNode, NodeConnection } from '@/lib/types/workflow-builder';

interface PromptWorkflowGeneratorProps {
  onGenerateWorkflow: (nodes: WorkflowBuilderNode[], connections: NodeConnection[]) => void;
  isGenerating: boolean;
}

export default function PromptWorkflowGenerator({ 
  onGenerateWorkflow, 
  isGenerating 
}: PromptWorkflowGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { toast } = useToast();

  // Pre-defined workflow templates for inspiration
  const workflowTemplates = [
    {
      id: 'customer-onboarding',
      name: 'Customer Onboarding',
      description: 'Automate new customer welcome process',
      prompt: 'Create a customer onboarding workflow that starts when a new customer signs up, sends welcome email, assigns account manager, schedules intro call, and creates customer profile in CRM',
      category: 'Sales'
    },
    {
      id: 'document-approval',
      name: 'Document Approval',
      description: 'Multi-stage document review process',
      prompt: 'Create a document approval workflow where documents are submitted, reviewed by legal team, require manager approval, and notify stakeholders when approved or rejected',
      category: 'HR'
    },
    {
      id: 'support-ticket',
      name: 'Support Ticket Resolution',
      description: 'Automated customer support workflow',
      prompt: 'Create a support ticket workflow that categorizes incoming tickets using AI, assigns to appropriate team, escalates if not resolved in 24 hours, and sends satisfaction survey when closed',
      category: 'Support'
    },
    {
      id: 'content-creation',
      name: 'Content Creation Pipeline',
      description: 'Blog post creation and publishing',
      prompt: 'Create a content creation workflow where topic is researched using AI, content is written, reviewed by editor, approved by marketing manager, and automatically published to website',
      category: 'Marketing'
    },
    {
      id: 'employee-offboarding',
      name: 'Employee Offboarding',
      description: 'Systematic employee departure process',
      prompt: 'Create an employee offboarding workflow that triggers on resignation, revokes system access, collects company assets, conducts exit interview, and updates HR records',
      category: 'HR'
    },
    {
      id: 'invoice-processing',
      name: 'Invoice Processing',
      description: 'Automated invoice handling',
      prompt: 'Create an invoice processing workflow that extracts data from PDF invoices using AI, validates against purchase orders, requires approval for amounts over $1000, and processes payment',
      category: 'Finance'
    }
  ];

  // AI-powered workflow generation (simulated)
  const generateWorkflowFromPrompt = async (promptText: string): Promise<{nodes: WorkflowBuilderNode[], connections: NodeConnection[]}> => {
    // This would integrate with your AI service (OpenAI, Claude, etc.)
    // For now, we'll simulate the process with intelligent parsing
    
    const keywords = promptText.toLowerCase();
    const nodes: WorkflowBuilderNode[] = [];
    const connections: NodeConnection[] = [];
    
    let nodeCounter = 0;
    const createNode = (type: string, subType: string, name: string, description: string, icon: string, color: string, x: number, y: number, config: any = {}) => {
      const node: WorkflowBuilderNode = {
        id: `generated_${nodeCounter++}_${Date.now()}`,
        type: type,
        subType,
        name,
        description,
        position: { x, y },
        config,
        icon,
        color,
        category: type
      };
      nodes.push(node);
      return node;
    };

    const createConnection = (source: WorkflowBuilderNode, target: WorkflowBuilderNode, label = 'Next') => {
      const connection: NodeConnection = {
        id: `conn_${source.id}_${target.id}`,
        source: source.id,
        target: target.id,
        label
      };
      connections.push(connection);
      return connection;
    };

    // Parse prompt and generate appropriate workflow
    let currentY = 100;
    const nodeSpacing = 250;
    let lastNode: WorkflowBuilderNode | null = null;

    // 1. Determine trigger
    let triggerNode: WorkflowBuilderNode;
    if (keywords.includes('form') || keywords.includes('submit')) {
      triggerNode = createNode('trigger', 'form-submission', 'Form Submission', 'Triggered when form is submitted', '📝', 'bg-green-500', 100, currentY);
    } else if (keywords.includes('schedule') || keywords.includes('daily') || keywords.includes('weekly')) {
      triggerNode = createNode('trigger', 'scheduled-trigger', 'Scheduled Trigger', 'Runs on schedule', '⏰', 'bg-purple-500', 100, currentY);
    } else if (keywords.includes('customer') || keywords.includes('user') || keywords.includes('signup')) {
      triggerNode = createNode('trigger', 'form-submission', 'Customer Signup', 'New customer registration', '👤', 'bg-blue-500', 100, currentY);
    } else {
      triggerNode = createNode('trigger', 'manual-trigger', 'Manual Trigger', 'Start workflow manually', '▶️', 'bg-blue-500', 100, currentY);
    }
    lastNode = triggerNode;
    currentY += nodeSpacing;

    // 2. Add AI processing if mentioned
    if (keywords.includes('ai') || keywords.includes('analyze') || keywords.includes('classify') || keywords.includes('categorize')) {
      const aiNode = createNode(
        'ai_processing', 
        'ai-analyzer', 
        'AI Analysis', 
        'Process and analyze data using AI',
        '🧠', 
        'bg-purple-600', 
        100, 
        currentY,
        { model: 'gpt-4', prompt: `Analyze the incoming data based on: ${promptText}` }
      );
      if (lastNode) createConnection(lastNode, aiNode);
      lastNode = aiNode;
      currentY += nodeSpacing;
    }

    // 3. Add approval nodes if mentioned
    if (keywords.includes('approval') || keywords.includes('approve') || keywords.includes('manager')) {
      const approvalNode = createNode(
        'human_action',
        'approval-gate',
        'Approval Required',
        'Requires manager approval',
        '✅',
        'bg-yellow-500',
        100,
        currentY,
        { approvalType: 'single', approvers: ['manager'] }
      );
      if (lastNode) createConnection(lastNode, approvalNode);
      lastNode = approvalNode;
      currentY += nodeSpacing;
    }

    // 4. Add human tasks
    if (keywords.includes('assign') || keywords.includes('review') || keywords.includes('call') || keywords.includes('interview')) {
      let taskName = 'Human Task';
      let taskDescription = 'Assign task to team member';
      
      if (keywords.includes('call')) {
        taskName = 'Schedule Call';
        taskDescription = 'Schedule and conduct call';
      } else if (keywords.includes('review')) {
        taskName = 'Review Task';
        taskDescription = 'Review and validate content';
      } else if (keywords.includes('interview')) {
        taskName = 'Conduct Interview';
        taskDescription = 'Conduct exit or intro interview';
      }

      const taskNode = createNode(
        'human_action',
        'human-task',
        taskName,
        taskDescription,
        '👤',
        'bg-orange-500',
        100,
        currentY,
        { assignmentMethod: 'auto', priority: 'medium' }
      );
      if (lastNode) createConnection(lastNode, taskNode);
      lastNode = taskNode;
      currentY += nodeSpacing;
    }

    // 5. Add notifications
    if (keywords.includes('email') || keywords.includes('notify') || keywords.includes('alert')) {
      let notificationType = 'notification';
      let notificationName = 'Send Notification';
      let icon = '🔔';
      let color = 'bg-pink-500';

      if (keywords.includes('email')) {
        notificationType = 'email-send';
        notificationName = 'Send Email';
        icon = '📧';
        color = 'bg-red-500';
      }

      const notificationNode = createNode(
        'communication',
        notificationType,
        notificationName,
        'Send notification to stakeholders',
        icon,
        color,
        100,
        currentY,
        { channel: 'email', template: 'Auto-generated notification template' }
      );
      if (lastNode) createConnection(lastNode, notificationNode);
      lastNode = notificationNode;
      currentY += nodeSpacing;
    }

    // 6. Add API calls or integrations
    if (keywords.includes('crm') || keywords.includes('database') || keywords.includes('system') || keywords.includes('update')) {
      const integrationNode = createNode(
        'data_integration',
        'api-call',
        'Update System',
        'Update external system or database',
        '🌐',
        'bg-cyan-500',
        100,
        currentY,
        { method: 'POST', url: 'https://api.example.com/update' }
      );
      if (lastNode) createConnection(lastNode, integrationNode);
      lastNode = integrationNode;
      currentY += nodeSpacing;
    }

    // 7. Add conditions if there are branching scenarios
    if (keywords.includes('if') || keywords.includes('when') || keywords.includes('escalate') || keywords.includes('condition')) {
      const conditionNode = createNode(
        'condition',
        'condition-check',
        'Check Conditions',
        'Evaluate conditions and branch workflow',
        '🔀',
        'bg-teal-500',
        300,
        currentY - nodeSpacing,
        { condition: 'status == "pending"', operator: 'equals' }
      );
      
      // Connect condition to previous node
      if (nodes.length > 1) {
        const prevNode = nodes[nodes.length - 2];
        createConnection(prevNode, conditionNode);
      }
      
      // Create branch for escalation or alternative path
      if (keywords.includes('escalate')) {
        const escalationNode = createNode(
          'human_action',
          'human-task',
          'Escalate to Manager',
          'Escalate issue to management',
          '🚨',
          'bg-red-600',
          500,
          currentY,
          { assignmentMethod: 'manual', priority: 'high' }
        );
        createConnection(conditionNode, escalationNode, 'Escalate');
      }
    }

    return { nodes, connections };
  };

  const handleGenerateWorkflow = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt Required",
        description: "Please describe the workflow you want to create",
      });
      return;
    }

    try {
      toast({
        title: "Generating Workflow",
        description: "AI is creating your workflow...",
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { nodes, connections } = await generateWorkflowFromPrompt(prompt);
      onGenerateWorkflow(nodes, connections);

      toast({
        title: "Workflow Generated!",
        description: `Created workflow with ${nodes.length} nodes and ${connections.length} connections`,
      });

      // Clear prompt after successful generation
      setPrompt('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Unable to generate workflow. Please try again.",
      });
    }
  };

  const handleUseTemplate = (template: typeof workflowTemplates[0]) => {
    setPrompt(template.prompt);
    setSelectedTemplate(template.id);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Workflow Generator</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Describe your workflow in natural language and let AI build it for you
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Create from Prompt</TabsTrigger>
            <TabsTrigger value="templates">Use Template</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Describe Your Workflow
                </label>
                <Textarea
                  placeholder="Example: Create a customer onboarding workflow that starts when someone fills out our contact form, sends them a welcome email, assigns an account manager, schedules an intro call, and updates our CRM..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lightbulb className="w-4 h-4" />
                  <span>Be specific about triggers, actions, and conditions</span>
                </div>
                <div className="text-xs text-gray-500">
                  {prompt.length}/1000 characters
                </div>
              </div>

              <Button 
                onClick={handleGenerateWorkflow}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating Workflow...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Workflow with AI
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <p className="text-sm text-gray-600">
              Start with a pre-built template and customize as needed
            </p>
            
            <div className="grid gap-3">
              {workflowTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.prompt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <Button 
                onClick={handleGenerateWorkflow}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating Workflow...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Create from Template
                  </>
                )}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Pro Tips for Better Results
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Mention specific triggers (form submission, schedule, manual start)</li>
            <li>• Include approval requirements and stakeholders</li>
            <li>• Specify notification methods (email, chat, SMS)</li>
            <li>• Describe conditions and branching logic</li>
            <li>• Include integration requirements (CRM, databases, APIs)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}