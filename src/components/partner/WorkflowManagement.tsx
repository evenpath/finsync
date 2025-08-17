// src/components/partner/WorkflowManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../shared/Badge";
import { Input } from "../ui/input";
import {
  Plus,
  Layers,
  Users,
  CheckCircle,
  Clock,
  Edit3,
  Send,
  Share2,
  Search,
  Filter,
  Loader2,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Zap,
} from "lucide-react";
import type { WorkflowInstance, WorkflowTemplate } from "../../lib/types";
import { useAuth } from "../../hooks/use-auth";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useToast } from "../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function WorkflowManagement() {
  const { user, loading: authLoading } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  const partnerId = user?.customClaims?.partnerId;

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.deploymentStatus === statusFilter;
    const matchesCategory = categoryFilter === "all" || !workflow.template?.category || workflow.template.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(workflows.map(w => w.template?.category).filter(Boolean))];

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!partnerId || !db) {
      setError("Could not identify your organization. Please ensure you are logged in correctly.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch workflow instances
    const workflowsQuery = query(
      collection(db, "workflowInstances"),
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );

    const unsubscribeWorkflows = onSnapshot(workflowsQuery, (snapshot) => {
      const workflowsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      } as WorkflowInstance));
      
      setWorkflows(workflowsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching workflows:", error);
      setError("Failed to fetch workflows. Please check your permissions.");
      setIsLoading(false);
    });

    // Fetch workflow templates
    const templatesQuery = query(
      collection(db, "workflowTemplates"),
      orderBy("title", "asc")
    );

    const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkflowTemplate));
      
      setTemplates(templatesData);
    }, (error) => {
      console.error("Error fetching templates:", error);
    });

    return () => {
      unsubscribeWorkflows();
      unsubscribeTemplates();
    };
  }, [partnerId, authLoading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return <Badge variant="success">Active</Badge>;
      case 'paused': return <Badge variant="warning">Paused</Badge>;
      case 'completed': return <Badge variant="info">Completed</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'failed': return <Badge variant="danger">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'customer_service': 'bg-blue-100 text-blue-800',
      'hr': 'bg-green-100 text-green-800',
      'finance': 'bg-purple-100 text-purple-800',
      'marketing': 'bg-orange-100 text-orange-800',
      'operations': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    );
  };

  const handleWorkflowAction = async (workflowId: string, action: string) => {
    try {
      // This would typically call a server action or API
      toast({
        title: `Workflow ${action}`,
        description: `The workflow has been ${action.toLowerCase()}.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action.toLowerCase()} workflow. Please try again.`
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load workflows</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading workflows...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold font-headline text-foreground">My Workflows</h2>
          <p className="text-muted-foreground">Customize and manage your assigned workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.deploymentStatus === 'live').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Executions</p>
                <p className="text-2xl font-bold">{workflows.reduce((acc, w) => acc + (w.performanceMetrics?.successfulExecutions || 0), 0)}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {workflows.length > 0 ? Math.round(workflows.reduce((acc, w) => acc + (w.performanceMetrics?.successRate || 0), 0) / workflows.length) : 0}%
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workflow to start automating your business processes.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  {workflow.template?.category && getCategoryBadge(workflow.template.category)}
                  {getStatusBadge(workflow.deploymentStatus)}
                </div>
                <CardTitle className="font-headline">{workflow.name}</CardTitle>
                <CardDescription>{workflow.description || 'No description available'}</CardDescription>
                {workflow.customizations?.length > 0 && (
                  <Badge variant="info">Customized</Badge>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>{workflow.template?.steps.length || 0} steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{workflow.performanceMetrics?.totalExecutions || 0} executions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{workflow.performanceMetrics?.successfulExecutions || 0} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{workflow.performanceMetrics?.averageExecutionTime || 'N/A'}</span>
                  </div>
                </div>
                {workflow.template?.tags && workflow.template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {workflow.template.tags.map((tag) => (
                      <Badge key={tag} variant="info" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch space-y-2">
                {workflow.template?.title && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Based on: {workflow.template.title}
                  </p>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Customize Workflow
                </Button>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    disabled={workflow.deploymentStatus === 'completed' || workflow.deploymentStatus === 'failed'}
                    onClick={() => handleWorkflowAction(workflow.id!, workflow.deploymentStatus === 'live' ? 'pause' : 'start')}
                  >
                    {workflow.deploymentStatus === 'live' ? (
                      <Pause className="w-4 h-4 mr-1" />
                    ) : (
                      <Play className="w-4 h-4 mr-1" />
                    )}
                    {workflow.deploymentStatus === 'live' ? 'Pause' : 'Start'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
