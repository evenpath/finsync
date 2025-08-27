// src/components/workflow/builder/NodeLibrary.tsx

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown, ChevronRight, 
         Zap, Bot, Users, Mail, Globe, Target, 
         Database, FileText, CheckCircle, Clock, 
         Filter, Phone, MessageSquare, Calendar,
         Webhook, Play } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { NodeTypeDefinition } from '@/lib/types/workflow-builder';

interface NodeLibraryProps {
  isOpen: boolean;
  onToggle: () => void;
  onNodeDragStart: (nodeType: NodeTypeDefinition) => void;
  isReadOnly?: boolean;
}

export default function NodeLibrary({ isOpen, onToggle, onNodeDragStart, isReadOnly = false }: NodeLibraryProps) {
  const [searchFilter, setSearchFilter] = useState('');
  // All categories closed by default
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Node categories with Lucide icons and improved typography
  const nodeCategories = {
    trigger: {
      name: 'Triggers',
      icon: Play,
      description: 'Start workflows',
      color: 'text-emerald-400',
      nodes: [
        {
          id: 'manual-trigger',
          name: 'Manual Start',
          description: 'Manually trigger execution',
          icon: Play,
          color: 'bg-emerald-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'form-submission',
          name: 'Form Trigger',
          description: 'Form submission trigger',
          icon: FileText,
          color: 'bg-blue-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'webhook',
          name: 'Webhook',
          description: 'HTTP webhook endpoint',
          icon: Webhook,
          color: 'bg-indigo-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'scheduled-trigger',
          name: 'Schedule',
          description: 'Time-based automation',
          icon: Clock,
          color: 'bg-purple-500',
          category: 'trigger' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    ai_processing: {
      name: 'AI Agents',
      icon: Bot,
      description: 'AI processing',
      color: 'text-purple-400',
      nodes: [
        {
          id: 'ai-analyzer',
          name: 'AI Agent',
          description: 'Custom AI processing',
          icon: Bot,
          color: 'bg-purple-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: { model: 'gpt-4', provider: 'OpenAI' }
        },
        {
          id: 'text-classifier',
          name: 'Text Classifier',
          description: 'Categorize content',
          icon: Target,
          color: 'bg-indigo-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'sentiment-analyzer',
          name: 'Sentiment Analysis',
          description: 'Analyze emotional tone',
          icon: MessageSquare,
          color: 'bg-pink-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'content-generator',
          name: 'Content Generator',
          description: 'Generate text content',
          icon: FileText,
          color: 'bg-violet-500',
          category: 'ai_processing' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    human_action: {
      name: 'Human Tasks',
      icon: Users,
      description: 'Human involvement',
      color: 'text-orange-400',
      nodes: [
        {
          id: 'human-task',
          name: 'Human Task',
          description: 'Assign to team member',
          icon: Users,
          color: 'bg-orange-500',
          category: 'human_action' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'approval-gate',
          name: 'Approval Gate',
          description: 'Require approval',
          icon: CheckCircle,
          color: 'bg-yellow-500',
          category: 'human_action' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'review-task',
          name: 'Review Task',
          description: 'Content review',
          icon: Search,
          color: 'bg-amber-500',
          category: 'human_action' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    communication: {
      name: 'Communication',
      icon: MessageSquare,
      description: 'Messages & alerts',
      color: 'text-blue-400',
      nodes: [
        {
          id: 'notification',
          name: 'Notification',
          description: 'Send notification',
          icon: MessageSquare,
          color: 'bg-blue-500',
          category: 'communication' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'email-send',
          name: 'Email',
          description: 'Send email message',
          icon: Mail,
          color: 'bg-red-500',
          category: 'communication' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'slack-message',
          name: 'Slack Message',
          description: 'Post to Slack',
          icon: MessageSquare,
          color: 'bg-green-500',
          category: 'communication' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    data_integration: {
      name: 'Data & APIs',
      icon: Database,
      description: 'External systems',
      color: 'text-cyan-400',
      nodes: [
        {
          id: 'api-call',
          name: 'API Call',
          description: 'Call external API',
          icon: Globe,
          color: 'bg-cyan-500',
          category: 'data_integration' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'database-query',
          name: 'Database',
          description: 'Query database',
          icon: Database,
          color: 'bg-gray-600',
          category: 'data_integration' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'file-processor',
          name: 'File Processor',
          description: 'Process files',
          icon: FileText,
          color: 'bg-blue-600',
          category: 'data_integration' as const,
          configSchema: {},
          defaultConfig: {}
        }
      ]
    },
    condition: {
      name: 'Logic & Flow',
      icon: Zap,
      description: 'Control flow',
      color: 'text-teal-400',
      nodes: [
        {
          id: 'condition-check',
          name: 'Condition',
          description: 'If/then logic',
          icon: Target,
          color: 'bg-teal-500',
          category: 'condition' as const,
          configSchema: {},
          defaultConfig: {}
        },
        {
          id: 'delay',
          name: 'Delay',
          description: 'Wait before continuing',
          icon: Clock,
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

  if (!isOpen) return null;

  return (
    <div className="w-72 h-full border-r border-slate-700 bg-slate-800 flex flex-col">
      {/* Header - Improved spacing and typography */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Node Library</h3>
            <p className="text-xs text-slate-400 mt-0.5">Drag to add nodes</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="text-slate-400 hover:text-slate-200 h-7 w-7 p-0">
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
            className="pl-9 h-9 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      {/* Node List - No scroll, fixed height */}
      <div className="flex-1 p-3">
        {filteredNodes ? (
          // Search Results
          <div>
            <div className="text-xs font-medium text-slate-400 mb-3 px-1">
              {filteredNodes.length} result{filteredNodes.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-2">
              {filteredNodes.map(node => (
                <DraggableNodeItem key={node.id} node={node} onDragStart={onNodeDragStart} isReadOnly={isReadOnly} />
              ))}
            </div>
          </div>
        ) : (
          // Categories
          <div className="space-y-1">
            {Object.entries(nodeCategories).map(([categoryId, category]) => (
              <div key={categoryId}>
                {/* Category Header - Improved typography */}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  {expandedCategories.has(categoryId) ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${category.color}`}>
                      {category.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {category.description}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded-md">
                    {category.nodes.length}
                  </div>
                </button>

                {/* Category Nodes */}
                {expandedCategories.has(categoryId) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {category.nodes.map(node => (
                      <DraggableNodeItem key={node.id} node={node} onDragStart={onNodeDragStart} isReadOnly={isReadOnly} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Improved typography */}
      <div className="flex-shrink-0 p-3 border-t border-slate-700 bg-slate-900">
        <div className="text-xs text-slate-500 text-center">
          {isReadOnly ? (
            <span>Read-only mode</span>
          ) : (
            <span>
              <span className="text-emerald-400 font-medium">Drag</span> nodes to canvas or use{' '}
              <span className="text-purple-400 font-medium">AI Generator</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Draggable Node Item Component - Improved typography
interface DraggableNodeItemProps {
  node: NodeTypeDefinition;
  onDragStart: (node: NodeTypeDefinition) => void;
  isReadOnly: boolean;
}

function DraggableNodeItem({ node, onDragStart, isReadOnly }: DraggableNodeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `node-${node.id}`,
    data: {
      nodeType: node,
      type: 'workflow-node'
    },
    disabled: isReadOnly
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = node.icon;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-3 rounded-lg border border-transparent transition-all ${
        isReadOnly 
          ? 'opacity-60 cursor-not-allowed' 
          : isDragging
          ? 'border-emerald-400 bg-slate-700 cursor-grabbing shadow-lg'
          : 'hover:border-slate-600 hover:bg-slate-700 cursor-grab active:cursor-grabbing'
      }`}
      title={isReadOnly ? 'Read-only mode' : `Drag to add: ${node.description}`}
      onMouseDown={() => !isReadOnly && onDragStart(node)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 ${node.color} rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-md ${isDragging ? 'shadow-lg shadow-emerald-400/30' : ''}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium transition-colors ${
            isDragging ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'
          }`}>
            {node.name}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {node.description}
          </p>
        </div>
      </div>

      {/* Drag indicator */}
      {!isReadOnly && (
        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity ${
          isDragging ? 'opacity-75' : 'opacity-0 group-hover:opacity-50'
        }`}>
          <div className="w-4 h-4 flex flex-col justify-center gap-0.5">
            <div className="w-full h-0.5 bg-slate-500 rounded-full"></div>
            <div className="w-full h-0.5 bg-slate-500 rounded-full"></div>
            <div className="w-full h-0.5 bg-slate-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}