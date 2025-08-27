// src/app/admin/workflows/builder/page.tsx

"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Play, 
  ArrowLeft,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';
import WorkflowCanvas from '@/components/workflow/builder/WorkflowCanvas';
import NodeLibrary from '@/components/workflow/builder/NodeLibrary';
import PropertyPanel from '@/components/workflow/builder/PropertyPanel';
import PromptWorkflowGenerator from '@/components/workflow/builder/PromptWorkflowGenerator';
import type { 
  WorkflowBuilderNode, 
  NodeConnection, 
  NodeTypeDefinition 
} from '@/lib/types/workflow-builder';

export default function WorkflowBuilderPage() {
  const { user, currentWorkspace } = useMultiWorkspaceAuth();
  const { toast } = useToast();
  
  // Core workflow state
  const [nodes, setNodes] = useState<WorkflowBuilderNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  
  // UI state
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateId = useCallback(() => 
    `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []
  );

  const generateConnectionId = useCallback((sourceId: string, targetId: string) => 
    `conn_${sourceId}_${targetId}_${Date.now()}`, []
  );

  const handleGenerateWorkflow = useCallback(async (generatedNodes: WorkflowBuilderNode[], generatedConnections: NodeConnection[]) => {
    setIsGenerating(true);
    
    try {
      // Position nodes left-to-right with proper spacing
      const positionedNodes = generatedNodes.map((node, index) => ({
        ...node,
        position: {
          x: 50 + (index * 350), // Left-to-right layout with more space
          y: 100 + (Math.sin(index * 0.5) * 80) // Slight vertical variation
        }
      }));
      
      setNodes(positionedNodes);
      setConnections(generatedConnections);
      setSelectedNodeIds([]);
      setShowPromptGenerator(false);
      
      toast({
        title: "Workflow Generated",
        description: `Created ${generatedNodes.length} nodes with ${generatedConnections.length} connections`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Unable to generate workflow. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const handleNodeDrop = useCallback((nodeTypeId: string, position: { x: number; y: number }) => {
    const nodeTypes: NodeTypeDefinition[] = [
      // Triggers
      { id: 'manual-trigger', name: 'Manual Start', description: 'Start workflow manually', icon: '▶️', color: 'bg-emerald-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      { id: 'form-submission', name: 'Form Trigger', description: 'Form submission trigger', icon: '📝', color: 'bg-blue-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      { id: 'webhook', name: 'Webhook', description: 'HTTP webhook endpoint', icon: '🌐', color: 'bg-indigo-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      { id: 'scheduled-trigger', name: 'Schedule', description: 'Time-based automation', icon: '⏰', color: 'bg-purple-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      
      // AI Processing
      { id: 'ai-analyzer', name: 'AI Agent', description: 'AI processing agent', icon: '🤖', color: 'bg-purple-500', category: 'ai_processing', configSchema: {}, defaultConfig: { model: 'gpt-4', provider: 'OpenAI' } },
      { id: 'text-classifier', name: 'Text Classifier', description: 'Categorize and tag content', icon: '🏷️', color: 'bg-indigo-500', category: 'ai_processing', configSchema: {}, defaultConfig: {} },
      { id: 'sentiment-analyzer', name: 'Sentiment Analysis', description: 'Analyze emotional tone', icon: '😊', color: 'bg-pink-500', category: 'ai_processing', configSchema: {}, defaultConfig: {} },
      { id: 'content-generator', name: 'Content Generator', description: 'Generate text content', icon: '✍️', color: 'bg-violet-500', category: 'ai_processing', configSchema: {}, defaultConfig: {} },
      
      // Human Actions
      { id: 'human-task', name: 'Human Task', description: 'Manual task assignment', icon: '👤', color: 'bg-orange-500', category: 'human_action', configSchema: {}, defaultConfig: {} },
      { id: 'approval-gate', name: 'Approval Gate', description: 'Approval checkpoint', icon: '✅', color: 'bg-yellow-500', category: 'human_action', configSchema: {}, defaultConfig: {} },
      { id: 'review-task', name: 'Review Task', description: 'Content review and validation', icon: '👁️', color: 'bg-amber-500', category: 'human_action', configSchema: {}, defaultConfig: {} },
      
      // Communication
      { id: 'notification', name: 'Notification', description: 'Send notification', icon: '🔔', color: 'bg-pink-500', category: 'communication', configSchema: {}, defaultConfig: {} },
      { id: 'email-send', name: 'Email', description: 'Send email message', icon: '📧', color: 'bg-red-500', category: 'communication', configSchema: {}, defaultConfig: {} },
      { id: 'slack-message', name: 'Slack Message', description: 'Post to Slack channel', icon: '💬', color: 'bg-green-500', category: 'communication', configSchema: {}, defaultConfig: {} },
      
      // Data Integration
      { id: 'api-call', name: 'API Integration', description: 'External API call', icon: '🌐', color: 'bg-cyan-500', category: 'data_integration', configSchema: {}, defaultConfig: {} },
      { id: 'database-query', name: 'Database', description: 'Query database records', icon: '🗄️', color: 'bg-gray-600', category: 'data_integration', configSchema: {}, defaultConfig: {} },
      { id: 'file-processor', name: 'File Processor', description: 'Process uploaded files', icon: '📄', color: 'bg-blue-600', category: 'data_integration', configSchema: {}, defaultConfig: {} },
      
      // Logic & Control
      { id: 'condition-check', name: 'Condition', description: 'Conditional logic', icon: '🔀', color: 'bg-teal-500', category: 'condition', configSchema: {}, defaultConfig: {} },
      { id: 'delay', name: 'Delay', description: 'Wait before continuing', icon: '⏱️', color: 'bg-gray-500', category: 'condition', configSchema: {}, defaultConfig: {} },
    ];
    
    const nodeTypeDef = nodeTypes.find(nt => nt.id === nodeTypeId);
    if (!nodeTypeDef) return;

    const newNode: WorkflowBuilderNode = {
      id: generateId(),
      type: nodeTypeDef.category,
      subType: nodeTypeId,
      name: nodeTypeDef.name,
      description: nodeTypeDef.description,
      position,
      config: { ...nodeTypeDef.defaultConfig },
      icon: nodeTypeDef.icon,
      color: nodeTypeDef.color,
      category: nodeTypeDef.category,
      workspaceId: currentWorkspace?.partnerId || 'global'
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeIds([newNode.id]);
    setShowPropertyPanel(true);

    toast({
      title: "Node Added",
      description: `${nodeTypeDef.name} added to workflow`,
    });
  }, [generateId, currentWorkspace?.partnerId, toast]);

  const handleNodeSelect = useCallback((nodeIds: string[]) => {
    setSelectedNodeIds(nodeIds);
    setShowPropertyPanel(nodeIds.length === 1);
  }, []);

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, position } : node
    ));
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowBuilderNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const handleNodeDuplicate = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const duplicatedNode: WorkflowBuilderNode = {
      ...node,
      id: generateId(),
      name: `${node.name} (Copy)`,
      position: { x: node.position.x + 50, y: node.position.y + 50 }
    };

    setNodes(prev => [...prev, duplicatedNode]);
    setSelectedNodeIds([duplicatedNode.id]);

    toast({
      title: "Node Duplicated",
      description: `${node.name} has been duplicated`,
    });
  }, [nodes, generateId, toast]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    setSelectedNodeIds(prev => prev.filter(id => id !== nodeId));

    toast({
      title: "Node Deleted",
      description: "Node removed from workflow",
    });
  }, [toast]);

  const handleNodesConnect = useCallback((sourceId: string, targetId: string) => {
    // Check if connection already exists
    const existingConnection = connections.find(
      conn => conn.source === sourceId && conn.target === targetId
    );
    
    if (existingConnection) {
      toast({
        variant: "destructive",
        title: "Connection Exists",
        description: "These nodes are already connected",
      });
      return;
    }

    const newConnection: NodeConnection = {
      id: generateConnectionId(sourceId, targetId),
      source: sourceId,
      target: targetId,
      label: ''
    };

    setConnections(prev => [...prev, newConnection]);

    toast({
      title: "Nodes Connected",
      description: "Connection created successfully",
    });
  }, [connections, generateConnectionId, toast]);

  const handleSaveWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Workflow",
        description: "Add at least one node before saving",
      });
      return;
    }

    const workflowName = nodes.length > 0 ? `${nodes[0].name} Workflow` : 'Custom Workflow';
    
    toast({
      title: "Workflow Saved",
      description: `${workflowName} saved successfully`,
    });
  }, [nodes, toast]);

  const selectedNode = selectedNodeIds.length === 1 
    ? nodes.find(n => n.id === selectedNodeIds[0]) || null 
    : null;

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white">
            <a href="/admin/workflows" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </a>
          </Button>
          <div className="h-4 w-px bg-slate-600" />
          <h1 className="font-semibold text-white">Workflow Builder</h1>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-slate-400">Live</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPromptGenerator(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          
          <Button variant="outline" disabled={nodes.length === 0} className="border-slate-600 text-slate-300">
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          
          <Button onClick={handleSaveWorkflow} disabled={nodes.length === 0} className="bg-emerald-500 hover:bg-emerald-600">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Library */}
        <NodeLibrary
          isOpen={showNodeLibrary}
          onToggle={() => setShowNodeLibrary(!showNodeLibrary)}
          onNodeDragStart={() => {}}
        />

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            nodes={nodes}
            connections={connections}
            selectedNodeIds={selectedNodeIds}
            onNodeSelect={handleNodeSelect}
            onNodeMove={handleNodeMove}
            onNodeDelete={handleNodeDelete}
            onNodesConnect={handleNodesConnect}
            onCanvasDrop={handleNodeDrop}
            zoom={1}
            pan={{ x: 0, y: 0 }}
            onZoomChange={() => {}}
            onPanChange={() => {}}
          />

          {/* Floating Controls */}
          {!showNodeLibrary && (
            <div className="absolute top-4 right-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => setShowNodeLibrary(true)}
              >
                <Layers className="w-4 h-4 mr-2" />
                Nodes
              </Button>
            </div>
          )}

          {/* Status Bar */}
          <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300">
            {nodes.length} nodes • {connections.length} connections
          </div>

          {/* Clear Button */}
          {nodes.length > 0 && (
            <div className="absolute bottom-4 right-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setNodes([]);
                  setConnections([]);
                  setSelectedNodeIds([]);
                  setShowPropertyPanel(false);
                }}
                className="bg-slate-800 border-slate-600 text-red-400 hover:bg-red-950 hover:border-red-600"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Property Panel */}
        <PropertyPanel
          selectedNode={selectedNode}
          isOpen={showPropertyPanel}
          onClose={() => setShowPropertyPanel(false)}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onNodeDuplicate={handleNodeDuplicate}
        />
      </div>

      {/* AI Generator Modal */}
      <Dialog open={showPromptGenerator} onOpenChange={setShowPromptGenerator}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Workflow Generator
            </DialogTitle>
          </DialogHeader>
          <PromptWorkflowGenerator
            onGenerateWorkflow={handleGenerateWorkflow}
            isGenerating={isGenerating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}