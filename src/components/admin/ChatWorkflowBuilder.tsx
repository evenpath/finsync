
"use client";
import React, { useState } from 'react';
import { Plus, MessageSquare, User, CheckCircle, Zap, Bot, ArrowDown, X, Check, ChevronDown, ChevronRight, Play, Save, Settings, Users, Clock, AlertCircle, Calendar, Bell, FileText } from 'lucide-react';

// Step types available in the platform
const stepTypes = {
  trigger: {
    'chat_message': {
      name: 'AI Chat Analysis',
      icon: MessageSquare,
      description: 'When AI detects specific intent, urgency, or patterns in chat messages',
      color: 'bg-blue-100 text-blue-600'
    },
    'keyword_mention': {
      name: 'Keyword Mention',
      icon: AlertCircle,
      description: 'When specific keywords are mentioned in chat',
      color: 'bg-purple-100 text-purple-600'
    },
    'user_joins': {
      name: 'User Joins Chat',
      icon: Users,
      description: 'When someone joins a workspace or chat',
      color: 'bg-green-100 text-green-600'
    }
  },
  action: {
    'create_todo': {
      name: 'Create To-Do Item',
      icon: CheckCircle,
      description: 'Add item to personal or team to-do list',
      color: 'bg-green-100 text-green-600'
    },
    'assign_task': {
      name: 'Assign Task',
      icon: User,
      description: 'Create and assign a task to a team member',
      color: 'bg-blue-100 text-blue-600'
    },
    'request_approval': {
      name: 'Request Approval',
      icon: CheckCircle,
      description: 'Ask manager or admin to approve something',
      color: 'bg-yellow-100 text-yellow-600'
    },
    'send_email': {
      name: 'Send Email',
      icon: MessageSquare,
      description: 'Send email notification to internal or external contacts',
      color: 'bg-purple-100 text-purple-600'
    },
    'create_calendar_event': {
      name: 'Schedule Meeting',
      icon: Calendar,
      description: 'Create calendar event or schedule meeting',
      color: 'bg-indigo-100 text-indigo-600'
    },
    'update_status': {
      name: 'Update Status',
      icon: Settings,
      description: 'Change project, task, or customer status',
      color: 'bg-orange-100 text-orange-600'
    },
    'ai_analysis': {
      name: 'AI Analysis',
      icon: Bot,
      description: 'Let AI analyze, classify, or process content',
      color: 'bg-pink-100 text-pink-600'
    },
    'log_information': {
      name: 'Log Information',
      icon: FileText,
      description: 'Record important information or notes',
      color: 'bg-gray-100 text-gray-600'
    },
    'send_notification': {
      name: 'Send Notification',
      icon: Bell,
      description: 'Send in-app or push notification to users',
      color: 'bg-red-100 text-red-600'
    }
  }
};

// Generic assignment options for templates
const assignmentOptions = [
  { id: 'manager', label: 'Manager', description: 'Workspace manager' },
  { id: 'senior_worker', label: 'Senior Worker', description: 'Most experienced team member' },
  { id: 'any_worker', label: 'Any Available Worker', description: 'Next available team member' },
  { id: 'message_sender', label: 'Message Sender', description: 'Person who sent the original message' },
  { id: 'custom_role', label: 'Custom Role', description: 'Define specific role criteria' },
  { id: 'partner_admin', label: 'Partner Admin', description: 'Workspace administrator' }
];

const approverOptions = [
  { id: 'manager', label: 'Manager', description: 'Direct manager approval' },
  { id: 'partner_admin', label: 'Partner Admin', description: 'Workspace administrator' },
  { id: 'senior_worker', label: 'Senior Worker', description: 'Experienced team member' },
  { id: 'custom_approver', label: 'Custom Approver', description: 'Define approval criteria' }
];

const recipientOptions = [
  { id: 'all_team', label: 'All Team Members', description: 'Everyone in workspace' },
  { id: 'managers_only', label: 'Managers Only', description: 'Management team' },
  { id: 'workers_only', label: 'Workers Only', description: 'Front-line team members' },
  { id: 'message_sender', label: 'Message Sender', description: 'Person who sent original message' },
  { id: 'custom_group', label: 'Custom Group', description: 'Define recipient criteria' }
];

