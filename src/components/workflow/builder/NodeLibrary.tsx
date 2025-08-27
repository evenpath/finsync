// src/components/workflow/builder/NodeLibrary.tsx

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import type { NodeTypeDefinition } from '@/lib/types/workflow-builder';

interface NodeLibraryProps {
  isOpen: boolean;
  onToggle: () => void;
  onNodeDragStart: (nodeType: NodeTypeDefinition) => void;
  isReadOnly?: boolean;
}

export default function NodeLibrary({ isOpen, onToggle, onNodeDragStart, isReadOnly = false }: NodeLibraryProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['trigger', 'ai_processing', 'human_action', 'communication'])
  );

  // Node categories with modern icons and descriptions
  const nodeCategories = {
    trigger: {
      name: 'Triggers',
      icon: '🚀',
      description: 'Start your workflow',
      color: 'text-emerald-400',
      nodes: [
        {
          id: 'manual-trigger',
          name: 'Manual Start',
          description: 'Manually trigger workflow execution',
          icon: '▶️',
          color: 'bg-emerald-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'form-submission',
          name: 'Form Trigger',
          description: 'Trigger on form submission',
          icon: '📝',
          color: 'bg-blue-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'webhook',
          name: 'Webhook',
          description: 'HTTP webhook endpoint',
          icon: '🌐',
          color: 'bg-indigo-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'scheduled-trigger',
          name: 'Schedule',
          description: 'Time-based automation',
          icon: '⏰',
          color: 'bg-purple-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    ai_processing: {
      name: 'AI Agents',
      icon: '🤖',
      description: 'AI-powered processing',
      color: 'text-purple-400',
      nodes: [
        {
          id: 'ai-analyzer',
          name: 'AI Agent',
          description: 'Custom AI processing agent',
          icon: '🤖',
          color: 'bg-purple-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: { model: 'gpt-4', provider: 'OpenAI' }
        },
        {
          id: 'text-classifier',
          name: 'Text Classifier',
          description: 'Categorize and tag content',
          icon: '🏷️',
          color: 'bg-indigo-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'sentiment-analyzer',
          name: 'Sentiment Analysis',
          description: 'Analyze emotional tone',
          icon: '😊',
          color: 'bg-pink-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'content-generator',
          name: 'Content Generator',
          description: 'Generate text content',
          icon: '✍️',
          color: 'bg-violet-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    human_action: {
      name: 'Human Tasks',
      icon: '👥',
      description: 'Human involvement required',
      color: 'text-orange-400',
      nodes: [
        {
          id: 'human-task',
          name: 'Human Task',
          description: 'Assign task to team member',
          icon: '👤',
          color: 'bg-orange-500',
          category: 'human_action' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'approval-gate',
          name: 'Approval Gate',
          description: 'Require manual approval',
          icon: '✅',
          color: 'bg-yellow-500',
          category: 'human_action' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'review-task',
          name: 'Review Task',
          description: 'Content review and validation',
          icon: '👁️',
          color: 'bg-amber-500',
          category: 'human_action' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    communication: {
      name: 'Communication',
      icon: '📢',
      description: 'Notifications and messages',
      color: 'text-blue-400',
      nodes: [
        {
          id: 'notification',
          name: 'Notification',
          description: 'Send in-app notification',
          icon: '🔔',
          color: 'bg-blue-500',
          category: 'communication' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'email-send',
          name: 'Email',
          description: 'Send email message',
          icon: '📧',
          color: 'bg-red-500',
          category: 'communication' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'slack-message',
          name: 'Slack Message',
          description: 'Post to Slack channel',
          icon: '💬',
          color: 'bg-green-500',
          category: 'communication' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    data_integration: {
      name: 'Data & Integration',
      icon: '🔗',
      description: 'External systems',
      color: 'text-cyan-400',
      nodes: [
        {
          id: 'api-call',
          name: 'API Integration',
          description: 'Call external REST API',
          icon: '🌐',
          color: 'bg-cyan-500',
          category: 'data_integration' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'database-query',
          name: 'Database',
          description: 'Query database records',
          icon: '🗄️',
          color: 'bg-gray-600',
          category: 'data_integration' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'file-processor',
          name: 'File Processor',
          description: 'Process uploaded files',
          icon: '📄',
          color: 'bg-blue-600',
          category: 'data_integration' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    condition: {
      name: 'Logic & Control',
      icon: '⚡',
      description: 'Flow control',
      color: 'text-teal-400',
      nodes: [
        {
          id: 'condition-check',
          name: 'Condition',
          description: 'If/then logic branching',
          icon: '🔀',
          color: 'bg-teal-500',
          category: 'condition' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'delay',
          name: 'Delay',
          description: 'Wait before continuing',
          icon: '⏱️',
          color: 'bg-gray-500',
          category: 'condition' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    }
  };

  // Flatten all nodes for search
  const allNodes = Object.values(nodeCategories).flatMap(category => category.nodes);

  const filteredNodes = searchFilter
    ? allNodes.filter(node =>
        node.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        node.description.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : null;

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (node: NodeTypeDefinition, e: React.DragEvent) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('application/workflow-node', node.id);
    e.dataTransfer.effectAllowed = 'copy';
    onNodeDragStart(node);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 h-full border-r border-slate-700 bg-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Node Library</h3>
          <Button variant="ghost" size="sm" onClick={onToggle} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search nodes..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10 h-9 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNodes ? (
          // Search Results
          <div className="p-2">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">
              {filteredNodes.length} results
            </div>
            {filteredNodes.map(node => (
              <NodeItem key={node.id} node={node} onDragStart={handleDragStart} isReadOnly={isReadOnly} />
            ))}
          </div>
        ) : (
          // Categories
          <div className="p-2 space-y-1">
            {Object.entries(nodeCategories).map(([categoryId, category]) => (
              <div key={categoryId}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  {expandedCategories.has(categoryId) ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-lg">{category.icon}</span>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${category.color}`}>
                      {category.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {category.description}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                    {category.nodes.length}
                  </div>
                </button>

                {/* Category Nodes */}
                {expandedCategories.has(categoryId) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.nodes.map(node => (
                      <NodeItem key={node.id} node={node} onDragStart={handleDragStart} isReadOnly={isReadOnly} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-slate-700 bg-slate-900">
        <div className="text-xs text-slate-500 text-center">
          {isReadOnly ? (
            <span>View-only mode</span>
          ) : (
            <>
              <span className="text-emerald-400">Drag</span> nodes to canvas or use{' '}
              <span className="text-purple-400">AI Generator</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual Node Item Component
interface NodeItemProps {
  node: NodeTypeDefinition;
  onDragStart: (node: NodeTypeDefinition, e: React.DragEvent) => void;
  isReadOnly: boolean;
}

function NodeItem({ node, onDragStart, isReadOnly }: NodeItemProps) {
  return (
    <div
      className={`group relative p-3 rounded-lg border border-transparent transition-all ${
        isReadOnly 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:border-slate-600 hover:bg-slate-700 cursor-grab active:cursor-grabbing'
      }`}
      draggable={!isReadOnly}
      onDragStart={(e) => onDragStart(node, e)}
      title={isReadOnly ? 'Read-only mode' : `Drag to add: ${node.description}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${node.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
          <span className="text-sm">{node.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
            {node.name}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>

      {/* Drag indicator */}
      {!isReadOnly && (
        <div className="absolute absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
          <div className="w-6 h-4 flex flex-col justify-center gap-0.5">
            <div className="w-full h-0.5 bg-slate-500 rounded"></div>
            <div className="w-full h-0.5 bg-slate-500 rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
}