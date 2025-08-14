
// src/components/admin/WorkflowTemplateGrid.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../shared/Badge";
import {
  Plus,
  Search,
  MoreVertical,
  Copy,
  Layers,
  Bot,
  Clock,
  Users
} from 'lucide-react';
import type { WorkflowTemplate } from '../../lib/types';


interface WorkflowTemplateGridProps {
    templates: WorkflowTemplate[];
    onTemplateSelect: (template: WorkflowTemplate) => void;
    onCreateNew: () => void;
}

export default function WorkflowTemplateGrid({ templates, onTemplateSelect, onCreateNew }: WorkflowTemplateGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');

  const filteredTemplates = templates.filter(template => {
    return (
      (template.title?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' || template.category === categoryFilter) &&
      (complexityFilter === 'all' || template.complexity === complexityFilter)
    );
  });

  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
  const complexities = ['simple', 'medium', 'complex'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-2"
                />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Complexity" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Complexity</SelectItem>
                    {complexities.map(comp => (
                        <SelectItem key={comp} value={comp}>{comp.charAt(0).toUpperCase() + comp.slice(1)}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
            </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
       {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
            <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onTemplateSelect(template)}>
                <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl bg-secondary p-3 rounded-lg">{template.icon}</div>
                            <div>
                            <CardTitle className="font-headline text-lg">{template.title}</CardTitle>
                            <Badge variant="info">{template.category}</Badge>
                            </div>
                        </div>
                        <Badge variant={
                            template.complexity === 'simple' ? 'success' :
                            template.complexity === 'medium' ? 'warning' : 'danger'
                        }>
                            {template.complexity}
                        </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Layers className="w-4 h-4" /><span>{template.steps.length} steps</span></div>
                        <div className="flex items-center gap-1"><Bot className="w-4 h-4" /><span>{template.aiAgents} AI agents</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{template.estimatedTime}</span></div>
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{template.usageCount} uses</span></div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                            <Badge key={tag} variant="purple" className="text-xs">{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-4">Updated {template.lastModified}</p>
                    <div className="flex items-center justify-between w-full">
                        <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                            Clone
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            ))}
        </div>
        ) : (
        <Card className="col-span-full">
          <CardContent className="p-10 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">No Workflow Templates Found</h3>
            <p className="mb-4">Get started by creating a new workflow from a prompt.</p>
            <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4" />
                Create New Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
