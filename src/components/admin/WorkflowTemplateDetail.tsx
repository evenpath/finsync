// src/components/admin/WorkflowTemplateDetail.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/shared/Badge";
import {
  ArrowLeft,
  Bot,
  Building,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Mail,
  Play,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  Users,
  BarChart3,
  Globe,
  Database,
  FileText,
  Target
} from 'lucide-react';
import { mockAssignedPartners, mockStepOverview } from '@/lib/mockData';
import type { WorkflowTemplate } from '@/lib/types';


interface WorkflowTemplateDetailProps {
    template: WorkflowTemplate;
    onBack: () => void;
    onEditWorkflow: (template: WorkflowTemplate) => void;
    onSave: (template: WorkflowTemplate) => void;
}

export default function WorkflowTemplateDetail({
  template,
  onBack,
  onEditWorkflow,
  onSave,
}: WorkflowTemplateDetailProps) {
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
      tags: editData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    };
    onSave(updatedTemplate);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header inside main content */}
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Templates
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="w-4 h-4" />
                      Edit Details
                    </Button>
                    <Button onClick={() => onEditWorkflow(template)}>
                      <Settings className="w-4 h-4" />
                      Edit Workflow
                    </Button>
                  </>
                )}
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Information */}
              <Card>
                <CardHeader>
                    <CardTitle>Template Information</CardTitle>
                </CardHeader>
                <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Title</label>
                      <Input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="h-24 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                        <Select value={editData.category} onValueChange={(value) => setEditData({ ...editData, category: value })}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hospitality">Hospitality</SelectItem>
                                <SelectItem value="Customer Service">Customer Service</SelectItem>
                                <SelectItem value="Content">Content</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="HR">Human Resources</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Complexity</label>
                         <Select value={editData.complexity} onValueChange={(value) => setEditData({ ...editData, complexity: value })}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="simple">Simple</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="complex">Complex</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Icon (Emoji)</label>
                        <Input
                          type="text"
                          value={editData.icon}
                          onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                          placeholder="Enter emoji"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Estimated Time</label>
                        <Input
                          type="text"
                          value={editData.estimatedTime}
                          onChange={(e) => setEditData({ ...editData, estimatedTime: e.target.value })}
                          placeholder="e.g., 2-4 hours"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Tags (comma separated)</label>
                      <Input
                        type="text"
                        value={editData.tags}
                        onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Description</h3>
                      <p className="text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Category</h4>
                        <p className="text-foreground font-medium">{template.category}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Complexity</h4>
                        <Badge variant={ template.complexity === 'simple' ? 'success' : template.complexity === 'medium' ? 'warning' : 'danger' }>
                          {template.complexity}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Estimated Time</h4>
                        <p className="text-foreground font-medium">{template.estimatedTime}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Last Modified</h4>
                        <p className="text-foreground font-medium">{template.lastModified}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag: string) => (
                          <Badge key={tag} variant="purple">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>

              {/* Workflow Steps Overview */}
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Workflow Steps</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="info">{mockStepOverview.length} steps</Badge>
                            <Badge variant="info">{mockStepOverview.filter(s => s.type === 'ai_agent').length} AI agents</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockStepOverview.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{step.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{step.type.replace('_', ' ')}</span>
                            {step.aiProvider && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-medium">{step.aiProvider}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Assigned Partners */}
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Assigned Partners</CardTitle>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                            Assign to Partner
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAssignedPartners.map(partner => (
                    <div key={partner.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{partner.name}</h3>
                          <p className="text-sm text-muted-foreground">{partner.members} members • {partner.tasksCompleted} tasks completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">Last used</p>
                        <p className="text-xs text-muted-foreground">{partner.lastUsed}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Uses</span>
                    <span className="text-lg font-bold text-foreground">{template.usageCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-lg font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Completion</span>
                    <span className="text-lg font-bold text-primary">{template.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Partners Using</span>
                    <span className="text-lg font-bold text-purple-600">{mockAssignedPartners.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                 <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="w-4 h-4" />
                    Test Workflow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4" />
                    Export Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4" />
                    Import Version
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="w-4 h-4" />
                    Delete Template
                  </Button>
                </CardContent>
              </Card>

              {/* Version History */}
              <Card>
                <CardHeader>
                    <CardTitle>Version History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { version: 'v2.1', date: '2024-07-30', author: 'Admin', changes: 'Added AI sentiment step' },
                    { version: 'v2.0', date: '2024-07-25', author: 'Admin', changes: 'Major workflow redesign' },
                    { version: 'v1.3', date: '2024-07-20', author: 'Admin', changes: 'Fixed approval timeout' }
                  ].map(version => (
                    <div key={version.version} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground">{version.version}</span>
                        <span className="text-xs text-muted-foreground">{version.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{version.changes}</p>
                      <p className="text-xs text-muted-foreground">By {version.author}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
