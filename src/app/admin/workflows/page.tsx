
// src/app/admin/workflows/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Zap, Save, ChevronDown, ChevronRight, X, ArrowDown, Settings, Play, Eye, Trash2, GripVertical, Sparkles, Clock, Users, Target, MessageSquare, Mail, Phone, MessageCircle, Calendar, AlertTriangle, Edit3, Home, Wrench, Building2, CheckCircle, DollarSign, Star, ChevronUp, Search, Loader2 } from 'lucide-react';
import { suggestIndustryTemplates, type IndustryTemplate } from '@/ai/flows/suggest-industry-templates';

// Communication channels with better icons
const communicationChannels = {
  chat: { icon: MessageSquare, label: 'Team Chat', color: 'bg-blue-500', textColor: 'text-blue-600' },
  sms: { icon: Phone, label: 'SMS', color: 'bg-green-500', textColor: 'text-green-600' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-600', textColor: 'text-green-700' },
  email: { icon: Mail, label: 'Email', color: 'bg-red-500', textColor: 'text-red-600' }
};

export default function AccordionWizardWorkflowBuilder({ initialData, onSave, onCancel }: { initialData?: any, onSave?: any, onCancel?: any }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('property_management');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [trigger, setTrigger] = useState(null);
  const [actions, setActions] = useState<any[]>([]);
  const [searchTemplate, setSearchTemplate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const industries = {
    property_management: { label: 'Property Management', icon: Home, color: 'from-green-500 to-emerald-500' },
    hvac_contractor: { label: 'HVAC Contractor', icon: Wrench, color: 'from-blue-500 to-cyan-500' },
    independent_hotel: { label: 'Independent Hotel', icon: Building2, color: 'from-purple-500 to-pink-500' }
  };
  
  const currentIndustry = industries[selectedIndustry as keyof typeof industries];

  useEffect(() => {
    const generateTemplates = async () => {
      if (!selectedIndustry) return;
      setIsLoadingTemplates(true);
      setSelectedTemplate(null);
      try {
        const industryLabel = industries[selectedIndustry as keyof typeof industries].label;
        const result = await suggestIndustryTemplates({ industry: industryLabel });
        setTemplates(result.templates);
      } catch (error) {
        console.error("Failed to generate templates:", error);
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    generateTemplates();
  }, [selectedIndustry]);
  
  // Filter templates
  const categories = ['All', ...new Set(templates.map(t => t.category))];
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTemplate.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTemplate.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const AccordionStep = ({ stepNumber, title, children, isActive, isCompleted, onClick }: { stepNumber: number, title: string, children: React.ReactNode, isActive: boolean, isCompleted: boolean, onClick: () => void }) => (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
      <div 
        className={`p-6 cursor-pointer transition-colors ${isActive ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-500 text-white' : 
              isActive ? 'bg-purple-500 text-white' : 
              'bg-gray-200 text-gray-600'
            }`}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isActive ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>
      {isActive && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  const TemplateCard = ({ template, isSelected, onClick }: { template: any, isSelected: boolean, onClick: () => void }) => (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{template.icon}</div>
        <div className="flex flex-col gap-1">
          {template.popularity && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              template.popularity === 'Most Popular' ? 'bg-orange-100 text-orange-700' :
              template.popularity === 'Popular' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {template.popularity}
            </span>
          )}
          <span className="text-xs text-gray-500">{template.steps} steps</span>
        </div>
      </div>
      <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{template.category}</span>
        {isSelected && <CheckCircle className="w-5 h-5 text-purple-600" />}
      </div>
    </div>
  );

  const WorkflowAction = ({ action, index, onDelete, onEdit }: { action: any, index: number, onDelete: () => void, onEdit: () => void }) => {
    const channels = action.config?.channels || [];
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-300 rounded-full cursor-grab">
              <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
              {action.icon ? <action.icon className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900">{action.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">
                  {action.type?.replace('_', ' ')}
                </span>
                {channels.length > 0 && (
                  <div className="flex gap-1">
                    {channels.map((channel: any) => {
                      const channelInfo = communicationChannels[channel as keyof typeof communicationChannels];
                      if (!channelInfo) return null;
                      const ChannelIcon = channelInfo.icon;
                      return (
                        <div key={channel} className={`w-5 h-5 ${channelInfo.color} rounded flex items-center justify-center`}>
                          <ChannelIcon className="w-3 h-3 text-white" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConditionalBranch = ({ condition, actions, onAddAction }: { condition: string, actions: any[], onAddAction: () => void }) => (
    <div className="ml-8 border-l-4 border-blue-200 pl-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">IF</span>
        <span className="text-sm font-medium text-gray-700">{condition}</span>
      </div>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <WorkflowAction 
            key={action.id} 
            action={action} 
            index={index}
            onDelete={() => {/* handle delete */}}
            onEdit={() => {/* handle edit */}}
          />
        ))}
        <button
          onClick={onAddAction}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
        >
          <Plus className="w-4 h-4" />
          Add Action to Branch
        </button>
      </div>
    </div>
  );

  const mockActions = [
    {
      id: '1',
      name: 'Analyze Issue Type',
      description: 'AI categorizes the issue (inventory, equipment, customer service)',
      type: 'ai_analysis',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '2',
      name: 'Route by Category',
      description: 'Route to appropriate team member based on issue category',
      type: 'conditional_branch',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      branches: [
        {
          condition: 'Inventory Issue',
          actions: [
            {
              id: '2a',
              name: 'Assign to Manager',
              description: 'Create urgent inventory task for manager',
              type: 'assign_task',
              icon: Users,
              color: 'from-green-500 to-emerald-500'
            },
            {
              id: '2b',
              name: 'Alert Manager',
              description: 'Send immediate notification about inventory issue',
              type: 'send_notification',
              icon: Zap,
              color: 'from-orange-500 to-red-500',
              config: { channels: ['chat', 'sms'] }
            }
          ]
        },
        {
          condition: 'Equipment Issue',
          actions: [
            {
              id: '2c',
              name: 'Assign to Maintenance',
              description: 'Create equipment repair task',
              type: 'assign_task',
              icon: Users,
              color: 'from-green-500 to-emerald-500'
            },
            {
              id: '2d',
              name: 'Alert Maintenance Team',
              description: 'Notify maintenance team via multiple channels',
              type: 'send_notification',
              icon: Zap,
              color: 'from-orange-500 to-red-500',
              config: { channels: ['chat', 'whatsapp'] }
            }
          ]
        }
      ]
    }
  ];

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1: return selectedIndustry && workflowName;
      case 2: return selectedTemplate || (trigger && workflowName);
      case 3: return actions.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${currentIndustry.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <currentIndustry.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workflow Builder</h1>
                <p className="text-gray-600">Create custom workflows with our step-by-step wizard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave?.({ industry: selectedIndustry, name: workflowName, template: selectedTemplate, actions })}
                className={`flex items-center gap-2 bg-gradient-to-r ${currentIndustry.color} hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <Save className="w-4 h-4" />
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-6">

        {/* Step 1: Industry & Basic Info */}
        <AccordionStep
          stepNumber={1}
          title="Choose Industry & Name Your Workflow"
          isActive={currentStep === 1}
          isCompleted={isStepCompleted(1)}
          onClick={() => setCurrentStep(1)}
        >
          <div className="pt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Industry</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(industries).map(([key, industry]) => {
                  const Icon = industry.icon;
                  const isSelected = selectedIndustry === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedIndustry(key)}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${industry.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{industry.label}</span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Emergency Maintenance Response"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Brief description of this workflow"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {isStepCompleted(1) && (
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue to Templates
                </button>
              </div>
            )}
          </div>
        </AccordionStep>

        {/* Step 2: Choose Template */}
        <AccordionStep
          stepNumber={2}
          title="Choose a Template or Start from Scratch"
          isActive={currentStep === 2}
          isCompleted={isStepCompleted(2)}
          onClick={() => setCurrentStep(2)}
        >
          <div className="pt-6 space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTemplate}
                  onChange={(e) => setSearchTemplate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Templates Grid */}
            {isLoadingTemplates ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="ml-4 text-gray-600">Generating expert templates for your industry...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template, index) => (
                  <TemplateCard
                    key={index}
                    template={template}
                    isSelected={selectedTemplate?.name === template.name}
                    onClick={() => setSelectedTemplate(template)}
                  />
                ))}
                
                {/* Custom Option */}
                <div 
                  className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === null 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(null)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="font-medium text-gray-900 mb-2">Start from Scratch</h3>
                    <p className="text-sm text-gray-600">Build a completely custom workflow</p>
                    {selectedTemplate === null && <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mt-2" />}
                  </div>
                </div>
              </div>
            )}

            {(selectedTemplate || selectedTemplate === null) && (
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue to Actions
                </button>
              </div>
            )}
          </div>
        </AccordionStep>

        {/* Step 3: Workflow Actions */}
        <AccordionStep
          stepNumber={3}
          title="Workflow Actions"
          isActive={currentStep === 3}
          isCompleted={isStepCompleted(3)}
          onClick={() => setCurrentStep(3)}
        >
          <div className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Workflow Actions</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Add Action
              </button>
            </div>

            <div className="space-y-4">
              {mockActions.map((action, index) => (
                <div key={action.id}>
                  <WorkflowAction 
                    action={action} 
                    index={index}
                    onDelete={() => {/* handle delete */}}
                    onEdit={() => {/* handle edit */}}
                  />
                  
                  {action.branches && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">Conditional Branches</div>
                      {action.branches.map((branch, branchIndex) => (
                        <ConditionalBranch
                          key={branchIndex}
                          condition={branch.condition}
                          actions={branch.actions}
                          onAddAction={() => {/* handle add action to branch */}}
                        />
                      ))}
                    </div>
                  )}
                  
                  {index < mockActions.length - 1 && (
                    <div className="flex justify-center my-3">
                      <ArrowDown className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Review & Save
              </button>
            </div>
          </div>
        </AccordionStep>

        {/* Step 4: Review */}
        <AccordionStep
          stepNumber={4}
          title="Review & Save"
          isActive={currentStep === 4}
          isCompleted={isStepCompleted(4)}
          onClick={() => setCurrentStep(4)}
        >
          <div className="pt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Workflow Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">{currentIndustry.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{workflowName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Template:</span>
                  <span className="font-medium">{selectedTemplate?.name || 'Custom'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actions:</span>
                  <span className="font-medium">{mockActions.length} steps</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionStep>
      </div>
    </div>
  );
}
