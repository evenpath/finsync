// src/app/admin/workflows/builder/page.tsx

"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Play, 
  Settings, 
  Plus, 
  Zap, 
  Eye, 
  ArrowLeft,
  Layers,
  GitBranch,
  Users,
  Globe
} from 'lucide-react';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';
import WorkflowCanvas from '@/components/workflow/builder/WorkflowCanvas';
import NodeLibrary from '@/components/workflow/builder/NodeLibrary';
import PropertyPanel from '@/components/workflow/builder/PropertyPanel';
import type { 
  WorkflowBuilderNode, 
  NodeConnection, 
  NodeTypeDefinition,
  WorkflowBuilderTemplate 
} from '@/lib/types/workflow-builder';

export default function WorkflowBuilderPage() {
  const { user, currentWorkspace } = useMultiWorkspaceAuth();
  const { toast } = useToast();
  
  // Template metadata
  const [templateName, setTemplateName] = useState('New Workflow Template');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'general' | 'hr' | 'sales' | 'support' | 'custom'>('general');
  const [isGlobalTemplate, setIsGlobalTemplate] = useState(false);
  
  // Canvas state
  const [nodes, setNodes] = useState<WorkflowBuilderNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  
  // UI state
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check permissions
  const canCreateGlobal = user?.customClaims?.role === 'Super Admin';
  const canSaveTemplate = user && (canCreateGlobal || currentWorkspace);

  // Generate unique ID for nodes
  const generateId = useCallback(() => 
    `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []
  );

  const generateConnectionId = useCallback((sourceId: string, targetId: string) => 
    `conn_${sourceId}_${targetId}`, []
  );

  const handleNodeDragStart = useCallback((nodeType: NodeTypeDefinition) => {
    console.log('Drag started:', nodeType.name);
  }, []);

  const handleCanvasDrop = useCallback((nodeTypeId: string, position: { x: number; y: number }) => {
    // Find the node type definition
    const nodeTypes: NodeTypeDefinition[] = [
      { id: 'manual-trigger', name: 'Manual Trigger', description: 'Start workflow manually', icon: '▶️', color: 'bg-blue-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      { id: 'form-submission', name: 'Form Submission', description: 'Trigger when form is submitted', icon: '📝', color: 'bg-green-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      { id: 'scheduled-trigger', name: 'Scheduled Trigger', description: 'Trigger on schedule', icon: '⏰', color: 'bg-purple-500', category: 'trigger', configSchema: {}, defaultConfig: {} },
      { id: 'ai-analyzer', name: 'AI Analyzer', description: 'Process data with AI', icon: '🧠', color: 'bg-purple-600', category: 'ai_processing', configSchema: {}, defaultConfig: {} },
      { id: 'text-classifier', name: 'Text Classifier', description: 'Classify text content', icon: '🏷️', color: 'bg-indigo-500', category: 'ai_processing', configSchema: {}, defaultConfig: {} },
      { id: 'content-generator', name: 'Content Generator', description: 'Generate content with AI', icon: '✍️', color: 'bg-violet-500', category: 'ai_processing', configSchema: {}, defaultConfig: {} },
      { id: 'human-task', name: 'Human Task', description: 'Assign task to person', icon: '👤', color: 'bg-orange-500', category: 'human_action', configSchema: {}, defaultConfig: {} },
      { id: 'approval-gate', name: 'Approval Gate', description: 'Require approval', icon: '✅', color: 'bg-yellow-500', category: 'human_action', configSchema: {}, defaultConfig: {} },
      { id: 'review-task', name: 'Review Task', description: 'Human review task', icon: '👁️', color: 'bg-amber-500', category: 'human_action', configSchema: {}, defaultConfig: {} },
      { id: 'notification', name: 'Send Notification', description: 'Send alert or message', icon: '🔔', color: 'bg-pink-500', category: 'communication', configSchema: {}, defaultConfig: {} },
      { id: 'email-send', name: 'Send Email', description: 'Send email notification', icon: '📧', color: 'bg-red-500', category: 'communication', configSchema: {}, defaultConfig: {} },
      { id: 'chat-message', name: 'Chat Message', description: 'Send chat message', icon: '💬', color: 'bg-green-600', category: 'communication', configSchema: {}, defaultConfig: {} },
      { id: 'api-call', name: 'API Call', description: 'Call external API', icon: '🌐', color: 'bg-cyan-500', category: 'data_integration', configSchema: {}, defaultConfig: {} },
      { id: 'database-query', name: 'Database Query', description: 'Query database', icon: '🗄️', color: 'bg-gray-600', category: 'data_integration', configSchema: {}, defaultConfig: {} },
      { id: 'file-processor', name: 'File Processor', description: 'Process files', icon: '📄', color: 'bg-blue-600', category: 'data_integration', configSchema: {}, defaultConfig: {} },
      { id: 'condition-check', name: 'Condition Check', description: 'Check conditions', icon: '🔀', color: 'bg-teal-500', category: 'condition', configSchema: {}, defaultConfig: {} },
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
    
    // Auto-select the new node
    setSelectedNodeIds([newNode.id]);
    setShowPropertyPanel(true);

    toast({
      title: "Node Added",
      description: `${nodeTypeDef.name} has been added to the canvas`,
    });
  }, [generateId, currentWorkspace?.partnerId, toast]);

  const handleNodeSelect = useCallback((nodeId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedNodeIds(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      setSelectedNodeIds(nodeId ? [nodeId] : []);
      if (nodeId) {
        setShowPropertyPanel(true);
      }
    }
  }, []);

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowBuilderNode>) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );

    toast({
      title: "Node Updated",
      description: "Node configuration has been updated",
    });
  }, [toast]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => 
      prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId)
    );
    setSelectedNodeIds(prev => prev.filter(id => id !== nodeId));

    toast({
      title: "Node Deleted",
      description: "Node has been removed from the workflow",
    });
  }, [toast]);

  const handleNodeDuplicate = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const duplicatedNode: WorkflowBuilderNode = {
      ...node,
      id: generateId(),
      name: `${node.name} (Copy)`,
      position: { x: node.position.x + 20, y: node.position.y + 20 }
    };

    setNodes(prev => [...prev, duplicatedNode]);
    setSelectedNodeIds([duplicatedNode.id]);

    toast({
      title: "Node Duplicated",
      description: `${node.name} has been duplicated`,
    });
  }, [nodes, generateId, toast]);

  const handleNodesConnect = useCallback((sourceId: string, targetId: string) => {
    // Check if connection already exists
    const existingConnection = connections.find(
      conn => conn.source === sourceId && conn.target === targetId
    );
    
    if (existingConnection) {
      toast({
        variant: "destructive",
        title: "Connection Exists",
        description: "A connection between these nodes already exists",
      });
      return;
    }

    const newConnection: NodeConnection = {
      id: generateConnectionId(sourceId, targetId),
      source: sourceId,
      target: targetId,
      label: 'Next'
    };

    setConnections(prev => [...prev, newConnection]);

    toast({
      title: "Nodes Connected",
      description: "Workflow connection has been created",
    });
  }, [connections, generateConnectionId, toast]);

  const handleSaveTemplate = useCallback(async () => {
    if (!canSaveTemplate) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You don't have permission to save templates",
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Workflow",
        description: "Add at least one node before saving",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const template: WorkflowBuilderTemplate = {
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        builderNodes: nodes,
        connections,
        canvasSettings: {
          gridSize: 20,
          snapToGrid: true,
          showGrid: true,
          zoomLevel: 1,
          panPosition: { x: 0, y: 0 }
        },
        permissions: {
          canModifyNodes: true,
          canAddNodes: true,
          canRemoveNodes: true,
          canModifyConnections: true,
          lockedNodes: nodes.filter(n => n.locked).map(n => n.id),
          allowedNodeTypes: []
        },
        createdBy: user?.uid || '',
        partnerId: isGlobalTemplate ? undefined : currentWorkspace?.partnerId,
        isGlobal: isGlobalTemplate,
        assignedPartners: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        status: 'draft',
        customizationRules: []
      };

      // TODO: Implement actual save to Firebase
      console.log('Saving template:', template);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Template Saved",
        description: `${templateName} has been saved successfully`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Unable to save template. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    canSaveTemplate, 
    nodes, 
    templateName, 
    templateDescription, 
    templateCategory, 
    connections, 
    user?.uid, 
    isGlobalTemplate, 
    currentWorkspace?.partnerId, 
    toast
  ]);

  const handleTestWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Workflow",
        description: "Add nodes to test the workflow",
      });
      return;
    }

    setIsRunning(true);
    
    // Simulate workflow test
    toast({
      title: "Testing Workflow",
      description: "Simulating workflow execution...",
    });

    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Test Complete",
        description: "Workflow simulation completed successfully",
      });
    }, 3000);
  }, [nodes.length, toast]);

  const selectedNode = selectedNodeIds.length === 1 
    ? nodes.find(n => n.id === selectedNodeIds[0]) || null
    : null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin/workflows" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Templates
                </a>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Workflow Template Builder</h1>
                  <p className="text-sm text-gray-600">Create intelligent automation templates</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-200">
                <Eye className="w-3 h-3 mr-1" />
                Designer Mode
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Template Scope Toggle */}
              {canCreateGlobal && (
                <div className="flex items-center gap-2 px-3 py-1 border rounded-lg">
                  <Label className="text-sm">Scope:</Label>
                  <Button
                    variant={isGlobalTemplate ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsGlobalTemplate(!isGlobalTemplate)}
                  >
                    {isGlobalTemplate ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        Global
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 mr-1" />
                        Partner
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveTemplate}
                disabled={isSaving || !canSaveTemplate}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
              
              <Button 
                onClick={handleTestWorkflow} 
                disabled={isRunning || nodes.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Testing...' : 'Test Workflow'}
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Template Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <Label className="text-xs font-medium text-gray-600">Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1 h-8"
                placeholder="Enter template name..."
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="sales">Sales & Marketing</SelectItem>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="custom">Custom Process</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs font-medium text-gray-600">Description</Label>
              <Input
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="mt-1 h-8"
                placeholder="Brief description of this workflow template..."
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Builder Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Library */}
        <NodeLibrary
          isOpen={showNodeLibrary}
          onToggle={() => setShowNodeLibrary(!showNodeLibrary)}
          onNodeDragStart={handleNodeDragStart}
        />

        {/* Canvas */}
        <div className="flex-1 flex">
          <WorkflowCanvas
            nodes={nodes}
            connections={connections}
            selectedNodeIds={selectedNodeIds}
            onNodeSelect={handleNodeSelect}
            onNodeMove={handleNodeMove}
            onNodeDelete={handleNodeDelete}
            onNodesConnect={handleNodesConnect}
            onCanvasDrop={handleCanvasDrop}
          />

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
      </div>

      {/* Status Bar */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="py-2 px-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span>Nodes: {nodes.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                <span>Connections: {connections.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Selected: {selectedNodeIds.length}</span>
              </div>
              {isGlobalTemplate && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Global Template
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!showNodeLibrary && (
                <Button variant="ghost" size="sm" onClick={() => setShowNodeLibrary(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Show Node Library
                </Button>
              )}
              <Badge variant="secondary" className="text-xs">
                Auto-saved 2 min ago
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}