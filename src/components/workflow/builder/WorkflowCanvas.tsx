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
import { Settings, Trash2, Copy } from 'lucide-react';
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

// Custom Node Component
function WorkflowNodeComponent({ data, selected }: { data: any; selected: boolean }) {
  const node: WorkflowBuilderNode = data.nodeData;

  return (
    <div className={`transition-all duration-200 ${selected ? 'scale-105' : ''}`}>
      <Card className={`w-72 border-2 transition-all ${
        selected ? 'border-emerald-400 shadow-2xl' : 'border-slate-600 hover:border-slate-500'
      } bg-slate-800 overflow-hidden`}>
        {/* Node Header */}
        <div className={`h-12 ${node.color} flex items-center px-4 gap-3`}>
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white">
            <span className="text-lg">{node.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{node.name}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-6 h-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {/* Node Content */}
        <div className="p-4 text-slate-300">
          <p className="text-xs text-slate-400 mb-2">{node.description}</p>
          {node.config?.model && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
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
        style={{ background: '#555', width: '12px', height: '12px', left: '-6px' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#555', width: '12px', height: '12px', right: '-6px' }} 
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
        strokeWidth: 3,
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
      if (!nodeType) return;

      const position = {
        x: event.clientX - (event.currentTarget as HTMLElement).getBoundingClientRect().left,
        y: event.clientY - (event.currentTarget as HTMLElement).getBoundingClientRect().top,
      };

      onCanvasDrop(nodeType, position);
    },
    [onCanvasDrop]
  );

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
          className="bg-slate-900"
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 3, stroke: '#64748b' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          }}
        >
          {/* Figma-style background */}
          <Background 
            variant="dots" 
            gap={20} 
            size={2} 
            color="#475569" 
            className="opacity-30"
          />
          
          {/* Built-in controls */}
          <Controls 
            className="bg-slate-800 border-slate-600" 
            showInteractive={false}
          />
          
          {/* Mini map */}
          <MiniMap
            className="bg-slate-800 border-slate-600"
            nodeColor={(node) => {
              const workflowNode = workflowNodes.find(n => n.id === node.id);
              return workflowNode?.color.replace('bg-', '#') || '#64748b';
            }}
            maskColor="rgb(15, 23, 42, 0.8)"
            position="top-left"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}