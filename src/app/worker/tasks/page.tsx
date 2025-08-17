"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui/select';
import {
  CheckSquare,
  Clock,
  User,
  Search,
  Filter,
  Calendar,
  Play,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import BottomNavigation from '../../../components/navigation/BottomNavigation';

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
}

// Mock tasks - replace with real data from Firebase/API
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review website mockups',
    description: 'Review the new website design mockups and provide feedback',
    status: 'assigned',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    assignedDate: new Date(Date.now() - 1000 * 60 * 30),
    workflow: 'Design Review',
    currentStep: 'Initial Review',
    partnerId: '1',
    partnerName: 'Acme Corp'
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
    partnerName: 'Acme Corp'
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
    partnerName: 'TechStart Inc'
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
    partnerName: 'TechStart Inc'
  }
];

export default function WorkerTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    if (partnerFilter !== 'all' && task.partnerId !== partnerFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'awaiting_approval':
        return <Badge className="bg-orange-100 text-orange-800">Awaiting Approval</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'assigned':
      default:
        return <Badge variant="secondary">Assigned</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'awaiting_approval':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <CheckSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleTaskAction = (taskId: string, action: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        switch (action) {
          case 'start':
            return { ...task, status: 'in_progress' as const };
          case 'complete':
            return { ...task, status: 'awaiting_approval' as const };
          default:
            return task;
        }
      }
      return task;
    }));
  };

  const getTaskActions = (task: Task) => {
    switch (task.status) {
      case 'assigned':
        return (
          <Button size="sm" onClick={() => handleTaskAction(task.id, 'start')}>
            <Play className="w-4 h-4 mr-2" />
            Start Task
          </Button>
        );
      case 'in_progress':
        return (
          <Button size="sm" onClick={() => handleTaskAction(task.id, 'complete')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        );
      default:
        return null;
    }
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      assigned: tasks.filter(t => t.status === 'assigned').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length
    };
    return stats;
  };

  const stats = getTaskStats();
  const partners = Array.from(new Set(tasks.map(t => ({ id: t.partnerId, name: t.partnerName }))));

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please log in to view your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Tasks</h1>
          <p className="text-muted-foreground">Manage and track your assigned tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.assigned}</p>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workspaces</SelectItem>
                  {partners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setPartnerFilter('all');
              }}>
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search or filters' : 'No tasks have been assigned to you yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(task.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.partnerName}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        {task.workflow && (
                          <div className="flex items-center gap-1">
                            <CheckSquare className="w-4 h-4" />
                            <span>{task.workflow}</span>
                            {task.currentStep && <span>• {task.currentStep}</span>}
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {task.dueDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTaskActions(task)}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                              View Assigner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <BottomNavigation userRole="employee" />
    </div>
  );
}
