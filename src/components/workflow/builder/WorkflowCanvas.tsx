// src/components/workflow/builder/WorkflowCanvas.tsx

"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import type { WorkflowBuilderNode, NodeConnection } from '@/lib/types/workflow-builder';

interface WorkflowCanvasProps {
  nodes: WorkflowBuilderNode[];
  connections: NodeConnection[];
  selectedNodeIds: string[];
  onNodeSelect: (nodeId: string, multiSelect?: boolean) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodesConnect: (sourceId: string, targetId: string) => void;
  onCanvasDrop: (nodeType: string, position: { x: number; y: number }) => void;
  isReadOnly?: boolean;
}

export default function WorkflowCanvas({ 
  nodes, 
  connections, 
  selectedNodeIds,
  onNodeSelect,
  onNodeMove,
  onNodeDelete,
  onNodesConnect,
  onCanvasDrop,
  isReadOnly = false
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nodeType = e.dataTransfer.getData('application/workflow-node');
    if (nodeType) {
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      onCanvasDrop(nodeType, position);
    }
  }, [onCanvasDrop, isReadOnly]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Calculate connection paths (simplified bezier curves)
  const getConnectionPath = useCallback((sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return '';

    const sourceX = sourceNode.position.x + 96; // Half of node width (192px)
    const sourceY = sourceNode.position.y + 40; // Approximate center height
    const targetX = targetNode.position.x + 96;
    const targetY = targetNode.position.y + 40;

    const controlPoint1X = sourceX + (targetX - sourceX) * 0.5;
    const controlPoint1Y = sourceY;
    const controlPoint2X = targetX - (targetX - sourceX) * 0.5;
    const controlPoint2Y = targetY;

    return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${targetX} ${targetY}`;
  }, [nodes]);

  return (
    <div className="relative h-full w-full bg-gray-50 overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Canvas content */}
      <div
        ref={canvasRef}
        className="relative h-full w-full"
        onDrop={handleCanvasDrop}
        onDragOver={handleDragOver}
        onClick={(e) => {
          // Clear selection when clicking on empty canvas
          if (e.target === e.currentTarget) {
            onNodeSelect('');
          }
        }}
      >
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
          
          {connections.map(conn => (
            <path
              key={conn.id}
              d={getConnectionPath(conn.source, conn.target)}
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="hover:stroke-blue-500 transition-colors"
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeIds.includes(node.id)}
            onSelect={onNodeSelect}
            onMove={onNodeMove}
            onDelete={onNodeDelete}
            isReadOnly={isReadOnly}
            connectionMode={connectionMode}
            onStartConnection={(nodeId) => {
              setConnectionStart(nodeId);
              setConnectionMode(true);
            }}
            onEndConnection={(nodeId) => {
              if (connectionStart && connectionStart !== nodeId) {
                onNodesConnect(connectionStart, nodeId);
              }
              setConnectionStart(null);
              setConnectionMode(false);
            }}
          />
        ))}

        {/* Connection mode overlay */}
        {connectionMode && (
          <div className="absolute inset-0 bg-blue-50/30 pointer-events-none z-20 flex items-center justify-center">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
              Click on another node to connect, or press Escape to cancel
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual nodes
interface WorkflowNodeProps {
  node: WorkflowBuilderNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onDelete: (nodeId: string) => void;
  isReadOnly?: boolean;
  connectionMode: boolean;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
}

function WorkflowNodeComponent({ 
  node, 
  isSelected, 
  onSelect, 
  onMove, 
  onDelete,
  isReadOnly = false,
  connectionMode,
  onStartConnection,
  onEndConnection
}: WorkflowNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  }, [node.position, isReadOnly]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      onMove(node.id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onMove, node.id]);

  const handleNodeClick = useCallback(() => {
    if (connectionMode) {
      onEndConnection(node.id);
    } else {
      onSelect(node.id);
    }
  }, [connectionMode, onEndConnection, onSelect, node.id]);

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-105 z-20' : 'z-15'
      } ${isDragging ? 'z-30' : ''} ${
        connectionMode ? 'hover:scale-110' : ''
      }`}
      style={{ left: node.position.x, top: node.position.y }}
      onClick={handleNodeClick}
      onMouseDown={handleMouseDown}
    >
      <Card className={`w-48 border-2 ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-200' : 
        connectionMode ? 'border-green-400 hover:border-green-500' :
        'border-gray-300'
      } hover:shadow-md transition-all ${
        node.locked ? 'bg-gray-50' : 'bg-white'
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 ${node.color} rounded flex items-center justify-center text-white text-sm`}>
              {node.icon}
            </div>
            <span className="font-medium text-sm truncate flex-1">{node.name}</span>
            {node.locked && (
              <Badge variant="secondary" className="text-xs">
                Locked
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-gray-600 truncate mb-2">
            {node.description}
          </div>

          {isSelected && !isReadOnly && (
            <div className="flex items-center gap-1 pt-1 border-t">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartConnection(node.id);
                }}
              >
                Connect
              </Button>
              {!node.locked && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}