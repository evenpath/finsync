"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Plus, Search, Calendar, Clock, CheckSquare, AlertTriangle, Loader2, ListTodo, Edit, Trash2, MoreVertical, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/use-auth';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Task, TeamMember } from '../../lib/types';
import AssignTaskDialog from './tasks/AssignTaskDialog';
import EditTaskDialog from './tasks/EditTaskDialog';
import { deleteTaskAction } from '../../actions/task-actions';

export default function TaskBoard() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [connectionRetry, setConnectionRetry] = useState(0);
  const { toast } = useToast();

  // Get partner info from user's custom claims
  const partnerId = user?.customClaims?.partnerId || user?.customClaims?.activePartnerId;
  const tenantId = user?.customClaims?.tenantId || user?.customClaims?.activeTenantId;
  const userRole = user?.customClaims?.role;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.workflow?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  // Retry connection function
  const retryConnection = () => {
    setConnectionRetry(prev => prev + 1);
    setFirestoreError(null);
    setIsLoading(true);
  };

  // Fetch team members with enhanced error handling
  useEffect(() => {
    if (!partnerId || !db || authLoading) {
      return;
    }

    console.log('Fetching team members for partner:', partnerId);

    const teamMembersRef = collection(db, "teamMembers");
    const q = query(
      teamMembersRef,
      where("partnerId", "==", partnerId),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log(`Found ${snapshot.docs.length} team members`);
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as TeamMember));
        
        setTeamMembers(membersData);
        console.log('Team members loaded successfully');
      }, 
      (error) => {
        console.error("Error fetching team members:", error);
        // Don't set this as a critical error since tasks can still work
        toast({
          title: "Warning",
          description: "Could not load team members. Some features may be limited.",
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [partnerId, authLoading, connectionRetry]);

  // Fetch tasks with enhanced error handling and connection retry
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!partnerId || !db) {
      const errorMessage = `Database connection issue:
        - Partner ID: ${partnerId || 'MISSING'}
        - Database: ${db ? 'Connected' : 'NOT CONNECTED'}
        - User Email: ${user?.email || 'No email'}
        - User Role: ${userRole || 'No role'}`;
      
      console.error('Task loading failed:', errorMessage);
      setFirestoreError(errorMessage);
      setIsLoading(false);
      return;
    }

    console.log('Fetching tasks for partner:', partnerId);
    setIsLoading(true);
    setFirestoreError(null);
    
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log(`Found ${snapshot.docs.length} tasks`);
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : null,
            completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : null,
          } as Task;
        });
        
        setTasks(tasksData);
        setIsLoading(false);
        setConnectionRetry(0); // Reset retry counter on success
        console.log('Tasks loaded successfully');
      }, 
      (error) => {
        console.error("Error fetching tasks:", error);
        
        let errorMessage = `Failed to load tasks: ${error.message}`;
        
        // Provide specific error messages for common issues
        if (error.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please check your access rights or contact support.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Database temporarily unavailable. Please try again.';
        } else if (error.code === 'failed-precondition') {
          errorMessage = 'Database query failed. This might be due to missing indexes.';
        }
        
        setFirestoreError(errorMessage);
        setIsLoading(false);
        
        // Auto-retry for transient errors
        if (['unavailable', 'deadline-exceeded'].includes(error.code) && connectionRetry < 3) {
          console.log(`Auto-retrying connection (${connectionRetry + 1}/3)...`);
          setTimeout(() => {
            setConnectionRetry(prev => prev + 1);
          }, 2000 * (connectionRetry + 1)); // Exponential backoff
        }
      }
    );

    return () => unsubscribe();
  }, [partnerId, authLoading, connectionRetry, user?.email, userRole]);

  const handleDeleteTask = async (taskId: string) => {
    if (!partnerId) return;

    try {
      const result = await deleteTaskAction({ taskId, partnerId });
      
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
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'assigned':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  if (authLoading || isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading tasks...
        </CardContent>
      </Card>
    );
  }

  if (firestoreError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Database Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 whitespace-pre-line">
                {firestoreError}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={retryConnection}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Troubleshooting Steps:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check your internet connection</li>
                <li>Verify you're logged in with the correct account</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
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
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
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
          
          {userRole === 'partner_admin' && teamMembers.length > 0 && (
            <Button onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Task
            </Button>
          )}
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'assigned').length}
                </p>
                <p className="text-sm text-muted-foreground">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Created</h3>
              <p className="text-muted-foreground mb-4">
                Get started by assigning the first task to your team.
              </p>
              {userRole === 'partner_admin' && teamMembers.length > 0 && (
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign First Task
                </Button>
              )}
              {teamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Add team members first to assign tasks.
                </p>
              )}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Matching Tasks</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Details</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    {userRole === 'partner_admin' && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground mt-1 max-w-xs">
                              {task.description}
                            </div>
                          )}
                          {task.workflow && (
                            <div className="text-xs text-blue-600 mt-1">{task.workflow}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {task.assigneeName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{task.assigneeName || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{task.assigneeEmail || ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(task.status || 'assigned')}>
                          {task.status || 'assigned'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(task.priority || 'medium')}>
                          {task.priority || 'medium'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(task.dueDate)}</div>
                      </TableCell>
                      {userRole === 'partner_admin' && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {partnerId && (
        <>
          <AssignTaskDialog
            isOpen={isAssignDialogOpen}
            onClose={() => setIsAssignDialogOpen(false)}
            teamMembers={teamMembers}
            partnerId={partnerId}
          />
          
          <EditTaskDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingTask(null);
            }}
            task={editingTask}
            teamMembers={teamMembers}
            partnerId={partnerId}
          />
        </>
      )}
    </div>
  );
}