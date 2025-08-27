"use client";

import React, { useState, useEffect } from 'react';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Search,
  Filter,
  Calendar,
  User,
  MessageSquare,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import EmployeeWorkspaceSwitcher from '../../../components/employee/EmployeeWorkspaceSwitcher';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import { cn } from '../../../lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'awaiting_approval' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedDate: Date;
  workflow?: string;
  currentStep?: string;
  partnerId: string;
  partnerName: string;
  assignedBy?: string;
}

// Mock tasks data - replace with real Firebase data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review website mockups',
    description: 'Review the new website design mockups and provide feedback on user experience and visual design',
    status: 'assigned',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    assignedDate: new Date(Date.now() - 1000 * 60 * 30),
    workflow: 'Design Review',
    currentStep: 'Initial Review',
    partnerId: '1',
    partnerName: 'Acme Corp',
    assignedBy: 'Sarah Chen'
  },
  {
    id: '2',
    title: 'Update product documentation',
    description: 'Update the user guide with new features from the latest release',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    assignedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    workflow: 'Content Creation',
    currentStep: 'Draft',
    partnerId: '1',
    partnerName: 'Acme Corp',
    assignedBy: 'Mike Johnson'
  },
  {
    id: '3',
    title: 'Prepare quarterly report',
    description: 'Compile data and prepare the Q4 performance report',
    status: 'completed',
    priority: 'high',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    assignedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    partnerId: '2',
    partnerName: 'TechStart Inc',
    assignedBy: 'David Wilson'
  },
  {
    id: '4',
    title: 'Test mobile app features',
    description: 'Perform comprehensive testing of the new mobile app features',
    status: 'awaiting_approval',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    assignedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    workflow: 'Development Task',
    currentStep: 'Review',
    partnerId: '2',
    partnerName: 'TechStart Inc',
    assignedBy: 'Emma Davis'
  },
  {
    id: '5',
    title: 'Client meeting preparation',
    description: 'Prepare presentation materials for upcoming client meeting',
    status: 'overdue',
    priority: 'high',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    assignedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    workflow: 'Client Relations',
    partnerId: '1',
    partnerName: 'Acme Corp',
    assignedBy: 'Sarah Chen'
  }
];

export default function EmployeeTasksPage() {
  const { user, loading, currentWorkspace, availableWorkspaces, switchWorkspace } = useMultiWorkspaceAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_approval':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.workflow?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTasksByStatus = (status: string) => {
    return status === 'all' 
      ? filteredTasks 
      : filteredTasks.filter(task => task.status === status);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Workspace Selected</h2>
          <p className="text-gray-500">Please select a workspace to view your tasks.</p>
        </div>
      </div>
    );
  }

  const taskStats = {
    total: filteredTasks.length,
    assigned: filteredTasks.filter(t => t.status === 'assigned').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    overdue: filteredTasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <div className="border-b bg-background">
        <EmployeeWorkspaceSwitcher
          workspaces={availableWorkspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSwitch={switchWorkspace}
        />
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Tasks</h1>
          <p className="text-muted-foreground">Manage your assignments and track progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
              <div className="text-sm text-blue-700">Total Tasks</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.assigned}</div>
              <div className="text-sm text-yellow-700">Assigned</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{taskStats.inProgress}</div>
              <div className="text-sm text-purple-700">In Progress</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-green-700">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
              <div className="text-sm text-red-700">Overdue</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_approval">Awaiting Approval</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({taskStats.total})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({taskStats.assigned})</TabsTrigger>
            <TabsTrigger value="in_progress">Active ({taskStats.inProgress})</TabsTrigger>
            <TabsTrigger value="awaiting_approval">Review ({filteredTasks.filter(t => t.status === 'awaiting_approval').length})</TabsTrigger>
            <TabsTrigger value="completed">Done ({taskStats.completed})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({taskStats.overdue})</TabsTrigger>
          </TabsList>

          {['all', 'assigned', 'in_progress', 'awaiting_approval', 'completed', 'overdue'].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="space-y-4">
                {getTasksByStatus(status === 'all' ? 'all' : status).length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                      <p className="text-muted-foreground">
                        {status === 'all' ? 'You have no tasks assigned yet.' : `No ${status.replace('_', ' ')} tasks.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  getTasksByStatus(status === 'all' ? 'all' : status).map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
                              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {task.partnerName}
                              </div>
                              
                              {task.workflow && (
                                <div className="flex items-center gap-1">
                                  <CheckSquare className="w-4 h-4" />
                                  {task.workflow}
                                </div>
                              )}
                              
                              {task.assignedBy && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {task.assignedBy}
                                </div>
                              )}
                              
                              {task.dueDate && (
                                <div className={cn(
                                  "flex items-center gap-1",
                                  task.status === 'overdue' ? 'text-red-600' : ''
                                )}>
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(task.dueDate)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={cn("text-xs", getStatusColor(task.status))}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <CheckSquare className="w-4 h-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Discuss Task
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Clock className="w-4 h-4 mr-2" />
                                  Request Extension
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <User className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <BottomNavigation userRole="employee" />
    </div>
  );
}