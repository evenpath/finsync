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
import { suggestWorkflowSteps } from '@/ai/flows/suggest-workflow-steps';
import type { WorkflowBuilderNode, NodeConnection } from '@/lib/types/workflow-builder';
import type { SuggestWorkflowStepsOutput, StepSchema } from '@/lib/types';

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
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
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

  // Generate unique IDs for nodes and connections
  const generateNodeId = () => `ai_generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateConnectionId = (sourceId: string, targetId: string) => `conn_${sourceId}_${targetId}`;

  // Convert AI steps to WorkflowBuilderNodes
  const convertAIStepsToWorkflowNodes = (aiSteps: StepSchema[]): { nodes: WorkflowBuilderNode[], connections: NodeConnection[] } => {
    const nodes: WorkflowBuilderNode[] = [];
    const connections: NodeConnection[] = [];
    let nodeCounter = 0;
    const nodeSpacing = 350;
    const startX = 100;
    const startY = 100;

    // Define node type mappings from AI step types to workflow builder types
    const getNodeTypeMapping = (aiStepType: string, stepName: string, stepDescription: string) => {
      const lowerName = stepName.toLowerCase();
      const lowerDesc = stepDescription.toLowerCase();
      
      switch (aiStepType) {
        case 'ai_agent':
          if (lowerName.includes('classify') || lowerDesc.includes('classify')) {
            return {
              type: 'ai_processing' as const,
              subType: 'text-classifier',
              icon: 'Target',
              color: 'bg-indigo-500'
            };
          } else if (lowerName.includes('sentiment') || lowerDesc.includes('sentiment')) {
            return {
              type: 'ai_processing' as const,
              subType: 'sentiment-analyzer',
              icon: 'MessageSquare',
              color: 'bg-pink-500'
            };
          } else if (lowerName.includes('generate') || lowerDesc.includes('generate')) {
            return {
              type: 'ai_processing' as const,
              subType: 'content-generator',
              icon: 'FileText',
              color: 'bg-violet-500'
            };
          }
          return {
            type: 'ai_processing' as const,
            subType: 'ai-analyzer',
            icon: 'Bot',
            color: 'bg-purple-500'
          };
        
        case 'human_input':
          if (lowerName.includes('approval') || lowerDesc.includes('approval')) {
            return {
              type: 'human_action' as const,
              subType: 'approval-gate',
              icon: 'CheckCircle',
              color: 'bg-yellow-500'
            };
          } else if (lowerName.includes('review') || lowerDesc.includes('review')) {
            return {
              type: 'human_action' as const,
              subType: 'review-task',
              icon: 'Search',
              color: 'bg-amber-500'
            };
          }
          return {
            type: 'human_action' as const,
            subType: 'human-task',
            icon: 'Users',
            color: 'bg-orange-500'
          };
        
        case 'api_call':
          return {
            type: 'data_integration' as const,
            subType: 'api-call',
            icon: 'Globe',
            color: 'bg-cyan-500'
          };
        
        case 'notification':
          if (lowerName.includes('email') || lowerDesc.includes('email')) {
            return {
              type: 'communication' as const,
              subType: 'email-send',
              icon: 'Mail',
              color: 'bg-red-500'
            };
          } else if (lowerName.includes('slack') || lowerDesc.includes('slack')) {
            return {
              type: 'communication' as const,
              subType: 'slack-message',
              icon: 'MessageSquare',
              color: 'bg-green-500'
            };
          }
          return {
            type: 'communication' as const,
            subType: 'notification',
            icon: 'MessageSquare',
            color: 'bg-pink-500'
          };
        
        case 'conditional_branch':
          return {
            type: 'condition' as const,
            subType: 'condition-check',
            icon: 'Target',
            color: 'bg-teal-500'
          };
        
        default:
          // Default to manual trigger for first node or API call for others
          if (nodeCounter === 0) {
            return {
              type: 'trigger' as const,
              subType: 'manual-trigger',
              icon: 'Play',
              color: 'bg-emerald-500'
            };
          }
          return {
            type: 'data_integration' as const,
            subType: 'api-call',
            icon: 'Globe',
            color: 'bg-cyan-500'
          };
      }
    };

    // Add a trigger node if the first step isn't a trigger
    if (aiSteps.length > 0 && !aiSteps[0].type.includes('trigger')) {
      const triggerNode: WorkflowBuilderNode = {
        id: generateNodeId(),
        type: 'trigger',
        subType: 'manual-trigger',
        name: 'Start Workflow',
        description: 'Manually trigger the workflow',
        position: { x: startX, y: startY },
        config: { triggerLabel: 'Start Workflow' },
        icon: 'Play',
        color: 'bg-emerald-500',
        category: 'trigger'
      };
      nodes.push(triggerNode);
      nodeCounter++;
    }

    let previousNode: WorkflowBuilderNode | null = nodes.length > 0 ? nodes[0] : null;

    // Convert AI steps to workflow nodes
    aiSteps.forEach((step, index) => {
      const nodeTypeMapping = getNodeTypeMapping(step.type, step.name, step.description);
      
      const node: WorkflowBuilderNode = {
        id: step.id || generateNodeId(),
        type: nodeTypeMapping.type,
        subType: nodeTypeMapping.subType,
        name: step.name,
        description: step.description,
        position: { 
          x: startX + (nodeCounter * nodeSpacing), 
          y: startY + (Math.sin(nodeCounter * 0.3) * 50)
        },
        config: {},
        icon: nodeTypeMapping.icon,
        color: nodeTypeMapping.color,
        category: nodeTypeMapping.type
      };

      // Set node-specific configuration
      switch (nodeTypeMapping.subType) {
        case 'ai-analyzer':
        case 'text-classifier':
        case 'sentiment-analyzer':
        case 'content-generator':
          node.config = {
            provider: 'OpenAI',
            model: 'gpt-4',
            temperature: 0.7,
            systemPrompt: `Process and analyze data for: ${step.description}`
          };
          break;
        
        case 'human-task':
        case 'approval-gate':
        case 'review-task':
          node.config = {
            instructions: step.description,
            assignmentMethod: 'auto',
            priority: 'medium'
          };
          break;
        
        case 'email-send':
        case 'notification':
        case 'slack-message':
          node.config = {
            channel: nodeTypeMapping.subType.includes('email') ? 'email' : 'notification',
            template: `Automated message: ${step.description}`
          };
          break;
        
        case 'api-call':
          node.config = {
            url: 'https://api.example.com',
            method: 'POST'
          };
          break;
      }

      nodes.push(node);

      // Create connection to previous node
      if (previousNode) {
        const connection: NodeConnection = {
          id: generateConnectionId(previousNode.id, node.id),
          source: previousNode.id,
          target: node.id,
          label: ''
        };
        connections.push(connection);
      }

      // Handle conditional branches
      if (step.branches && step.branches.length > 0) {
        step.branches.forEach((branch, branchIndex) => {
          // Create branch nodes
          const branchNodes = branch.steps.map((branchStep, branchStepIndex) => {
            const branchNodeTypeMapping = getNodeTypeMapping(branchStep.type, branchStep.name, branchStep.description);
            
            return {
              id: branchStep.id || generateNodeId(),
              type: branchNodeTypeMapping.type,
              subType: branchNodeTypeMapping.subType,
              name: branchStep.name,
              description: branchStep.description,
              position: { 
                x: startX + ((nodeCounter + 1 + branchStepIndex) * nodeSpacing), 
                y: startY + ((branchIndex + 1) * 150) + (Math.sin((nodeCounter + branchStepIndex) * 0.3) * 30)
              },
              config: {},
              icon: branchNodeTypeMapping.icon,
              color: branchNodeTypeMapping.color,
              category: branchNodeTypeMapping.type
            } as WorkflowBuilderNode;
          });

          nodes.push(...branchNodes);

          // Connect condition node to first branch node
          if (branchNodes.length > 0) {
            const branchConnection: NodeConnection = {
              id: generateConnectionId(node.id, branchNodes[0].id),
              source: node.id,
              target: branchNodes[0].id,
              label: branch.condition
            };
            connections.push(branchConnection);

            // Connect branch nodes to each other
            for (let i = 0; i < branchNodes.length - 1; i++) {
              const connection: NodeConnection = {
                id: generateConnectionId(branchNodes[i].id, branchNodes[i + 1].id),
                source: branchNodes[i].id,
                target: branchNodes[i + 1].id,
                label: ''
              };
              connections.push(connection);
            }
          }
        });
      }

      previousNode = node;
      nodeCounter++;
    });

    return { nodes, connections };
  };

  // Handle AI workflow generation from prompt
  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt Required",
        description: "Please describe the workflow you want to create",
      });
      return;
    }

    setIsGeneratingFromPrompt(true);

    try {
      toast({
        title: "Generating Workflow",
        description: "AI is creating your workflow...",
      });

      // Call the actual AI flow
      const aiResult: SuggestWorkflowStepsOutput = await suggestWorkflowSteps({ 
        workflowDescription: prompt.trim() 
      });

      // Convert AI result to workflow builder format
      const { nodes, connections } = convertAIStepsToWorkflowNodes(aiResult.steps);

      // Call the parent callback to update the canvas
      onGenerateWorkflow(nodes, connections);

      toast({
        title: "Workflow Generated!",
        description: `Created workflow "${aiResult.name}" with ${nodes.length} nodes and ${connections.length} connections`,
      });

      // Clear prompt after successful generation
      setPrompt('');
    } catch (error) {
      console.error("Failed to generate workflow:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Unable to generate workflow. Please try again.",
      });
    } finally {
      setIsGeneratingFromPrompt(false);
    }
  };

  // Handle template selection and generation
  const handleGenerateFromTemplate = async () => {
    const template = workflowTemplates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast({
        variant: "destructive",
        title: "Template Required",
        description: "Please select a template to generate from",
      });
      return;
    }

    setIsGeneratingFromPrompt(true);

    try {
      toast({
        title: "Generating from Template",
        description: `Creating ${template.name} workflow...`,
      });

      // Use template prompt to generate workflow
      const aiResult: SuggestWorkflowStepsOutput = await suggestWorkflowSteps({ 
        workflowDescription: template.prompt 
      });

      // Convert AI result to workflow builder format
      const { nodes, connections } = convertAIStepsToWorkflowNodes(aiResult.steps);

      // Call the parent callback to update the canvas
      onGenerateWorkflow(nodes, connections);

      toast({
        title: "Template Generated!",
        description: `Created ${template.name} workflow with ${nodes.length} nodes and ${connections.length} connections`,
      });

      setSelectedTemplate('');
    } catch (error) {
      console.error("Failed to generate from template:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Unable to generate workflow from template. Please try again.",
      });
    } finally {
      setIsGeneratingFromPrompt(false);
    }
  };

  const handleUseTemplate = (template: typeof workflowTemplates[0]) => {
    setPrompt(template.prompt);
    setSelectedTemplate(template.id);
  };

  const isLoading = isGenerating || isGeneratingFromPrompt;

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
              Describe your business process and let AI build it for you
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
                  disabled={isLoading}
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
                onClick={handleGenerateFromPrompt}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {isLoading ? (
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
                onClick={handleGenerateFromTemplate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {isLoading ? (
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