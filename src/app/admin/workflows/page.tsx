// src/app/admin/workflows/page.tsx
"use client";

import React, { useState } from 'react';
import AdminHeader from "@/components/admin/AdminHeader";
import WorkflowTemplateGrid from "@/components/admin/WorkflowTemplateGrid";
import WorkflowTemplateDetail from "@/components/admin/WorkflowTemplateDetail";
import WorkflowBuilder from "@/components/admin/WorkflowBuilder";
import { mockWorkflowTemplates } from '@/lib/mockData';

export default function AdminWorkflowsPage() {
  const [currentView, setCurrentView] = useState('templates'); // 'templates', 'detail', or 'builder'
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCurrentView('detail');
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setCurrentView('builder');
  };

  const handleEditWorkflow = (template: any) => {
    setSelectedTemplate(template);
    setCurrentView('builder');
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
  };

  const handleBackToDetail = () => {
    setCurrentView('detail');
  };

  const handleSaveWorkflow = (workflowData: any) => {
    console.log('Saving workflow:', workflowData);
    // Here you would typically save the data to your backend
    setCurrentView('templates');
  };

  const handleSaveTemplate = (templateData: any) => {
    console.log('Saving template details:', templateData);
    // Here you would typically save the data to your backend
    setSelectedTemplate(templateData);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'detail':
        return (
          <TemplateDetailView
            template={selectedTemplate}
            onBack={handleBackToTemplates}
            onEdit={handleEditWorkflow}
            onSave={handleSaveTemplate}
          />
        );
      case 'builder':
        return (
          <WorkflowBuilder
            template={selectedTemplate}
            onBack={selectedTemplate ? handleBackToDetail : handleBackToTemplates}
            onSave={handleSaveWorkflow}
          />
        );
      case 'templates':
      default:
        return (
          <WorkflowTemplateGrid
            templates={mockWorkflowTemplates}
            onTemplateSelect={handleTemplateSelect}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };
  
  const getHeaderInfo = () => {
     switch (currentView) {
      case 'detail':
        return { 
          title: selectedTemplate?.title || 'Workflow Details', 
          subtitle: 'Review and manage this workflow template'
        };
      case 'builder':
         return { 
          title: selectedTemplate ? `Editing: ${selectedTemplate.title}` : 'Create New Workflow', 
          subtitle: 'Visually design your AI-powered workflow'
        };
      case 'templates':
      default:
        return { 
          title: 'Workflow Templates', 
          subtitle: 'Create and manage global AI workflow templates'
        };
    }
  }

  return (
    <>
      <AdminHeader
        title={getHeaderInfo().title}
        subtitle={getHeaderInfo().subtitle}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </>
  );
}

const TemplateDetailView = ({ template, onBack, onEdit, onSave }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: template.title,
    description: template.description,
    category: template.category,
    complexity: template.complexity,
    icon: template.icon,
    tags: template.tags.join(', '),
    estimatedTime: template.estimatedTime
  });

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      ...editData,
      tags: editData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
    };
    onSave(updatedTemplate);
    setIsEditing(false);
  };

  return <WorkflowTemplateDetail 
    template={template} 
    onBack={onBack} 
    onEditWorkflow={onEdit} 
    onSave={handleSave} 
    isEditing={isEditing} 
    setIsEditing={setIsEditing} 
    editData={editData} 
    setEditData={setEditData} 
  />;
};