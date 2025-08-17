// src/components/partner/TaskBoard.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../shared/Badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import {
  Download,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Trash2,
  Edit2,
  Filter,
  UserCheck,
  Calendar,
} from "lucide-react";
import type { Task, TeamMember } from "../../lib/types";
import { useToast } from "../../hooks/use-toast";
import { useMultiWorkspaceAuth } from "../../hooks/use-multi-workspace-auth";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { deleteTaskAction } from "../../actions/task-actions";

interface TaskWithId extends Task {
  id: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    assigned: { color: "blue", label: "Assigned" },
    in_progress: { color: "yellow", label: "In Progress" },
    awaiting_approval: { color: "purple", label: "Awaiting Approval" },
    completed: { color: "green", label: "Completed" }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || { color: "gray", label: status };
  
  return (
    <Badge variant="outline" className={`bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`}>
      {config.label}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  const priorityConfig = {
    high: { color: "red", label: "High" },
    medium: { color: "yellow", label: "Medium" },
    low: { color: "green", label: "Low" }
  };
  
  const config = priorityConfig[priority as keyof typeof priorityConfig] || { color: "gray", label: priority };
  
  return (
    <Badge variant="outline" className={`bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`}>
      {config.label}
    </Badge>
  );
};

const TaskRow = ({ task, teamMembers, onDelete }: { 
  task: TaskWithId; 
  teamMembers: TeamMember[]; 
  onDelete: (id: string) => void;
}) => {
  const assignee = teamMembers.find(member => member.id === task.assigneeId || member.name === task.assignee);
  
  return (
    <TableRow>
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell className="max-w-xs">
        <div className="truncate" title={task.workflow}>
          {task.workflow}
        </div>
      </TableCell>
      <TableCell>
        {assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {assignee.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{assignee.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )}
      </TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
      <TableCell>
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(task.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

export default function TaskBoard() {
  const { user, loading: authLoading } = useMultiWorkspaceAuth();
  const [tasks, setTasks] = useState<TaskWithId[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const partnerId = user?.customClaims?.activePartnerId;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.workflow?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

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

    // Fetch tasks
    const tasksQuery = query(
      collection(db, "tasks"),
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate
      } as TaskWithId));
      
      setTasks(tasksData);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks. Please check your permissions.");
    });

    // Fetch team members
    const teamQuery = query(
      collection(db, "teamMembers"),
      where("partnerId", "==", partnerId)
    );

    const unsubscribeTeam = onSnapshot(teamQuery, (snapshot) => {
      const teamData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamMember));
      
      setTeamMembers(teamData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching team members:", error);
      setError("Failed to fetch team members. Please check your permissions.");
      setIsLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeTeam();
    };
  }, [partnerId, authLoading]);

  const handleDeleteTask = async (taskId: string) => {
    if (!partnerId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No organization found"
      });
      return;
    }

    try {
      const result = await deleteTaskAction(taskId, partnerId);
      
      if (result.success) {
        toast({
          title: "Task deleted",
          description: "The task has been removed from your workspace."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task. Please try again."
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load tasks</h3>
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
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Task Overview</h2>
          <p className="text-muted-foreground">Manage and track all tasks across your workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAssignDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assign New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "Try adjusting your filters to see more tasks."
                  : "Create your first task to get started with workflow management."
                }
              </p>
              <Button onClick={() => setIsAssignDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign New Task
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TaskRow 
                      key={task.id} 
                      task={task} 
                      teamMembers={teamMembers}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}