// src/components/workflow/builder/PropertyPanel.tsx

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Settings, Trash2, Copy, Bot, Users, Mail, Globe, Target, 
         Database, FileText, CheckCircle, Clock, Filter, Phone, 
         MessageSquare, Calendar, Webhook, Play, Zap, Search } from 'lucide-react';
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

  const IconComponent = getIconForNode(selectedNode);

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
    <div className="w-80 h-full border-l border-slate-700 bg-slate-800 flex flex-col">
      {/* Header - Reduced padding and font sizes */}
      <div className="flex-shrink-0 p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-200">Configure Node</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-slate-200 h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 ${selectedNode.color} rounded-lg flex items-center justify-center text-white shadow-md`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-200">{selectedNode.name}</h4>
            <p className="text-xs text-slate-400 line-clamp-1">{selectedNode.description}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 h-4 px-1.5">
                {selectedNode.category.replace('_', ' ')}
              </Badge>
              {selectedNode.locked && (
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 h-4 px-1.5">
                  Locked
                </Badge>
              )}
            </div>
          </div>
        </div>
        {isReadOnly && (
          <Badge variant="outline" className="text-xs w-fit mt-2 border-slate-600 text-slate-400 h-5 px-2">
            Read-only mode
          </Badge>
        )}
      </div>

      {/* Configuration Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700 border-slate-600 m-3 h-8">
            <TabsTrigger value="config" className="data-[state=active]:bg-slate-600 text-slate-300 text-xs">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-600 text-slate-300 text-xs">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="px-3 space-y-3">
            <div className="space-y-3">
              {/* Basic Node Info */}
              <div>
                <Label className="text-slate-300 text-xs">Node Name</Label>
                <Input
                  value={selectedNode.name}
                  onChange={(e) => handleBasicUpdate('name', e.target.value)}
                  className="mt-1 bg-slate-700 border-slate-600 text-slate-200 h-8 text-xs"
                  disabled={isReadOnly || selectedNode.locked}
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs">Description</Label>
                <Textarea
                  value={selectedNode.description}
                  onChange={(e) => handleBasicUpdate('description', e.target.value)}
                  className="mt-1 bg-slate-700 border-slate-600 text-slate-200 text-xs"
                  rows={2}
                  disabled={isReadOnly || selectedNode.locked}
                />
              </div>

              {/* Node-specific configuration */}
              {renderNodeSpecificConfig(selectedNode, handleConfigUpdate, isReadOnly)}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="px-3 space-y-3">
            <div className="space-y-3">
              {/* Node Settings */}
              {!isReadOnly && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={selectedNode.locked || false}
                      onChange={(e) => handleBasicUpdate('locked', e.target.checked)}
                      className="h-3 w-3"
                    />
                    <Label className="text-slate-300 text-xs">Lock Node (Prevent modifications)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={selectedNode.required || false}
                      onChange={(e) => handleBasicUpdate('required', e.target.checked)}
                      disabled={isReadOnly || selectedNode.locked}
                      className="h-3 w-3"
                    />
                    <Label className="text-slate-300 text-xs">Required in all instances</Label>
                  </div>
                </div>
              )}

              {/* Position Controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-slate-300 text-xs">X Position</Label>
                  <Input
                    type="number"
                    value={selectedNode.position.x}
                    onChange={(e) => handleBasicUpdate('position', { 
                      ...selectedNode.position, 
                      x: parseInt(e.target.value) || 0 
                    })}
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-200 h-7 text-xs"
                    disabled={isReadOnly || selectedNode.locked}
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Y Position</Label>
                  <Input
                    type="number"
                    value={selectedNode.position.y}
                    onChange={(e) => handleBasicUpdate('position', { 
                      ...selectedNode.position, 
                      y: parseInt(e.target.value) || 0 
                    })}
                    className="mt-1 bg-slate-700 border-slate-600 text-slate-200 h-7 text-xs"
                    disabled={isReadOnly || selectedNode.locked}
                  />
                </div>
              </div>

              {/* Node Metadata - Reduced spacing */}
              <div className="space-y-1.5 pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Node ID:</strong> {selectedNode.id}
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Type:</strong> {selectedNode.type}
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Sub-type:</strong> {selectedNode.subType}
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Category:</strong> {selectedNode.category}
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Workspace:</strong> {selectedNode.workspaceId || 'global'}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions - Reduced button sizes */}
      {!isReadOnly && (
        <div className="flex-shrink-0 p-3 border-t border-slate-700 space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-8 text-xs"
            onClick={() => onNodeDuplicate(selectedNode.id)}
            disabled={selectedNode.locked}
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Duplicate Node
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-red-600 text-red-400 hover:bg-red-950 hover:border-red-500 h-8 text-xs"
            onClick={() => onNodeDelete(selectedNode.id)}
            disabled={selectedNode.locked || selectedNode.required}
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            {selectedNode.locked ? 'Node Locked' : selectedNode.required ? 'Required Node' : 'Delete Node'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Node-specific configuration UI with improved spacing and typography
function renderNodeSpecificConfig(
  node: WorkflowBuilderNode, 
  onUpdate: (field: string, value: any) => void,
  isReadOnly: boolean
) {
  const disabled = isReadOnly || node.locked;
  const inputClassName = "mt-1 bg-slate-700 border-slate-600 text-slate-200 h-8 text-xs";
  const textareaClassName = "mt-1 bg-slate-700 border-slate-600 text-slate-200 text-xs";
  const labelClassName = "text-slate-300 text-xs";

  switch (node.subType) {
    case 'manual-trigger':
      return (
        <div className="space-y-3">
          <div>
            <Label className={labelClassName}>Trigger Button Label</Label>
            <Input
              value={node.config?.triggerLabel || 'Start Workflow'}
              onChange={(e) => onUpdate('triggerLabel', e.target.value)}
              className={inputClassName}
              disabled={disabled}
            />
          </div>
          <div>
            <Label className={labelClassName}>User Instructions</Label>
            <Textarea
              value={node.config?.userDescription || ''}
              onChange={(e) => onUpdate('userDescription', e.target.value)}
              className={textareaClassName}
              rows={3}
              placeholder="Instructions for users when triggering this workflow..."
              disabled={disabled}
            />
          </div>
        </div>
      );

    case 'ai-analyzer':
      return (
        <div className="space-y-3">
          <div>
            <Label className={labelClassName}>AI Provider</Label>
            <Select 
              value={node.config?.provider || 'OpenAI'} 
              onValueChange={(value) => onUpdate('provider', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="OpenAI">OpenAI</SelectItem>
                <SelectItem value="Anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="Google">Google (Gemini)</SelectItem>
                <SelectItem value="Microsoft">Azure OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className={labelClassName}>Model</Label>
            <Select 
              value={node.config?.model || 'gpt-4'} 
              onValueChange={(value) => onUpdate('model', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelClassName}>Temperature</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={node.config?.temperature || 0.7}
              onChange={(e) => onUpdate('temperature', parseFloat(e.target.value) || 0.7)}
              className={inputClassName}
              disabled={disabled}
            />
          </div>

          <div>
            <Label className={labelClassName}>System Prompt</Label>
            <Textarea
              value={node.config?.systemPrompt || ''}
              onChange={(e) => onUpdate('systemPrompt', e.target.value)}
              className={textareaClassName}
              rows={4}
              placeholder="Enter system instructions for the AI agent..."
              disabled={disabled}
            />
          </div>

          <div>
            <Label className={labelClassName}>Max Tokens</Label>
            <Input
              type="number"
              value={node.config?.maxTokens || 1000}
              onChange={(e) => onUpdate('maxTokens', parseInt(e.target.value) || 1000)}
              className={inputClassName}
              disabled={disabled}
            />
          </div>
        </div>
      );

    case 'human-task':
      return (
        <div className="space-y-3">
          <div>
            <Label className={labelClassName}>Task Instructions</Label>
            <Textarea
              value={node.config?.instructions || ''}
              onChange={(e) => onUpdate('instructions', e.target.value)}
              className={textareaClassName}
              rows={4}
              placeholder="Detailed instructions for the person executing this task..."
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label className={labelClassName}>Assignment Method</Label>
            <Select 
              value={node.config?.assignmentMethod || 'manual'} 
              onValueChange={(value) => onUpdate('assignmentMethod', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="manual">Manual Assignment</SelectItem>
                <SelectItem value="auto">Auto-assign to Available</SelectItem>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="workload-based">Based on Workload</SelectItem>
                <SelectItem value="skill-based">Based on Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelClassName}>Priority</Label>
            <Select 
              value={node.config?.priority || 'medium'} 
              onValueChange={(value) => onUpdate('priority', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelClassName}>Estimated Duration (minutes)</Label>
            <Input
              type="number"
              value={node.config?.estimatedDuration || ''}
              onChange={(e) => onUpdate('estimatedDuration', parseInt(e.target.value) || 0)}
              className={inputClassName}
              placeholder="30"
              disabled={disabled}
            />
          </div>
        </div>
      );

    case 'approval-gate':
      return (
        <div className="space-y-3">
          <div>
            <Label className={labelClassName}>Approval Type</Label>
            <Select 
              value={node.config?.approvalType || 'single'} 
              onValueChange={(value) => onUpdate('approvalType', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="single">Any Single Approver</SelectItem>
                <SelectItem value="all">All Approvers Required</SelectItem>
                <SelectItem value="majority">Majority Approval</SelectItem>
                <SelectItem value="sequential">Sequential Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={labelClassName}>Approval Instructions</Label>
            <Textarea
              value={node.config?.approvalInstructions || ''}
              onChange={(e) => onUpdate('approvalInstructions', e.target.value)}
              className={textareaClassName}
              rows={3}
              placeholder="What should approvers review and consider?"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={node.config?.allowDelegation || false}
              onChange={(e) => onUpdate('allowDelegation', e.target.checked)}
              disabled={disabled}
              className="h-3 w-3"
            />
            <Label className={labelClassName}>Allow Approvers to Delegate</Label>
          </div>
        </div>
      );

    case 'notification':
      return (
        <div className="space-y-3">
          <div>
            <Label className={labelClassName}>Notification Channel</Label>
            <Select 
              value={node.config?.channel || 'email'} 
              onValueChange={(value) => onUpdate('channel', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelClassName}>Message Template</Label>
            <Textarea
              value={node.config?.template || ''}
              onChange={(e) => onUpdate('template', e.target.value)}
              className={textareaClassName}
              rows={4}
              placeholder="Enter your notification message template..."
              disabled={disabled}
            />
          </div>

          <div>
            <Label className={labelClassName}>Recipients</Label>
            <Select 
              value={node.config?.recipients || 'assigned'} 
              onValueChange={(value) => onUpdate('recipients', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="assigned">Task Assignee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="team">Entire Team</SelectItem>
                <SelectItem value="custom">Custom Recipients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'api-call':
      return (
        <div className="space-y-3">
          <div>
            <Label className={labelClassName}>API Endpoint URL</Label>
            <Input
              value={node.config?.url || ''}
              onChange={(e) => onUpdate('url', e.target.value)}
              className={inputClassName}
              placeholder="https://api.example.com/endpoint"
              disabled={disabled}
            />
          </div>

          <div>
            <Label className={labelClassName}>HTTP Method</Label>
            <Select 
              value={node.config?.method || 'GET'} 
              onValueChange={(value) => onUpdate('method', value)}
              disabled={disabled}
            >
              <SelectTrigger className={inputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className={labelClassName}>Headers (JSON)</Label>
            <Textarea
              value={node.config?.headers || '{\n  "Content-Type": "application/json"\n}'}
              onChange={(e) => onUpdate('headers', e.target.value)}
              className={textareaClassName}
              rows={3}
              disabled={disabled}
            />
          </div>

          <div>
            <Label className={labelClassName}>Request Body</Label>
            <Textarea
              value={node.config?.body || ''}
              onChange={(e) => onUpdate('body', e.target.value)}
              className={textareaClassName}
              rows={4}
              placeholder="Request body for POST/PUT requests..."
              disabled={disabled}
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-6 text-slate-400">
          <Settings className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No specific configuration available</p>
          <p className="text-xs mt-1 opacity-75">This node type doesn't require additional settings</p>
        </div>
      );
  }
}