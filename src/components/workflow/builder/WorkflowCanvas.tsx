// src/components/workflow/builder/WorkflowCanvas.tsx

"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, Link } from 'lucide-react';
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

interface DragState {
  isDragging: boolean;
  dragType: 'node' | 'canvas' | null;
  startPos: { x: number; y: number };
  nodeStartPos: { x: number; y: number };
}

interface ConnectionState {
  isConnecting: boolean;
  sourceId: string | null;
  previewEnd: { x: number; y: number } | null;
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
  zoom,
  pan,
  onZoomChange,
  onPanChange
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    startPos: { x: 0, y: 0 },
    nodeStartPos: { x: 0, y: 0 }
  });
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    sourceId: null,
    previewEnd: null
  });

  const gridSize = 20;

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Find node at position
  const findNodeAtPosition = useCallback((x: number, y: number) => {
    return nodes.find(node => {
      const nodeWidth = 280;
      const nodeHeight = 100;
      return x >= node.position.x && 
             x <= node.position.x + nodeWidth &&
             y >= node.position.y && 
             y <= node.position.y + nodeHeight;
    });
  }, [nodes]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return; // Ignore right clicks for now

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    const clickedNode = findNodeAtPosition(canvasPos.x, canvasPos.y);

    if (connectionState.isConnecting) {
      // If we're in connection mode, try to complete the connection
      if (clickedNode && clickedNode.id !== connectionState.sourceId) {
        onNodesConnect(connectionState.sourceId!, clickedNode.id);
      }
      setConnectionState({ isConnecting: false, sourceId: null, previewEnd: null });
      return;
    }

    if (clickedNode) {
      if (!selectedNodeIds.includes(clickedNode.id)) {
        onNodeSelect([clickedNode.id]);
      }

      setDragState({
        isDragging: true,
        dragType: 'node',
        startPos: canvasPos,
        nodeStartPos: { ...clickedNode.position }
      });
    } else {
      onNodeSelect([]);
      setDragState({
        isDragging: true,
        dragType: 'canvas',
        startPos: { x: e.clientX, y: e.clientY },
        nodeStartPos: { x: 0, y: 0 }
      });
    }
  }, [screenToCanvas, findNodeAtPosition, connectionState, selectedNodeIds, onNodeSelect, onNodesConnect]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    // Update connection preview
    if (connectionState.isConnecting) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setConnectionState(prev => ({ ...prev, previewEnd: canvasPos }));
    }

    if (!dragState.isDragging) return;

    if (dragState.dragType === 'node' && selectedNodeIds.length === 1) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const deltaX = canvasPos.x - dragState.startPos.x;
      const deltaY = canvasPos.y - dragState.startPos.y;

      const newX = Math.round((dragState.nodeStartPos.x + deltaX) / gridSize) * gridSize;
      const newY = Math.round((dragState.nodeStartPos.y + deltaY) / gridSize) * gridSize;

      onNodeMove(selectedNodeIds[0], { x: newX, y: newY });
    } else if (dragState.dragType === 'canvas') {
      const deltaX = e.clientX - dragState.startPos.x;
      const deltaY = e.clientY - dragState.startPos.y;
      
      onPanChange({ 
        x: pan.x + deltaX, 
        y: pan.y + deltaY 
      });
      
      setDragState(prev => ({ 
        ...prev, 
        startPos: { x: e.clientX, y: e.clientY } 
      }));
    }
  }, [dragState, selectedNodeIds, onNodeMove, pan, onPanChange, screenToCanvas, connectionState]);

  const handleCanvasMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      startPos: { x: 0, y: 0 },
      nodeStartPos: { x: 0, y: 0 }
    });
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/workflow-node');
    if (nodeType) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const snappedX = Math.round(canvasPos.x / gridSize) * gridSize;
      const snappedY = Math.round(canvasPos.y / gridSize) * gridSize;
      onCanvasDrop(nodeType, { x: snappedX, y: snappedY });
    }
  }, [onCanvasDrop, screenToCanvas, gridSize]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomDelta, 0.3), 3);
      onZoomChange(newZoom);
    }
  }, [zoom, onZoomChange]);

  // Start connection from a node
  const startConnection = useCallback((nodeId: string) => {
    setConnectionState({
      isConnecting: true,
      sourceId: nodeId,
      previewEnd: null
    });
  }, []);

  // Connection path calculation
  const getConnectionPath = useCallback((sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return '';

    const sourceX = sourceNode.position.x + 280;
    const sourceY = sourceNode.position.y + 50;
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + 50;

    const controlX1 = sourceX + Math.min(100, Math.abs(targetX - sourceX) * 0.5);
    const controlY1 = sourceY;
    const controlX2 = targetX - Math.min(100, Math.abs(targetX - sourceX) * 0.5);
    const controlY2 = targetY;

    return `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${targetX} ${targetY}`;
  }, [nodes]);

  const canvasStyle = useMemo(() => ({
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: '0 0'
  }), [pan, zoom]);

  // Figma-style dotted background
  const dotSize = 2;
  const dotSpacing = 20;
  const adjustedDotSpacing = dotSpacing * zoom;
  const dotOpacity = Math.min(0.4, Math.max(0.1, zoom * 0.3));

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      {/* Figma-style dotted background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, ${dotOpacity}) ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${adjustedDotSpacing}px ${adjustedDotSpacing}px`,
          backgroundPosition: `${pan.x % adjustedDotSpacing}px ${pan.y % adjustedDotSpacing}px`
        }}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDrop={handleCanvasDrop}
        onDragOver={(e) => e.preventDefault()}
        onWheel={handleWheel}
        style={{ 
          cursor: connectionState.isConnecting ? 'crosshair' :
                  dragState.dragType === 'canvas' ? 'grabbing' : 'default' 
        }}
      >
        <div style={canvasStyle}>
          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M0,0 L0,8 L10,4 z"
                  fill="#10b981"
                  stroke="none"
                />
              </marker>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Existing connections */}
            {connections.map(conn => {
              const isSelected = selectedNodeIds.includes(conn.source) || selectedNodeIds.includes(conn.target);
              return (
                <path
                  key={conn.id}
                  d={getConnectionPath(conn.source, conn.target)}
                  stroke={isSelected ? "#10b981" : "#64748b"}
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-200"
                  style={{ 
                    filter: isSelected ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))" : "none"
                  }}
                />
              );
            })}
            
            {/* Connection preview */}
            {connectionState.isConnecting && connectionState.sourceId && connectionState.previewEnd && (
              (() => {
                const sourceNode = nodes.find(n => n.id === connectionState.sourceId);
                if (!sourceNode) return null;
                
                const sourceX = sourceNode.position.x + 280;
                const sourceY = sourceNode.position.y + 50;
                const targetX = connectionState.previewEnd.x;
                const targetY = connectionState.previewEnd.y;
                
                const controlX1 = sourceX + 100;
                const controlY1 = sourceY;
                const controlX2 = targetX - 100;
                const controlY2 = targetY;
                
                const path = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${targetX} ${targetY}`;
                
                return (
                  <path
                    d={path}
                    stroke="#10b981"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="8,4"
                    opacity="0.8"
                    filter="url(#glow)"
                  />
                );
              })()
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <WorkflowNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeIds.includes(node.id)}
              isConnecting={connectionState.isConnecting}
              isConnectionSource={connectionState.sourceId === node.id}
              onStartConnection={startConnection}
            />
          ))}
        </div>
      </div>

      {/* Connection mode indicator */}
      {connectionState.isConnecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-emerald-500 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400">
            <Link className="w-4 h-4" />
            <span className="text-sm font-medium">Click on target node to connect</span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setConnectionState({ isConnecting: false, sourceId: null, previewEnd: null })}
              className="text-slate-400 hover:text-white ml-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Node Component with better connection UX
interface WorkflowNodeComponentProps {
  node: WorkflowBuilderNode;
  isSelected: boolean;
  isConnecting: boolean;
  isConnectionSource: boolean;
  onStartConnection: (nodeId: string) => void;
}

function WorkflowNodeComponent({
  node,
  isSelected,
  isConnecting,
  isConnectionSource,
  onStartConnection
}: WorkflowNodeComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`absolute transition-all duration-200 ${
        isSelected ? 'scale-105 z-30' : 'z-20'
      } ${isConnectionSource ? 'ring-2 ring-emerald-400' : ''}`}
      style={{ 
        left: node.position.x, 
        top: node.position.y,
        width: 280,
        height: 100
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`w-full h-full border-2 transition-all ${
        isSelected ? 'border-emerald-400 shadow-2xl' : 
        isConnecting && !isConnectionSource ? 'border-blue-400 shadow-lg cursor-pointer hover:border-blue-300' :
        'border-slate-600 hover:border-slate-500'
      } bg-slate-800 overflow-hidden`}>
        {/* Node Header */}
        <div className={`h-12 ${node.color} flex items-center px-4 gap-3`}>
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white">
            <span className="text-lg">{node.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{node.name}</h3>
          </div>
          {(isHovered || isSelected) && !isConnecting && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-6 h-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
            >
              <Settings className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Node Content */}
        <div className="flex-1 p-4 text-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-slate-400">{node.description}</p>
              {node.config?.model && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                    {node.config.model}
                  </Badge>
                  {node.config.provider && (
                    <span className="text-xs text-slate-500">{node.config.provider}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Handles - Always visible with better UX */}
        <>
          {/* Input handle (left) */}
          <div className={`absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 transition-all ${
            isConnecting && !isConnectionSource 
              ? 'bg-blue-500 border-blue-300 shadow-lg scale-125' 
              : 'bg-slate-600 border-slate-400'
          }`}>
            <div className="absolute inset-1 rounded-full bg-slate-800"></div>
          </div>
          
          {/* Output handle (right) with connection button */}
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStartConnection(node.id);
              }}
              className={`w-6 h-6 p-0 rounded-full transition-all ${
                isConnectionSource
                  ? 'bg-emerald-500 border-2 border-emerald-300 shadow-lg scale-125'
                  : isHovered || isConnecting
                  ? 'bg-emerald-500 hover:bg-emerald-400 shadow-md'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              title={isConnecting ? "Cancel connection" : "Start connection"}
            >
              <Link className="w-3 h-3 text-white" />
            </Button>
          </div>
        </>

        {/* Selection glow */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400 rounded-lg shadow-lg shadow-emerald-400/30" />
        )}

        {/* Connection target glow */}
        {isConnecting && !isConnectionSource && (
          <div className="absolute inset-0 pointer-events-none border-2 border-blue-400 rounded-lg shadow-lg shadow-blue-400/30 animate-pulse" />
        )}
      </Card>
    </div>
  );
}