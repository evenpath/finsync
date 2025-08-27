// src/components/workflow/builder/NodeLibrary.tsx

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import type { NodeTypeDefinition } from '@/lib/types/workflow-builder';

interface NodeLibraryProps {
  isOpen: boolean;
  onToggle: () => void;
  onNodeDragStart: (nodeType: NodeTypeDefinition) => void;
  isReadOnly?: boolean;
}

export default function NodeLibrary({ isOpen, onToggle, onNodeDragStart, isReadOnly = false }: NodeLibraryProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Define available node types (generic, industry-agnostic)
  const nodeTypes: NodeTypeDefinition[] = [
    // Triggers
    {
      id: 'manual-trigger',
      name: 'Manual Trigger',
      description: 'Start workflow manually by user action',
      icon: '▶️',
      color: 'bg-blue-500',
      category: 'trigger',
      configSchema: {},
      defaultConfig: { triggerLabel: 'Start Workflow' }
    },
    {
      id: 'form-submission',
      name: 'Form Submission', 
      description: 'Trigger when a form is submitted',
      icon: '📝',
      color: 'bg-green-500',
      category: 'trigger',
      configSchema: {},
      defaultConfig: { formName: 'New Form' }
    },
    {
      id: 'scheduled-trigger',
      name: 'Scheduled Trigger',
      description: 'Trigger workflow on schedule',
      icon: '⏰',
      color: 'bg-purple-500',
      category: 'trigger',
      configSchema: {},
      defaultConfig: { schedule: 'daily' }
    },
    
    // AI Processing
    {
      id: 'ai-analyzer',
      name: 'AI Analyzer',
      description: 'Process and analyze data using AI',
      icon: '🧠',
      color: 'bg-purple-600', 
      category: 'ai_processing',
      configSchema: {},
      defaultConfig: { model: 'gpt-4', prompt: '' }
    },
    {
      id: 'text-classifier',
      name: 'Text Classifier',
      description: 'Classify or categorize text content',
      icon: '🏷️',
      color: 'bg-indigo-500',
      category: 'ai_processing',
      configSchema: {},
      defaultConfig: { categories: [] }
    },
    {
      id: 'content-generator',
      name: 'Content Generator',
      description: 'Generate content using AI',
      icon: '✍️',
      color: 'bg-violet-500',
      category: 'ai_processing',
      configSchema: {},
      defaultConfig: { outputType: 'text' }
    },

    // Human Actions
    {
      id: 'human-task',
      name: 'Human Task',
      description: 'Assign task to a person',
      icon: '👤',
      color: 'bg-orange-500',
      category: 'human_action', 
      configSchema: {},
      defaultConfig: { assignmentMethod: 'manual' }
    },
    {
      id: 'approval-gate',
      name: 'Approval Gate',
      description: 'Require approval before proceeding',
      icon: '✅',
      color: 'bg-yellow-500',
      category: 'human_action',
      configSchema: {},
      defaultConfig: { approvers: [], requireAll: false }
    },
    {
      id: 'review-task',
      name: 'Review Task',
      description: 'Human review of content or data',
      icon: '👁️',
      color: 'bg-amber-500',
      category: 'human_action',
      configSchema: {},
      defaultConfig: { reviewType: 'quality' }
    },

    // Communication
    {
      id: 'notification',
      name: 'Send Notification',
      description: 'Send alert or notification message',
      icon: '🔔',
      color: 'bg-pink-500',
      category: 'communication',
      configSchema: {},
      defaultConfig: { channel: 'email', template: '' }
    },
    {
      id: 'email-send',
      name: 'Send Email',
      description: 'Send email notification',
      icon: '📧',
      color: 'bg-red-500',
      category: 'communication',
      configSchema: {},
      defaultConfig: { subject: '', template: '' }
    },
    {
      id: 'chat-message',
      name: 'Chat Message',
      description: 'Send message to chat channel',
      icon: '💬',
      color: 'bg-green-600',
      category: 'communication',
      configSchema: {},
      defaultConfig: { channel: '', message: '' }
    },

    // Data Integration
    {
      id: 'api-call',
      name: 'API Call',
      description: 'Call external API or service',
      icon: '🌐',
      color: 'bg-cyan-500',
      category: 'data_integration',
      configSchema: {},
      defaultConfig: { method: 'GET', url: '', headers: {} }
    },
    {
      id: 'database-query',
      name: 'Database Query',
      description: 'Query database for information',
      icon: '🗄️',
      color: 'bg-gray-600',
      category: 'data_integration',
      configSchema: {},
      defaultConfig: { query: '', database: 'main' }
    },
    {
      id: 'file-processor',
      name: 'File Processor',
      description: 'Process uploaded files',
      icon: '📄',
      color: 'bg-blue-600',
      category: 'data_integration',
      configSchema: {},
      defaultConfig: { supportedTypes: ['pdf', 'doc', 'txt'] }
    },

    // Conditions
    {
      id: 'condition-check',
      name: 'Condition Check',
      description: 'Check conditions and branch workflow',
      icon: '🔀',
      color: 'bg-teal-500',
      category: 'condition',
      configSchema: {},
      defaultConfig: { condition: '', operator: 'equals' }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Nodes', count: nodeTypes.length },
    { id: 'trigger', name: 'Triggers', count: nodeTypes.filter(n => n.category === 'trigger').length },
    { id: 'ai_processing', name: 'AI Processing', count: nodeTypes.filter(n => n.category === 'ai_processing').length },
    { id: 'human_action', name: 'Human Actions', count: nodeTypes.filter(n => n.category === 'human_action').length },
    { id: 'communication', name: 'Communication', count: nodeTypes.filter(n => n.category === 'communication').length },
    { id: 'data_integration', name: 'Data Integration', count: nodeTypes.filter(n => n.category === 'data_integration').length },
    { id: 'condition', name: 'Conditions', count: nodeTypes.filter(n => n.category === 'condition').length }
  ];

  const filteredNodes = nodeTypes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || node.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (nodeType: NodeTypeDefinition) => {
    if (isReadOnly) return;
    onNodeDragStart(nodeType);
  };

  if (!isOpen) return null;

  return (
    <Card className="w-80 h-full border-r rounded-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workflow Nodes</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search nodes..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <Badge
              key={category.id}
              variant={categoryFilter === category.id ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setCategoryFilter(category.id)}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Node List */}
        <div className="space-y-2">
          {filteredNodes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No nodes found</p>
              <p className="text-xs">Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredNodes.map(nodeType => (
              <div
                key={nodeType.id}
                className={`p-3 border border-gray-200 rounded-lg transition-colors ${
                  isReadOnly 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:border-blue-300 hover:bg-blue-50 cursor-grab active:cursor-grabbing'
                }`}
                draggable={!isReadOnly}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/workflow-node', nodeType.id);
                  handleDragStart(nodeType);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{nodeType.icon}</span>
                  <span className="font-medium text-sm">{nodeType.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {nodeType.category.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{nodeType.description}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      {isReadOnly && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            View-only mode - drag and drop disabled
          </p>
        </div>
      )}
    </Card>
  );
}