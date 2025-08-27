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
      {/* Header - Improved typography and spacing */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-base font-semibold text-slate-100">Configure Node</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customize properties</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-slate-200 h-7 w-7 p-0 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${selectedNode.color} rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-200 truncate">{selectedNode.name}</h4>
            <p className="text-xs text-slate-400 truncate">{selectedNode.description}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 h-5 px-2">
                {selectedNode.category.replace('_', ' ')}
              </Badge>
              {selectedNode.locked && (
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 h-5 px-2">
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
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="config" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700 border-slate-600 mx-4 mt-3 h-9">
            <TabsTrigger value="config" className="data-[state=active]:bg-slate-600 text-slate-300 text-xs">
              Config
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-600 text-slate-300 text-xs">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Basic Node Info */}
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300 text-xs font-medium">Node Name</Label>
                <Input
                  value={selectedNode.name}
                  onChange={(e) => handleBasicUpdate('name', e.target.value)}
                  className="mt-1.5 bg-slate-700 border-slate-600 text-slate-200 h-8 text-sm w-full"
                  disabled={isReadOnly || selectedNode.locked}
                />
              </div>

              <div>
                <Label className="text-slate-300 text-xs font-medium">Description</Label>
                <Textarea
                  value={selectedNode.description}
                  onChange={(e) => handleBasicUpdate('description', e.target.value)}
                  className="mt-1.5 bg-slate-700 border-slate-600 text-slate-200 text-sm resize-none w-full"
                  rows={3}
                  disabled={isReadOnly || selectedNode.locked}
                />
              </div>

              {/* Node-specific configuration */}
              {renderNodeSpecificConfig(selectedNode, handleConfigUpdate, isReadOnly)}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Node Settings */}
            {!isReadOnly && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedNode.locked || false}
                    onChange={(e) => handleBasicUpdate('locked', e.target.checked)}
                    className="h-4 w-4 text-emerald-500"
                  />
                  <Label className="text-slate-300 text-xs">Lock node (prevent edits)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedNode.required || false}
                    onChange={(e) => handleBasicUpdate('required', e.target.checked)}
                    disabled={isReadOnly || selectedNode.locked}
                    className="h-4 w-4 text-emerald-500"
                  />
                  <Label className="text-slate-300 text-xs">Required in all instances</Label>
                </div>
              </div>
            )}

            {/* Position Controls */}
            <div>
              <Label className="text-slate-300 text-xs font-medium mb-2 block">Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    value={selectedNode.position.x}
                    onChange={(e) => handleBasicUpdate('position', { 
                      ...selectedNode.position, 
                      x: parseInt(e.target.value) || 0 
                    })}
                    className="bg-slate-700 border-slate-600 text-slate-200 h-8 text-xs"
                    disabled={isReadOnly || selectedNode.locked}
                    placeholder="X"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={selectedNode.position.y}
                    onChange={(e) => handleBasicUpdate('position', { 
                      ...selectedNode.position, 
                      y: parseInt(e.target.value) || 0 
                    })}
                    className="bg-slate-700 border-slate-600 text-slate-200 h-8 text-xs"
                    disabled={isReadOnly || selectedNode.locked}
                    placeholder="Y"
                  />
                </div>
              </div>
            </div>

            {/* Node Metadata */}
            <div className="space-y-2 pt-3 border-t border-slate-700">
              <h4 className="text-xs font-medium text-slate-300 mb-2">Node Info</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <span className="text-slate-300 font-mono text-xs truncate ml-2" title={selectedNode.id}>
                    {selectedNode.id.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-slate-300">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sub-type:</span>
                  <span className="text-slate-300">{selectedNode.subType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Workspace:</span>
                  <span className="text-slate-300">{selectedNode.workspaceId || 'global'}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex-shrink-0 p-4 border-t border-slate-700 space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-8 text-xs"
            onClick={() => onNodeDuplicate(selectedNode.id)}
            disabled={selectedNode.locked}
          >
            <Copy className="w-3 h-3 mr-2" />
            Duplicate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-red-600 text-red-400 hover:bg-red-950 hover:border-red-500 h-8 text-xs"
            onClick={() => onNodeDelete(selectedNode.id)}
            disabled={selectedNode.locked || selectedNode.required}
          >
            <Trash2 className="w-3 h-3 mr-2" />
            {selectedNode.locked ? 'Locked' : selectedNode.required ? 'Required' : 'Delete'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Node-specific configuration with proper width constraints
function renderNodeSpecificConfig(
  node: WorkflowBuilderNode, 
  onUpdate: (field: string, value: any) => void,
  isReadOnly: boolean
) {
  const disabled = isReadOnly || node.locked;
  const inputClassName = "mt-1.5 bg-slate-700 border-slate-600 text-slate-200 h-8 text-sm w-full";
  const textareaClassName = "mt-1.5 bg-slate-700 border-slate-600 text-slate-200 text-sm resize-none w-full";
  const labelClassName = "text-slate-300 text-xs font-medium";

  switch (node.subType) {
    case 'manual-trigger':
      return (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-300">Trigger Settings</h4>
          <div className="space-y-3">
            <div>
              <Label className={labelClassName}>Button Label</Label>
              <Input
                value={node.config?.triggerLabel || 'Start Workflow'}
                onChange={(e) => onUpdate('triggerLabel', e.target.value)}
                className={inputClassName}
                disabled={disabled}
                placeholder="Start Workflow"
              />
            </div>
            <div>
              <Label className={labelClassName}>Instructions</Label>
              <Textarea
                value={node.config?.userDescription || ''}
                onChange={(e) => onUpdate('userDescription', e.target.value)}
                className={textareaClassName}
                rows={3}
                placeholder="User instructions..."
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      );

    case 'ai-analyzer':
      return (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-300">AI Configuration</h4>
          <div className="space-y-3">
            <div>
              <Label className={labelClassName}>Provider</Label>
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
                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Microsoft">Microsoft</SelectItem>
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
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
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
                placeholder="System instructions..."
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      );

    case 'human-task':
      return (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-300">Task Settings</h4>
          <div className="space-y-3">
            <div>
              <Label className={labelClassName}>Instructions</Label>
              <Textarea
                value={node.config?.instructions || ''}
                onChange={(e) => onUpdate('instructions', e.target.value)}
                className={textareaClassName}
                rows={4}
                placeholder="Task instructions..."
                disabled={disabled}
              />
            </div>
            
            <div>
              <Label className={labelClassName}>Assignment</Label>
              <Select 
                value={node.config?.assignmentMethod || 'manual'} 
                onValueChange={(value) => onUpdate('assignmentMethod', value)}
                disabled={disabled}
              >
                <SelectTrigger className={inputClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="auto">Auto-assign</SelectItem>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case 'notification':
      return (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-300">Notification Settings</h4>
          <div className="space-y-3">
            <div>
              <Label className={labelClassName}>Channel</Label>
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
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={labelClassName}>Template</Label>
              <Textarea
                value={node.config?.template || ''}
                onChange={(e) => onUpdate('template', e.target.value)}
                className={textareaClassName}
                rows={4}
                placeholder="Message template..."
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      );

    case 'api-call':
      return (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-300">API Settings</h4>
          <div className="space-y-3">
            <div>
              <Label className={labelClassName}>URL</Label>
              <Input
                value={node.config?.url || ''}
                onChange={(e) => onUpdate('url', e.target.value)}
                className={inputClassName}
                placeholder="https://api.example.com"
                disabled={disabled}
              />
            </div>

            <div>
              <Label className={labelClassName}>Method</Label>
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
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-8 text-slate-400 pt-4 border-t border-slate-700">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No additional configuration</p>
          <p className="text-xs mt-1 opacity-75">This node works with default settings</p>
        </div>
      );
  }
}