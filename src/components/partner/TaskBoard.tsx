"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Plus, Search, Calendar, Clock, CheckSquare, AlertTriangle, Loader2, ListTodo, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
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
  const { toast } = useToast();

  // Get partner info from user's custom claims
  const partnerId = user?.customClaims?.partnerId;
  const tenantId = user?.customClaims?.tenantId;
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

  // Fetch team members
  useEffect(() => {
    if (!partnerId || !db || authLoading) return;

    const teamMembersRef = collection(db, "teamMembers");
    const q = query(
      teamMembersRef,
      where("partnerId", "==", partnerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as TeamMember));
      
      setTeamMembers(membersData);
    }, (error) => {
      console.error("Error fetching team members:", error);
    });

    return () => unsubscribe();
  }, [partnerId, authLoading]);

  // Fetch tasks
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!partnerId || !db) {
      setFirestoreError(`Missing required data:
        - Partner ID: ${partnerId || 'MISSING'}
        - Database: ${db ? 'Connected' : 'NOT CONNECTED'}
        - User Email: ${user?.email || 'No email'}`);
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Found ${snapshot.docs.length} tasks`);
      const tasksData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : null,
        } as Task;
      });
      
      setTasks(tasksData);
      setFirestoreError(null);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setFirestoreError(`Failed to fetch tasks: ${error.message}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [partnerId, authLoading, user]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!partnerId) return;

    const result = await deleteTaskAction({ taskId, partnerId });
    if (result.success) {
      toast({
        title: "Task Deleted",
        description: result.message
      });
    } else {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: result.message
      });
    }
  };

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

  if (firestoreError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-destructive">Database Connection Error</h3>
          <pre className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto text-left bg-muted p-4 rounded whitespace-pre-wrap">
            {firestoreError}
          </pre>
          <Button onClick={() => window.location.reload()}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks ({tasks.length} total, {filteredTasks.length} shown)</CardTitle>
            {userRole === 'partner_admin' && (
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
            )}
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

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-24 h-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by assigning the first task to your team members.
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
                          <span className="text-sm">{task.assigneeName || 'Unassigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No due date</span>
                        )}
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
                                className="text-red-600 focus:bg-red-50"
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
      <AssignTaskDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        teamMembers={teamMembers}
        partnerId={partnerId!}
      />

      <EditTaskDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={editingTask}
        teamMembers={teamMembers}
        partnerId={partnerId!}
      />
    </div>
  );
}