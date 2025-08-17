"use client";

import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Plus, Search, Calendar, User, Clock, CheckSquare, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useToast } from '../../hooks/use-toast';
import AssignTaskDialog from './tasks/AssignTaskDialog';

// Mock data for tasks
const mockTasks = [
  {
    id: '1',
    title: 'Client Onboarding Process',
    description: 'Complete onboarding documentation for new client',
    assignee: 'john-doe',
    assigneeName: 'John Doe',
    status: 'completed',
    priority: 'high',
    dueDate: new Date('2024-08-15'),
    workflow: 'Client Management',
    createdAt: new Date('2024-08-10')
  },
  {
    id: '2',
    title: 'Document Review',
    description: 'Review and approve quarterly financial documents',
    assignee: 'sarah-johnson',
    assigneeName: 'Sarah Johnson',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date('2024-08-20'),
    workflow: 'Document Management',
    createdAt: new Date('2024-08-12')
  },
  {
    id: '3',
    title: 'Team Training Session',
    description: 'Conduct weekly team training on new procedures',
    assignee: 'mike-wilson',
    assigneeName: 'Mike Wilson',
    status: 'assigned',
    priority: 'low',
    dueDate: new Date('2024-08-25'),
    workflow: 'Training',
    createdAt: new Date('2024-08-14')
  },
  {
    id: '4',
    title: 'System Maintenance',
    description: 'Perform routine system maintenance and updates',
    assignee: 'emily-davis',
    assigneeName: 'Emily Davis',
    status: 'overdue',
    priority: 'high',
    dueDate: new Date('2024-08-16'),
    workflow: 'IT Operations',
    createdAt: new Date('2024-08-08')
  },
  {
    id: '5',
    title: 'Customer Support Tickets',
    description: 'Resolve pending customer support tickets',
    assignee: 'john-doe',
    assigneeName: 'John Doe',
    status: 'awaiting_approval',
    priority: 'medium',
    dueDate: new Date('2024-08-22'),
    workflow: 'Customer Service',
    createdAt: new Date('2024-08-16')
  }
];

// Mock team members for assignment
const mockTeamMembers = [
  { id: 'john-doe', name: 'John Doe', email: 'john.doe@company.com', role: 'employee' },
  { id: 'sarah-johnson', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'partner_admin' },
  { id: 'mike-wilson', name: 'Mike Wilson', email: 'mike.wilson@company.com', role: 'employee' },
  { id: 'emily-davis', name: 'Emily Davis', email: 'emily.davis@company.com', role: 'employee' }
];

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  status: string;
  priority: string;
  dueDate: Date;
  workflow: string;
  createdAt: Date;
}

export default function TaskBoard() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [teamMembers] = useState(mockTeamMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.workflow.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress': return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'awaiting_approval': return <Badge variant="default" className="bg-orange-100 text-orange-800">In Review</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      case 'assigned':
      default: return <Badge variant="secondary">To Do</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'active') {
      return tasks.filter(t => ['in_progress', 'assigned'].includes(t.status)).length;
    }
    return tasks.filter(t => t.status === status).length;
  };

  const handleDeleteTask = (taskId: string) => {
    toast({
      title: "Task deleted",
      description: "The task has been removed from your workspace."
    });
  };

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{getStatusCount('active')}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{getStatusCount('completed')}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{getStatusCount('overdue')}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Overview ({filteredTasks.length})</CardTitle>
            <Button onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Status</option>
              <option value="assigned">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_approval">In Review</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by assigning your first task to a team member."
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task & Workflow</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.workflow}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {task.assigneeName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm">{task.assigneeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4" />
                          {task.dueDate.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Task Dialog */}
      <AssignTaskDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        teamMembers={teamMembers}
        partnerId="mock-partner-id"
      />
    </div>
  );
}