export default function ChatWorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [trigger, setTrigger] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [showStepSelector, setShowStepSelector] = useState(false);
  const [selectorType, setSelectorType] = useState('trigger');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  const handleStepSelect = (stepKey: string, stepType: string) => {
    const step = (stepTypes as any)[stepType][stepKey];
    
    if (stepType === 'trigger') {
      setTrigger({ 
        type: stepKey, 
        config: getDefaultConfig(stepKey, stepType),
        configured: false,
        ...step 
      });
    } else {
      setActions(prev => [...prev, { 
        id: Date.now().toString(),
        type: stepKey,
        config: getDefaultConfig(stepKey, stepType),
        configured: false,
        ...step
      }]);
    }
    setShowStepSelector(false);
  };

  const getDefaultConfig = (stepKey: string, stepType: string) => {
    const configs: {[key: string]: any} = {
      chat_message: {
        analysisType: 'ai_review',
        aiPrompt: 'Does this message require immediate attention or action? Look for urgency, requests for help, complaints, or approval needs.',
        confidenceThreshold: 75
      },
      keyword_mention: {
        keywords: [],
        caseSensitive: false
      },
      user_joins: {
        channels: 'all'
      },
      create_todo: {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: 1,
        listType: 'personal'
      },
      assign_task: {
        assignee: '',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: 1
      },
      request_approval: {
        approver: '',
        message: '',
        timeout: 24
      },
      send_email: {
        recipients: [],
        subject: '',
        message: '',
        emailType: 'internal'
      },
      create_calendar_event: {
        title: '',
        attendees: [],
        duration: 30,
        description: ''
      },
      update_status: {
        target: 'task',
        newStatus: '',
        notifyTeam: true
      },
      ai_analysis: {
        action: 'summarize',
        prompt: '',
        model: 'gpt-4'
      },
      log_information: {
        category: 'general',
        message: '',
        includeOriginalMessage: true
      },
      send_notification: {
        recipients: [],
        message: '',
        channel: 'in_app',
        priority: 'normal'
      }
    };
    
    return configs[stepKey] || {};
  };

  const updateStepConfig = (stepId: string, newConfig: any) => {
    if (stepId === 'trigger') {
      setTrigger((prev: any) => ({ 
        ...prev, 
        config: { ...prev.config, ...newConfig },
        configured: isStepConfigured(prev.type, { ...prev.config, ...newConfig })
      }));
    } else {
      setActions(prev => prev.map(action => 
        action.id === stepId 
          ? { 
              ...action, 
              config: { ...action.config, ...newConfig },
              configured: isStepConfigured(action.type, { ...action.config, ...newConfig })
            }
          : action
      ));
    }
  };

  const isStepConfigured = (stepType: string, config: any) => {
    switch (stepType) {
      case 'chat_message':
        return config.aiPrompt?.trim().length > 0;
      case 'keyword_mention':
        return config.keywords?.length > 0;
      case 'user_joins':
        return true;
      case 'create_todo':
        if (config.listType === 'assign') {
          return config.assignee && config.title?.trim().length > 0;
        }
        return config.title?.trim().length > 0;
      case 'assign_task':
        return config.assignee && config.title?.trim().length > 0;
      case 'request_approval':
        return config.approver && config.message?.trim().length > 0;
      case 'send_email':
        return config.recipients?.length > 0 && config.subject?.trim().length > 0;
      case 'create_calendar_event':
        return config.title?.trim().length > 0 && config.attendees?.length > 0;
      case 'update_status':
        return config.newStatus?.trim().length > 0;
      case 'ai_analysis':
        return config.action && (config.action !== 'custom' || config.prompt?.trim().length > 0);
      case 'log_information':
        return config.message?.trim().length > 0;
      case 'send_notification':
        return config.recipients?.length > 0 && config.message?.trim().length > 0;
      default:
        return false;
    }
  };

  const removeAction = (actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  const addStep = (type: string) => {
    setSelectorType(type);
    setShowStepSelector(true);
  };

  const isWorkflowValid = workflowName && trigger?.configured && actions.length > 0 && actions.every(a => a.configured);

  const renderStepConfig = (step: any, stepId: string) => {
    const { type, config } = step;

    switch (type) {
      case 'chat_message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Analysis Prompt</label>
              <textarea
                value={config.aiPrompt || ''}
                onChange={(e) => updateStepConfig(stepId, { aiPrompt: e.target.value })}
                placeholder="Does this message require immediate attention or action? Look for urgency, requests for help, complaints, or approval needs."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">AI will analyze each message using this prompt</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confidence Threshold ({config.confidenceThreshold || 75}%)
              </label>
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={config.confidenceThreshold || 75}
                onChange={(e) => updateStepConfig(stepId, { confidenceThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>More sensitive</span>
                <span>Balanced</span>
                <span>High confidence</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> AI analyzes every message using your prompt. 
                If confidence is above {config.confidenceThreshold || 75}%, the workflow triggers.
              </p>
            </div>
          </div>
        );

      case 'keyword_mention':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Keywords (comma separated)</label>
              <input
                type="text"
                value={config.keywords?.join(', ') || ''}
                onChange={(e) => updateStepConfig(stepId, { keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                placeholder="urgent, help, issue, problem"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'create_todo':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Add to List</label>
              <select
                value={config.listType || 'personal'}
                onChange={(e) => updateStepConfig(stepId, { listType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="personal">Personal To-Do</option>
                <option value="team">Team To-Do</option>
                <option value="assign">Assign to Someone</option>
              </select>
            </div>
            
            {config.listType === 'assign' && (
              <div>
                <label className="block text-sm font-medium mb-2">Assign To</label>
                <select
                  value={config.assignee || ''}
                  onChange={(e) => updateStepConfig(stepId, { assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select assignment rule...</option>
                  {assignmentOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                {config.assignee && (
                  <p className="text-xs text-gray-500 mt-1">
                    {assignmentOptions.find(opt => opt.id === config.assignee)?.description}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">To-Do Item</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateStepConfig(stepId, { title: e.target.value })}
                placeholder="e.g., Follow up on customer request from {user_name}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={config.description || ''}
                onChange={(e) => updateStepConfig(stepId, { description: e.target.value })}
                placeholder="Additional context: {original_message}"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={config.priority || 'medium'}
                  onChange={(e) => updateStepConfig(stepId, { priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due (days)</label>
                <input
                  type="number"
                  value={config.dueDate || 1}
                  onChange={(e) => updateStepConfig(stepId, { dueDate: parseInt(e.target.value) })}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'assign_task':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Assign To</label>
              <select
                value={config.assignee || ''}
                onChange={(e) => updateStepConfig(stepId, { assignee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select assignment rule...</option>
                {assignmentOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {config.assignee && (
                <p className="text-xs text-gray-500 mt-1">
                  {assignmentOptions.find(opt => opt.id === config.assignee)?.description}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Task Title</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateStepConfig(stepId, { title: e.target.value })}
                placeholder="e.g., Handle customer request from {user_name}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Task Description</label>
              <textarea
                value={config.description || ''}
                onChange={(e) => updateStepConfig(stepId, { description: e.target.value })}
                placeholder="Original message: {original_message}&#10;&#10;Please handle this request appropriately."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={config.priority || 'medium'}
                  onChange={(e) => updateStepConfig(stepId, { priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due (days)</label>
                <input
                  type="number"
                  value={config.dueDate || 1}
                  onChange={(e) => updateStepConfig(stepId, { dueDate: parseInt(e.target.value) })}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'request_approval':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Approval Required From</label>
              <select
                value={config.approver || ''}
                onChange={(e) => updateStepConfig(stepId, { approver: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select approver type...</option>
                {approverOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {config.approver && (
                <p className="text-xs text-gray-500 mt-1">
                  {approverOptions.find(opt => opt.id === config.approver)?.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Approval Request Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="Please approve this request: {original_message}"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timeout (hours)</label>
              <input
                type="number"
                value={config.timeout || 24}
                onChange={(e) => updateStepConfig(stepId, { timeout: parseInt(e.target.value) })}
                min="1"
                max="168"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Type</label>
              <select
                value={config.emailType || 'internal'}
                onChange={(e) => updateStepConfig(stepId, { emailType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="internal">Internal (Team)</option>
                <option value="customer">Customer</option>
                <option value="custom">Custom Email</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {config.emailType === 'internal' ? 'Send To (Team)' : 'Recipients'}
              </label>
              {config.emailType === 'internal' ? (
                <select
                  value={config.recipients?.[0] || ''}
                  onChange={(e) => updateStepConfig(stepId, { recipients: [e.target.value] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select recipient group...</option>
                  {recipientOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="email"
                  value={config.recipients?.[0] || ''}
                  onChange={(e) => updateStepConfig(stepId, { recipients: [e.target.value] })}
                  placeholder="customer@email.com or use {customer_email}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
              {config.emailType === 'internal' && config.recipients?.[0] && (
                <p className="text-xs text-gray-500 mt-1">
                  {recipientOptions.find(opt => opt.id === config.recipients[0])?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => updateStepConfig(stepId, { subject: e.target.value })}
                placeholder="e.g., Update on your request"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="We received your message: {original_message}&#10;&#10;Our team will follow up shortly."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        );

      case 'create_calendar_event':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Title</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateStepConfig(stepId, { title: e.target.value })}
                placeholder="e.g., Follow-up meeting with {user_name}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Attendees</label>
              <select
                value={config.attendees?.[0] || ''}
                onChange={(e) => updateStepConfig(stepId, { attendees: [e.target.value] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select attendee group...</option>
                {recipientOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {config.attendees?.[0] && (
                <p className="text-xs text-gray-500 mt-1">
                  {recipientOptions.find(opt => opt.id === config.attendees[0])?.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <select
                  value={config.duration || 30}
                  onChange={(e) => updateStepConfig(stepId, { duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={config.description || ''}
                onChange={(e) => updateStepConfig(stepId, { description: e.target.value })}
                placeholder="Meeting to discuss: {original_message}"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        );

      case 'update_status':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Update What</label>
              <select
                value={config.target || 'task'}
                onChange={(e) => updateStepConfig(stepId, { target: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="task">Current Task</option>
                <option value="project">Project Status</option>
                <option value="customer">Customer Status</option>
                <option value="ticket">Support Ticket</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={config.newStatus || ''}
                onChange={(e) => updateStepConfig(stepId, { newStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select status...</option>
                <option value="in_progress">In Progress</option>
                <option value="pending_review">Pending Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.notifyTeam || false}
                  onChange={(e) => updateStepConfig(stepId, { notifyTeam: e.target.checked })}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Notify team about status change</span>
              </label>
            </div>
          </div>
        );

      case 'ai_analysis':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Action</label>
              <select
                value={config.action || 'summarize'}
                onChange={(e) => updateStepConfig(stepId, { action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="summarize">Summarize message</option>
                <option value="classify">Classify priority/category</option>
                <option value="extract">Extract key information</option>
                <option value="sentiment">Analyze sentiment</option>
                <option value="custom">Custom prompt</option>
              </select>
            </div>
            {config.action === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">Custom Prompt</label>
                <textarea
                  value={config.prompt || ''}
                  onChange={(e) => updateStepConfig(stepId, { prompt: e.target.value })}
                  placeholder="Analyze this message and determine..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>
        );

      case 'log_information':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Log Category</label>
              <select
                value={config.category || 'general'}
                onChange={(e) => updateStepConfig(stepId, { category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="general">General Note</option>
                <option value="customer_interaction">Customer Interaction</option>
                <option value="issue_report">Issue Report</option>
                <option value="team_communication">Team Communication</option>
                <option value="workflow_event">Workflow Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Log Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="Message received from {user_name}: {original_message}"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeOriginalMessage || false}
                  onChange={(e) => updateStepConfig(stepId, { includeOriginalMessage: e.target.checked })}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Include original message in log</span>
              </label>
            </div>
          </div>
        );

      case 'send_notification':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Notification Type</label>
              <select
                value={config.channel || 'in_app'}
                onChange={(e) => updateStepConfig(stepId, { channel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="in_app">In-App Notification</option>
                <option value="push">Push Notification</option>
                <option value="chat">Chat Message</option>
                <option value="sms">SMS (if urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Send To</label>
              <select
                value={config.recipients?.[0] || ''}
                onChange={(e) => updateStepConfig(stepId, { recipients: [e.target.value] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select recipient group...</option>
                {recipientOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {config.recipients?.[0] && (
                <p className="text-xs text-gray-500 mt-1">
                  {recipientOptions.find(opt => opt.id === config.recipients[0])?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateStepConfig(stepId, { message: e.target.value })}
                placeholder="New message received: {original_message}"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={config.priority || 'normal'}
                onChange={(e) => updateStepConfig(stepId, { priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Low (No sound)</option>
                <option value="normal">Normal</option>
                <option value="high">High (Sound + Badge)</option>
                <option value="urgent">Urgent (Persistent)</option>
              </select>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">Configuration options for this step type.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat Workflow Builder</h1>
                <p className="text-gray-600">Create workflow templates with role-based assignments that partners can customize</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsTestMode(true)}
                disabled={!isWorkflowValid}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                Test
              </button>
              <button 
                disabled={!isWorkflowValid}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Workflow Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Workflow Template Details</h2>
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Template Mode:</strong> You're creating a reusable template. Assignments use roles (Manager, Senior Worker, etc.) 
              rather than specific people. Partners will map these roles to their actual team members.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Handle urgent customer requests"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="When customers mention urgent issues, get manager approval and assign to senior team member"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {/* Trigger */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                  ⚡
                </div>
                <h3 className="text-lg font-semibold">When this happens...</h3>
                <span className="text-sm text-gray-500">(Trigger)</span>
              </div>

              {!trigger ? (
                <button
                  onClick={() => addStep('trigger')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Choose a chat trigger</p>
                </button>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${trigger.color}`}>
                        <trigger.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{trigger.name}</p>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trigger.configured && <Check className="w-5 h-5 text-green-600" />}
                      <button
                        onClick={() => setExpandedStep(expandedStep === 'trigger' ? null : 'trigger')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedStep === 'trigger' ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </button>
                    </div>
                  </div>

                  {expandedStep === 'trigger' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {renderStepConfig(trigger, 'trigger')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          {trigger && (
            <div className="flex justify-center">
              <ArrowDown className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Actions */}
          {actions.map((action, index) => (
            <div key={action.id}>
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold">Then do this...</h3>
                    <span className="text-sm text-gray-500">(Action)</span>
                    <div className="ml-auto">
                      <button
                        onClick={() => removeAction(action.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.configured && <Check className="w-5 h-5 text-green-600" />}
                        <button
                          onClick={() => setExpandedStep(expandedStep === action.id ? null : action.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedStep === action.id ? 
                            <ChevronDown className="w-5 h-5" /> : 
                            <ChevronRight className="w-5 h-5" />
                          }
                        </button>
                      </div>
                    </div>

                    {expandedStep === action.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {renderStepConfig(action, action.id)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow between actions */}
              <div className="flex justify-center">
                <ArrowDown className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          ))}

          {/* Add Action Button */}
          {trigger && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <button
                  onClick={() => addStep('action')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Add another action</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Selector Modal */}
      {showStepSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Choose a {selectorType === 'trigger' ? 'trigger' : 'action'} step
                </h2>
                <button 
                  onClick={() => setShowStepSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries((stepTypes as any)[selectorType === 'trigger' ? 'trigger' : 'action']).map(([key, step]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => handleStepSelect(key, selectorType === 'trigger' ? 'trigger' : 'action')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p className="font-medium">{step.name}</p>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Mode Overlay */}
      {isTestMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-orange-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Testing Workflow</h3>
            <p className="text-gray-600">Simulating chat triggers and actions...</p>
            <button 
              onClick={() => setIsTestMode(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
