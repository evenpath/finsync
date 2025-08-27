// src/components/workflow/builder/PropertyPanel.tsx

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Copy, Trash2, Lock } from 'lucide-react';
import type { WorkflowBuilderNode } from '@/lib/types/workflow-builder';

interface PropertyPanelProps {
  selectedNode: WorkflowBuilderNode | null;
  isOpen: boolean;
  onClose: () => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowBuilderNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeDuplicate: (nodeId: string) => void;
  isReadOnly?: boolean;
}

export default function PropertyPanel({
  selectedNode,
  isOpen,
  onClose,
  onNodeUpdate,
  onNodeDelete,
  onNodeDuplicate,
  isReadOnly = false
}: PropertyPanelProps) {
  if (!isOpen || !selectedNode) return null;

  const handleConfigUpdate = (field: string, value: any) => {
    if (isReadOnly || selectedNode.locked) return;
    
    onNodeUpdate(selectedNode.id, {
      config: { ...selectedNode.config, [field]: value }
    });
  };

  const handleBasicUpdate = (field: keyof WorkflowBuilderNode, value: any) => {
    if (isReadOnly || (selectedNode.locked && field !== 'locked')) return;
    
    onNodeUpdate(selectedNode.id, { [field]: value });
  };

  return (
    <Card className="w-96 h-full border-l rounded-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Node Configuration</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedNode.icon}</span>
          <span className="font-medium">{selectedNode.name}</span>
          <Badge variant="outline" className="text-xs">
            {selectedNode.category.replace('_', ' ')}
          </Badge>
          {selectedNode.locked && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
        {isReadOnly && (
          <Badge variant="outline" className="text-xs w-fit">
            Read-only mode
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Node Name</Label>
                <Input
                  value={selectedNode.name}
                  onChange={(e) => handleBasicUpdate('name', e.target.value)}
                  className="mt-1"
                  disabled={isReadOnly || selectedNode.locked}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedNode.description}
                  onChange={(e) => handleBasicUpdate('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                  disabled={isReadOnly || selectedNode.locked}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Position X</Label>
                  <Input
                    type="number"
                    value={selectedNode.position.x}
                    onChange={(e) => handleBasicUpdate('position', { 
                      ...selectedNode.position, 
                      x: parseInt(e.target.value) || 0 
                    })}
                    className="mt-1"
                    disabled={isReadOnly || selectedNode.locked}
                  />
                </div>
                <div>
                  <Label>Position Y</Label>
                  <Input
                    type="number"
                    value={selectedNode.position.y}
                    onChange={(e) => handleBasicUpdate('position', { 
                      ...selectedNode.position, 
                      y: parseInt(e.target.value) || 0 
                    })}
                    className="mt-1"
                    disabled={isReadOnly || selectedNode.locked}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Badge variant="outline" className="mt-1 text-xs">
                  {selectedNode.category.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            {/* Dynamic configuration based on node type */}
            {renderNodeSpecificConfig(selectedNode, handleConfigUpdate, isReadOnly)}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-3">
              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedNode.locked || false}
                    onChange={(e) => handleBasicUpdate('locked', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label>Lock Node (Prevent Partner Modifications)</Label>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={selectedNode.required || false}
                  onChange={(e) => handleBasicUpdate('required', e.target.checked)}
                  disabled={isReadOnly || selectedNode.locked}
                  className="h-4 w-4"
                />
                <Label>Required in All Customizations</Label>
              </div>
              
              {/* Node metadata */}
              <div className="pt-2 border-t space-y-2">
                <div className="text-xs text-gray-600">
                  <strong>Node ID:</strong> {selectedNode.id}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Type:</strong> {selectedNode.type}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Sub-type:</strong> {selectedNode.subType}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {!isReadOnly && (
        <div className="p-4 border-t space-y-2">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => onNodeDuplicate(selectedNode.id)}
            disabled={selectedNode.locked}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate Node
          </Button>
          <Button 
            variant="outline" 
            className="w-full text-sm text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onNodeDelete(selectedNode.id)}
            disabled={selectedNode.locked || selectedNode.required}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {selectedNode.locked ? 'Node Locked' : selectedNode.required ? 'Required Node' : 'Delete Node'}
          </Button>
        </div>
      )}
    </Card>
  );
}

// Helper function for node-specific configuration UI
function renderNodeSpecificConfig(
  node: WorkflowBuilderNode, 
  onUpdate: (field: string, value: any) => void,
  isReadOnly: boolean
) {
  const disabled = isReadOnly || node.locked;

  switch (node.subType) {
    case 'manual-trigger':
      return (
        <div className="space-y-3">
          <div>
            <Label>Trigger Button Label</Label>
            <Input
              value={node.config.triggerLabel || 'Start Workflow'}
              onChange={(e) => onUpdate('triggerLabel', e.target.value)}
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Description for Users</Label>
            <Textarea
              value={node.config.userDescription || ''}
              onChange={(e) => onUpdate('userDescription', e.target.value)}
              className="mt-1"
              rows={2}
              placeholder="Explain when users should trigger this workflow..."
              disabled={disabled}
            />
          </div>
        </div>
      );

    case 'ai-analyzer':
      return (
        <div className="space-y-3">
          <div>
            <Label>AI Model</Label>
            <Select 
              value={node.config.aiModel || 'gpt-4'} 
              onValueChange={(value) => onUpdate('aiModel', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Fast & Capable)</SelectItem>
                <SelectItem value="claude-3">Claude 3 (Alternative)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Analysis Instructions</Label>
            <Textarea
              value={node.config.prompt || ''}
              onChange={(e) => onUpdate('prompt', e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Provide detailed instructions for the AI analysis task..."
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Expected Output Format</Label>
            <Select 
              value={node.config.outputFormat || 'text'} 
              onValueChange={(value) => onUpdate('outputFormat', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="json">Structured JSON</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="summary">Executive Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'human-task':
      return (
        <div className="space-y-3">
          <div>
            <Label>Task Instructions</Label>
            <Textarea
              value={node.config.instructions || ''}
              onChange={(e) => onUpdate('instructions', e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Detailed instructions for the person executing this task..."
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Assignment Method</Label>
            <Select 
              value={node.config.assignmentMethod || 'manual'} 
              onValueChange={(value) => onUpdate('assignmentMethod', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Assignment</SelectItem>
                <SelectItem value="auto">Auto-assign to Available</SelectItem>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="workload-based">Based on Workload</SelectItem>
                <SelectItem value="skill-based">Based on Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estimated Duration (minutes)</Label>
            <Input
              type="number"
              value={node.config.estimatedDuration || ''}
              onChange={(e) => onUpdate('estimatedDuration', parseInt(e.target.value) || 0)}
              className="mt-1"
              placeholder="30"
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Priority Level</Label>
            <Select 
              value={node.config.priority || 'medium'} 
              onValueChange={(value) => onUpdate('priority', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'approval-gate':
      return (
        <div className="space-y-3">
          <div>
            <Label>Approval Type</Label>
            <Select 
              value={node.config.approvalType || 'single'} 
              onValueChange={(value) => onUpdate('approvalType', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Any Single Approver</SelectItem>
                <SelectItem value="all">All Approvers Required</SelectItem>
                <SelectItem value="majority">Majority Approval</SelectItem>
                <SelectItem value="sequential">Sequential Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Approval Instructions</Label>
            <Textarea
              value={node.config.approvalInstructions || ''}
              onChange={(e) => onUpdate('approvalInstructions', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="What should approvers review and consider?"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={node.config.allowDelegation || false}
              onChange={(e) => onUpdate('allowDelegation', e.target.checked)}
              disabled={disabled}
              className="h-4 w-4"
            />
            <Label>Allow Approvers to Delegate</Label>
          </div>
        </div>
      );

    case 'notification':
      return (
        <div className="space-y-3">
          <div>
            <Label>Notification Channel</Label>
            <Select 
              value={node.config.channel || 'email'} 
              onValueChange={(value) => onUpdate('channel', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="chat">In-App Chat</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="sms">SMS (if configured)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Message Template</Label>
            <Textarea
              value={node.config.template || ''}
              onChange={(e) => onUpdate('template', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Enter your message template..."
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Recipients</Label>
            <Select 
              value={node.config.recipients || 'assigned'} 
              onValueChange={(value) => onUpdate('recipients', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Task Assignee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="team">Entire Team</SelectItem>
                <SelectItem value="custom">Custom List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'api-call':
      return (
        <div className="space-y-3">
          <div>
            <Label>API Endpoint URL</Label>
            <Input
              value={node.config.url || ''}
              onChange={(e) => onUpdate('url', e.target.value)}
              className="mt-1"
              placeholder="https://api.example.com/endpoint"
              disabled={disabled}
            />
          </div>
          <div>
            <Label>HTTP Method</Label>
            <Select 
              value={node.config.method || 'GET'} 
              onValueChange={(value) => onUpdate('method', value)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Request Headers (JSON)</Label>
            <Textarea
              value={node.config.headers || '{}'}
              onChange={(e) => onUpdate('headers', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Request Body (for POST/PUT)</Label>
            <Textarea
              value={node.config.body || ''}
              onChange={(e) => onUpdate('body', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Request body content..."
              disabled={disabled}
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="text-sm text-gray-500 text-center py-8">
          <p>No specific configuration available</p>
          <p className="text-xs mt-1">Use the Basic tab to modify general properties</p>
        </div>
      );
  }
}