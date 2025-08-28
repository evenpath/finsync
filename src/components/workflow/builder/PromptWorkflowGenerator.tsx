
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

  // Intelligent layout algorithms based on workflow patterns
  const analyzeWorkflowPattern = (steps: StepSchema[]) => {
    const hasConditionals = steps.some(step => step.type === 'conditional_branch');
    const hasMultipleBranches = steps.some(step => step.branches && step.branches.length > 2);
    const hasParallelPaths = steps.filter(step => step.type === 'human_input').length > 1;
    const hasApprovals = steps.some(step => step.name.toLowerCase().includes('approval') || step.name.toLowerCase().includes('review'));
    const hasDifferentRoles = new Set(steps.map(step => {
      if (step.type === 'human_input' || step.type === 'human_action') return 'human';
      if (step.type === 'ai_agent') return 'ai';
      if (step.type === 'api_call') return 'system';
      if (step.type === 'notification') return 'communication';
      return 'other';
    })).size;

    // Determine the best layout pattern
    if (hasDifferentRoles >= 3) return 'swimlane';
    if (hasMultipleBranches) return 'decision_tree';
    if (hasApprovals && hasConditionals) return 'approval_chain';
    if (hasParallelPaths) return 'parallel_flow';
    return 'linear_flow';
  };

  // Advanced layout algorithms
  const createProfessionalLayout = (steps: StepSchema[], pattern: string) => {
    const layouts = {
      swimlane: createSwimlaneLayout,
      decision_tree: createDecisionTreeLayout,
      approval_chain: createApprovalChainLayout,
      parallel_flow: createParallelFlowLayout,
      linear_flow: createLinearFlowLayout
    };
    
    return layouts[pattern as keyof typeof layouts](steps);
  };

  // Swimlane Layout: Different roles in horizontal lanes
  const createSwimlaneLayout = (steps: StepSchema[]) => {
    const lanes = {
      trigger: { y: 100, color: 'emerald' },
      human: { y: 300, color: 'orange' },
      ai: { y: 500, color: 'purple' },
      system: { y: 700, color: 'cyan' },
      communication: { y: 900, color: 'pink' }
    };
    
    const nodes: Array<{step: StepSchema, position: {x: number, y: number}, lane: string}> = [];
    let xPosition = 200;
    
    steps.forEach((step, index) => {
      const lane = step.type === 'human_input' || step.type === 'human_action' ? 'human' :
                   step.type === 'ai_agent' ? 'ai' :
                   step.type === 'api_call' ? 'system' :
                   step.type === 'notification' ? 'communication' : 'trigger';
      
      nodes.push({
        step,
        position: { x: xPosition, y: lanes[lane as keyof typeof lanes].y },
        lane
      });
      
      xPosition += 400;
    });
    
    return nodes;
  };

  // Decision Tree Layout: Central decision with radiating branches
  const createDecisionTreeLayout = (steps: StepSchema[]) => {
    const nodes: Array<{step: StepSchema, position: {x: number, y: number}, lane: string}> = [];
    const centerX = 600;
    const centerY = 400;
    let mainFlowX = 200;
    
    steps.forEach((step, index) => {
      if (step.type === 'conditional_branch') {
        // Place decision node at strategic center
        nodes.push({
          step,
          position: { x: centerX, y: centerY },
          lane: 'main'
        });
        
        // Arrange branches in a fan pattern
        if (step.branches) {
          const angleStep = Math.PI / (step.branches.length + 1);
          step.branches.forEach((branch, branchIndex) => {
            const angle = angleStep * (branchIndex + 1) - Math.PI / 2;
            const branchRadius = 300;
            let branchX = centerX + Math.cos(angle) * branchRadius;
            let branchY = centerY + Math.sin(angle) * branchRadius;
            
            branch.steps.forEach((branchStep, stepIndex) => {
              nodes.push({
                step: branchStep,
                position: { 
                  x: branchX + (stepIndex * 250), 
                  y: branchY + (stepIndex * 50)
                },
                lane: `branch_${branchIndex}`
              });
            });
          });
        }
      } else {
        // Main flow nodes
        nodes.push({
          step,
          position: { x: mainFlowX, y: centerY },
          lane: 'main'
        });
        mainFlowX += 400;
      }
    });
    
    return nodes;
  };

  // Approval Chain Layout: Vertical hierarchy with escalation paths
  const createApprovalChainLayout = (steps: StepSchema[]) => {
    const nodes: Array<{step: StepSchema, position: {x: number, y: number}, lane: string}> = [];
    let currentX = 200;
    const levels = {
      trigger: 100,
      processing: 250,
      approval: 400,
      senior_approval: 550,
      execution: 700,
      notification: 850
    };
    
    steps.forEach((step, index) => {
      const stepName = step.name.toLowerCase();
      let level = 'processing';
      
      if (step.type === 'conditional_branch' || stepName.includes('trigger') || stepName.includes('start')) level = 'trigger';
      else if (stepName.includes('senior') || stepName.includes('executive')) level = 'senior_approval';
      else if (stepName.includes('approval') || stepName.includes('review')) level = 'approval';
      else if (stepName.includes('execute') || stepName.includes('process')) level = 'execution';
      else if (stepName.includes('notify') || stepName.includes('email')) level = 'notification';
      
      nodes.push({
        step,
        position: { x: currentX, y: levels[level as keyof typeof levels] },
        lane: level
      });
      
      currentX += 350;
    });
    
    return nodes;
  };

  // Parallel Flow Layout: Multiple simultaneous paths
  const createParallelFlowLayout = (steps: StepSchema[]) => {
    const nodes: Array<{step: StepSchema, position: {x: number, y: number}, lane: string}> = [];
    const paths: {[key: string]: {x: number, y: number}} = {
      main: { x: 200, y: 300 },
      parallel_1: { x: 200, y: 150 },
      parallel_2: { x: 200, y: 450 },
      parallel_3: { x: 200, y: 600 }
    };
    
    let pathIndex = 0;
    
    steps.forEach((step, index) => {
      let pathName = 'main';
      
      // Assign parallel paths based on step type
      if (step.type === 'human_input' && pathIndex === 0) {
        pathName = 'parallel_1';
        pathIndex++;
      } else if (step.type === 'ai_agent' && pathIndex === 1) {
        pathName = 'parallel_2';
        pathIndex++;
      } else if (step.type === 'notification' && pathIndex === 2) {
        pathName = 'parallel_3';
        pathIndex++;
      }
      
      const path = paths[pathName];
      nodes.push({
        step,
        position: { x: path.x, y: path.y },
        lane: pathName
      });
      
      path.x += 350;
    });
    
    return nodes;
  };

  // Linear Flow Layout: Improved straight-line flow
  const createLinearFlowLayout = (steps: StepSchema[]) => {
    const nodes: Array<{step: StepSchema, position: {x: number, y: number}, lane: string}> = [];
    let xPosition = 200;
    const yPosition = 350;
    
    steps.forEach((step, index) => {
      nodes.push({
        step,
        position: { x: xPosition, y: yPosition },
        lane: 'main'
      });
      
      xPosition += 380;
    });
    
    return nodes;
  };

  // Convert AI steps to WorkflowBuilderNodes with intelligent layout
  const convertAIStepsToWorkflowNodes = (aiSteps: StepSchema[]): { nodes: WorkflowBuilderNode[], connections: NodeConnection[] } => {
    const nodes: WorkflowBuilderNode[] = [];
    const connections: NodeConnection[] = [];
    
    // Analyze workflow pattern and choose best layout
    const workflowPattern = analyzeWorkflowPattern(aiSteps);
    console.log(`Detected workflow pattern: ${workflowPattern}`);
    
    // Create professional layout
    const layoutNodes = createProfessionalLayout(aiSteps, workflowPattern);

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
          return {
            type: 'data_integration' as const,
            subType: 'api-call',
            icon: 'Globe',
            color: 'bg-cyan-500'
          };
      }
    };

    // Add trigger node if needed
    let hasExplicitTrigger = aiSteps.some(step => 
      step.type.includes('trigger') || 
      step.name.toLowerCase().includes('start') ||
      step.name.toLowerCase().includes('trigger')
    );

    if (!hasExplicitTrigger) {
      const triggerPosition = workflowPattern === 'swimlane' ? { x: 50, y: 100 } : 
                             workflowPattern === 'approval_chain' ? { x: 50, y: 100 } :
                             { x: 50, y: 350 };
      
      const triggerNode: WorkflowBuilderNode = {
        id: generateNodeId(),
        type: 'trigger',
        subType: 'manual-trigger',
        name: 'Start Workflow',
        description: 'Manually trigger the workflow',
        position: triggerPosition,
        config: { triggerLabel: 'Start Workflow' },
        icon: 'Play',
        color: 'bg-emerald-500',
        category: 'trigger'
      };
      nodes.push(triggerNode);
    }

    let previousMainNode: WorkflowBuilderNode | null = nodes.length > 0 ? nodes[0] : null;

    // Convert layout nodes to WorkflowBuilderNodes
    layoutNodes.forEach((layoutNode, index) => {
      const nodeTypeMapping = getNodeTypeMapping(layoutNode.step.type, layoutNode.step.name, layoutNode.step.description);
      
      const node: WorkflowBuilderNode = {
        id: layoutNode.step.id || generateNodeId(),
        type: nodeTypeMapping.type,
        subType: nodeTypeMapping.subType,
        name: layoutNode.step.name,
        description: layoutNode.step.description,
        position: layoutNode.position,
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
            systemPrompt: `Process and analyze data for: ${layoutNode.step.description}`
          };
          break;
        
        case 'human-task':
        case 'approval-gate':
        case 'review-task':
          node.config = {
            instructions: layoutNode.step.description,
            assignmentMethod: 'auto',
            priority: layoutNode.lane.includes('senior') || layoutNode.lane.includes('high') ? 'high' : 'medium'
          };
          break;
        
        case 'email-send':
        case 'notification':
        case 'slack-message':
          node.config = {
            channel: nodeTypeMapping.subType.includes('email') ? 'email' : 
                     nodeTypeMapping.subType.includes('slack') ? 'slack' : 'notification',
            template: `Automated message: ${layoutNode.step.description}`
          };
          break;
        
        case 'api-call':
          node.config = {
            url: 'https://api.example.com',
            method: 'POST',
            description: layoutNode.step.description
          };
          break;
      }

      nodes.push(node);

      // Create connections for main flow
      if (previousMainNode && layoutNode.lane === 'main') {
        const connection: NodeConnection = {
          id: generateConnectionId(previousMainNode.id, node.id),
          source: previousMainNode.id,
          target: node.id,
          label: ''
        };
        connections.push(connection);
      }

      if (layoutNode.lane === 'main' || !previousMainNode) {
        previousMainNode = node;
      }

      // Handle conditional branches with intelligent positioning
      if (layoutNode.step.branches && layoutNode.step.branches.length > 0) {
        layoutNode.step.branches.forEach((branch, branchIndex) => {
          let branchNodes: WorkflowBuilderNode[] = [];
          
          branch.steps.forEach((branchStep, branchStepIndex) => {
            const branchNodeTypeMapping = getNodeTypeMapping(branchStep.type, branchStep.name, branchStep.description);
            
            // Calculate branch positioning based on layout pattern
            let branchPosition = { x: 0, y: 0 };
            
            switch (workflowPattern) {
              case 'decision_tree':
                const angle = (Math.PI / (layoutNode.step.branches!.length + 1)) * (branchIndex + 1) - Math.PI / 2;
                const radius = 350 + (branchStepIndex * 150);
                branchPosition = {
                  x: node.position.x + Math.cos(angle) * radius,
                  y: node.position.y + Math.sin(angle) * radius
                };
                break;
                
              case 'swimlane':
                branchPosition = {
                  x: node.position.x + 400 + (branchStepIndex * 350),
                  y: 100 + (branchIndex * 200) + (branchIndex * 100)
                };
                break;
                
              default:
                branchPosition = {
                  x: node.position.x + 400 + (branchStepIndex * 300),
                  y: node.position.y + (branchIndex * 200) - 100
                };
            }
            
            const branchNode: WorkflowBuilderNode = {
              id: branchStep.id || generateNodeId(),
              type: branchNodeTypeMapping.type,
              subType: branchNodeTypeMapping.subType,
              name: branchStep.name,
              description: branchStep.description,
              position: branchPosition,
              config: {},
              icon: branchNodeTypeMapping.icon,
              color: branchNodeTypeMapping.color,
              category: branchNodeTypeMapping.type
            };

            // Branch-specific configuration
            switch (branchNodeTypeMapping.subType) {
              case 'human-task':
              case 'approval-gate':
                branchNode.config = {
                  instructions: branchStep.description,
                  assignmentMethod: 'auto',
                  priority: branchIndex === 0 ? 'high' : 'medium'
                };
                break;
              case 'ai-analyzer':
                branchNode.config = {
                  provider: 'OpenAI',
                  model: 'gpt-4',
                  systemPrompt: `Branch processing: ${branchStep.description}`
                };
                break;
            }

            branchNodes.push(branchNode);
          });

          nodes.push(...branchNodes);

          // Connect conditional node to branch
          if (branchNodes.length > 0) {
            const branchConnection: NodeConnection = {
              id: generateConnectionId(node.id, branchNodes[0].id),
              source: node.id,
              target: branchNodes[0].id,
              label: branch.condition || `Branch ${branchIndex + 1}`
            };
            connections.push(branchConnection);

            // Connect sequential branch nodes
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
    });

    // Final positioning optimization
    if (nodes.length > 0) {
      // Calculate bounds
      const minX = Math.min(...nodes.map(n => n.position.x));
      const maxX = Math.max(...nodes.map(n => n.position.x));
      const minY = Math.min(...nodes.map(n => n.position.y));
      const maxY = Math.max(...nodes.map(n => n.position.y));
      
      // Center on canvas if workflow is small
      const workflowWidth = maxX - minX;
      const workflowHeight = maxY - minY;
      
      if (workflowWidth < 800) {
        const centerOffsetX = Math.max(50, (1200 - workflowWidth) / 2 - minX);
        nodes.forEach(node => {
          node.position.x += centerOffsetX;
        });
      }
      
      if (workflowHeight < 400 && workflowPattern !== 'swimlane') {
        const centerOffsetY = Math.max(50, (600 - workflowHeight) / 2 - minY);
        nodes.forEach(node => {
          node.position.y += centerOffsetY;
        });
      }
      
      // Ensure minimum spacing
      nodes.forEach((node, index) => {
        if (node.position.x < 50) node.position.x = 50;
        if (node.position.y < 50) node.position.y = 50;
      });
    }

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
