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
  MessageSquare,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { updateTaskStatusAction } from '../../../actions/task-actions';
import { useToast } from '../../../hooks/use-toast';
import type { Task } from '../../../lib/types';

export default function WorkerTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const { toast } = useToast();

  const userId = user?.uid;
  const userRole = user?.customClaims?.role;

  // Fetch tasks assigned to the current user
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!userId || !db || userRole !== 'employee') {
      setIsLoading(false);
      return;
    }

    console.log('Fetching tasks for employee:', userId);
    setIsLoading(true);
    setFirestoreError(null);

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('assignee', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`Found ${snapshot.docs.length} tasks for employee`);
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : null,
            completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : null,
            assignedDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            partnerName: data.partnerName || 'Unknown Partner'
          } as Task & { assignedDate: Date; partnerName: string };
        });

        setTasks(tasksData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching employee tasks:', error);
        setFirestoreError(`Error loading tasks: ${error.message}`);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, authLoading, userRole]);

  const handleTaskAction = async (taskId: string, action: 'start' | 'complete') => {
    if (!userId) return;

    const newStatus = action === 'start' ? 'in_progress' : 'completed';
    setUpdatingTaskId(taskId);
    
    try {
      const result = await updateTaskStatusAction({
        taskId,
        status: newStatus,
        userId
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesPartner = partnerFilter === 'all' || task.partnerId === partnerFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesPartner;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (task: Task & { assignedDate: Date; partnerName: string }) => {
    const isUpdating = updatingTaskId === task.id;

    if (isUpdating) {
      return (
        <Button size="sm" disabled className="w-full">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Updating...
        </Button>
      );
    }

    switch (task.status) {
      case 'assigned':
        return (
          <Button 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={() => handleTaskAction(task.id, 'start')}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Task
          </Button>
        );
      case 'in_progress':
        return (
          <Button 
            size="sm" 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => handleTaskAction(task.id, 'complete')}
          >
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
  const partners = Array.from(new Set(tasks.map(t => ({ 
    id: t.partnerId, 
    name: (t as any).partnerName || 'Unknown Partner' 
  })).map(p => JSON.stringify(p)))).map(p => JSON.parse(p));

  if (!user && !authLoading) {
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

  if (userRole !== 'employee') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h2>
          <p className="text-gray-500">This feature is only available to employees.</p>
        </div>
      </div>
    );
  }

  if (firestoreError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Database Error</h2>
          <p className="text-red-500 max-w-md">{firestoreError}</p>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading your tasks...</span>
          </div>
        ) : (
          <>
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
                    <Play className="w-5 h-5 text-orange-600" />
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
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {partners.length > 1 && (
                    <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder="All Partners" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Partners</SelectItem>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Cards */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                    <p className="text-muted-foreground">
                      {tasks.length === 0 
                        ? "You don't have any tasks assigned yet."
                        : "No tasks match your current filters."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                              {task.description && (
                                <p className="text-muted-foreground mb-3">{task.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className={getStatusColor(task.status || 'assigned')}>
                                  {getStatusIcon(task.status || 'assigned')}
                                  <span className="ml-1 capitalize">{task.status || 'assigned'}</span>
                                </Badge>
                                
                                <Badge className={getPriorityColor(task.priority || 'medium')}>
                                  <span className="capitalize">{task.priority || 'medium'} Priority</span>
                                </Badge>
                                
                                {task.workflow && (
                                  <Badge variant="outline">
                                    <span>{task.workflow}</span>
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Assigned {(task as any).assignedDate.toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {task.dueDate && (
                                  <div className={`flex items-center gap-1 ${
                                    new Date(task.dueDate) < new Date() ? 'text-red-600' : ''
                                  }`}>
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      Due {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{(task as any).partnerName}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:w-48">
                          {getActionButton(task as any)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
      
      <BottomNavigation userRole="employee" />
    </div>
  );
}