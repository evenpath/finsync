// src/components/workflow/builder/WorkflowCanvas.tsx

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  EdgeChange,
  NodeChange,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, Copy, Bot, Users, Mail, Globe, Target, 
         Database, FileText, CheckCircle, Clock, Filter, Phone, 
         MessageSquare, Calendar, Webhook, Play, Zap, Search } from 'lucide-react';
import type { WorkflowBuilderNode, NodeConnection } from '@/lib/types/workflow-builder';

interface WorkflowCanvasProps {
  nodes: WorkflowBuilderNode[];
  connections: NodeConnection[];
  selectedNodeIds: string[];
  onNodeSelect: (nodeIds: string[]) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodesConnect: (sourceId: string, targetId: string) => void;
  onCanvasDrop: (nodeType: string, position: { x: number; y: number }) => void;
  zoom: number;
  pan: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
}

// Icon mapping for node types
const getIconForNode = (node: WorkflowBuilderNode) => {
  const iconMap = {
    'manual-trigger': Play,
    'form-submission': FileText,
    'webhook': Webhook,
    'scheduled-trigger': Clock,
    'ai-analyzer': Bot,
    'text-classifier': Target,
    'sentiment-analyzer': MessageSquare,
    'content-generator': FileText,
    'human-task': Users,
    'approval-gate': CheckCircle,
    'review-task': Search,
    'notification': MessageSquare,
    'email-send': Mail,
    'slack-message': MessageSquare,
    'api-call': Globe,
    'database-query': Database,
    'file-processor': FileText,
    'condition-check': Target,
    'delay': Clock
  };
  
  return iconMap[node.subType as keyof typeof iconMap] || Zap;
};

// Custom Node Component with improved typography
function WorkflowNodeComponent({ data, selected }: { data: any; selected: boolean }) {
  const node: WorkflowBuilderNode = data.nodeData;
  const IconComponent = getIconForNode(node);

  return (
    <div className={`transition-all duration-200 ${selected ? 'scale-105' : ''}`}>
      <Card className={`w-64 border-2 transition-all ${
        selected ? 'border-emerald-400 shadow-2xl' : 'border-slate-600 hover:border-slate-500'
      } bg-slate-800 overflow-hidden`}>
        {/* Node Header - Reduced height and improved typography */}
        <div className={`h-10 ${node.color} flex items-center px-3 gap-2`}>
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-md flex items-center justify-center text-white">
            <IconComponent className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">{node.name}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-5 h-5 p-0 text-white hover:bg-white hover:bg-opacity-20"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {/* Node Content - Reduced padding and font sizes */}
        <div className="p-3 text-slate-300">
          <p className="text-xs text-slate-400 mb-2 line-clamp-2">{node.description}</p>
          {node.config?.model && (
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs border-slate-500 text-slate-300 h-5">
                {node.config.model}
              </Badge>
              {node.config.provider && (
                <span className="text-xs text-slate-500">{node.config.provider}</span>
              )}
            </div>
          )}
        </div>

        {/* Selection glow */}
        {selected && (
          <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400 rounded-lg shadow-lg shadow-emerald-400/30" />
        )}
      </Card>
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#64748b', width: '10px', height: '10px', left: '-5px', border: '2px solid #1e293b' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#64748b', width: '10px', height: '10px', right: '-5px', border: '2px solid #1e293b' }} 
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export default function WorkflowCanvas({
  nodes: workflowNodes,
  connections: workflowConnections,
  selectedNodeIds,
  onNodeSelect,
  onNodeMove,
  onNodeDelete,
  onNodesConnect,
  onCanvasDrop
}: WorkflowCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Convert our workflow nodes to React Flow format
  const reactFlowNodes: Node[] = useMemo(() => 
    workflowNodes.map(node => ({
      id: node.id,
      type: 'workflowNode',
      position: node.position,
      data: { nodeData: node },
      selected: selectedNodeIds.includes(node.id),
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    })), [workflowNodes, selectedNodeIds]
  );

  // Convert our connections to React Flow edges
  const reactFlowEdges: Edge[] = useMemo(() =>
    workflowConnections.map(conn => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      type: 'smoothstep',
      animated: selectedNodeIds.includes(conn.source) || selectedNodeIds.includes(conn.target),
      style: {
        stroke: selectedNodeIds.includes(conn.source) || selectedNodeIds.includes(conn.target) 
          ? '#10b981' 
          : '#64748b',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: selectedNodeIds.includes(conn.source) || selectedNodeIds.includes(conn.target) 
          ? '#10b981' 
          : '#64748b',
      },
    })), [workflowConnections, selectedNodeIds]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update React Flow nodes when workflow nodes change
  React.useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update React Flow edges when connections change
  React.useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onNodesConnect(params.source, params.target);
      }
    },
    [onNodesConnect]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeSelect([node.id]);
    },
    [onNodeSelect]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      onNodeSelect(selectedNodes.map(n => n.id));
    },
    [onNodeSelect]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          onNodeMove(change.id, change.position);
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange, onNodeMove]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/workflow-node');
      if (!nodeType || !reactFlowInstance) return;

      // Get the correct position relative to the React Flow viewport
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onCanvasDrop(nodeType, position);
    },
    [onCanvasDrop, reactFlowInstance]
  );

  const onInit = useCallback((instance: any) => {
    setReactFlowInstance(instance);
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={onInit}
          className="bg-slate-900"
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2, stroke: '#64748b' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          }}
          // Improved connection validation
          isValidConnection={(connection) => {
            // Prevent self-connections
            if (connection.source === connection.target) {
              return false;
            }
            
            // Check for existing connection
            const existingConnection = workflowConnections.some(
              conn => conn.source === connection.source && conn.target === connection.target
            );
            
            return !existingConnection;
          }}
        >
          {/* Improved background pattern */}
          <Background 
            variant="dots" 
            gap={24} 
            size={1} 
            color="#475569" 
            className="opacity-40"
          />
          
          {/* Controls with better styling */}
          <Controls 
            className="bg-slate-800 border-slate-600 text-slate-300" 
            showInteractive={false}
          />
          
          {/* Mini map with improved styling */}
          <MiniMap
            className="bg-slate-800 border-slate-600"
            nodeColor={(node) => {
              const workflowNode = workflowNodes.find(n => n.id === node.id);
              return workflowNode?.color.replace('bg-', '#').replace('500', '400') || '#64748b';
            }}
            maskColor="rgb(15, 23, 42, 0.8)"
            position="top-left"
          />

          {/* Empty state when no nodes */}
          {workflowNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Start Building</h3>
                <p className="text-slate-500 max-w-sm text-sm">
                  Drag nodes from the library to create your workflow, or use the AI generator to get started quickly.
                </p>
              </div>
            </div>
          )}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}