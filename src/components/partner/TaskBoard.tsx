// src/components/partner/TaskBoard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Plus, Loader2, Trash2 } from 'lucide-react';
import type { Task, TeamMember } from '../../lib/types';
import AssignTaskDialog from './tasks/AssignTaskDialog';
import { useAuth } from '../../hooks/use-auth';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import Image from 'next/image';
import { deleteTaskAction } from '../../actions/task-actions';
import { useToast } from '../../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"

const TaskRow = ({ task, teamMembers, onDelete }: { task: Task & { id: string }, teamMembers: TeamMember[], onDelete: (taskId: string) => void }) => {
    const assignee = teamMembers.find(m => m.id === task.assignee);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge variant="success">Completed</Badge>;
            case 'in_progress': return <Badge variant="info">In Progress</Badge>;
            case 'awaiting_approval': return <Badge variant="warning">In Review</Badge>;
            case 'assigned':
            default:
                return <Badge variant="secondary">To Do</Badge>;
        }
    };
    
    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return <Badge variant="danger">High</Badge>;
            case 'medium': return <Badge variant="warning">Medium</Badge>;
            case 'low':
            default:
                return <Badge variant="info">Low</Badge>;
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground">{task.workflow}</div>
            </TableCell>
            <TableCell>
                {assignee ? (
                    <div className="flex items-center gap-2">
                        <Image src={assignee.avatar} alt={assignee.name} width={24} height={24} className="rounded-full" data-ai-hint="person user" />
                        <span>{assignee.name}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                )}
            </TableCell>
            <TableCell>{getStatusBadge(task.status)}</TableCell>
            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
            <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</TableCell>
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
    const [tasks, setTasks] = useState<(Task & { id: string })[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const partnerId = user?.customClaims?.partnerId;

    useEffect(() => {
        if (!partnerId) {
            setIsLoading(false);
            return;
        }

        // Listen to tasks for this partner
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('partnerId', '==', partnerId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as (Task & { id: string })[];
            setTasks(fetchedTasks);
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setIsLoading(false);
        });

        // Listen to team members for this partner
        const teamQuery = query(
            collection(db, 'teamMembers'),
            where('partnerId', '==', partnerId)
        );

        const unsubscribeTeam = onSnapshot(teamQuery, (snapshot) => {
            const fetchedMembers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TeamMember[];
            setTeamMembers(fetchedMembers);
        }, (error) => {
            console.error('Error fetching team members:', error);
        });

        return () => {
            unsubscribeTasks();
            unsubscribeTeam();
        };
    }, [partnerId]);

    const handleDeleteTask = async (taskId: string) => {
        try {
            const result = await deleteTaskAction(taskId);
            if (result.success) {
                toast({
                    title: "Task Deleted",
                    description: "The task has been successfully deleted."
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Delete Failed",
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Task Overview</h2>
                    <p className="text-muted-foreground">Manage and track all tasks across your workflows</p>
                </div>
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign New Task
                </Button>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                    <p className="text-muted-foreground mb-4">Get started by assigning your first task to a team member.</p>
                    <Button onClick={() => setIsAssignDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Assign First Task
                    </Button>
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
                            {tasks.map((task) => (
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

            <AssignTaskDialog
                isOpen={isAssignDialogOpen}
                onClose={() => setIsAssignDialogOpen(false)}
                teamMembers={teamMembers}
                partnerId={partnerId || ''}
            />
        </div>
    );
}