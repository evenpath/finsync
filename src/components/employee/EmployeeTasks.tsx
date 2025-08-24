'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/use-auth';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ListTodo, CheckCircle, Play, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { updateTaskStatusAction } from '../../actions/task-actions';
import type { Task } from '../../lib/types';

export default function EmployeeTasks() {
    const { user, loading: authLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
                    } as Task;
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

    const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
        if (!userId) return;

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

    const renderActionButton = (task: Task) => {
        const isUpdating = updatingTaskId === task.id;

        if (isUpdating) {
            return (
                <Button size="sm" disabled>
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
                        onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Task
                    </Button>
                );
            case 'in_progress':
                return (
                    <Button 
                        size="sm" 
                        onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                    </Button>
                );
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </Badge>
                );
            default:
                return null;
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'No due date';
        
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} days`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else {
            return `Due in ${diffDays} days`;
        }
    };

    const getTaskStats = () => {
        return {
            total: tasks.length,
            assigned: tasks.filter(t => t.status === 'assigned').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
        };
    };

    if (authLoading || isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading your tasks...
                </CardContent>
            </Card>
        );
    }

    if (userRole !== 'employee') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Access Restricted
                    </CardTitle>
                    <CardDescription>
                        This feature is only available to employees. Please contact your admin.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (firestoreError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Database Error
                    </CardTitle>
                    <CardDescription className="text-red-600">
                        {firestoreError}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const stats = getTaskStats();

    return (
        <div className="space-y-6">
            {/* Task Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <ListTodo className="w-5 h-5 text-gray-600" />
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
            </div>

            {/* Tasks Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5" />
                        My Tasks
                    </CardTitle>
                    <CardDescription>
                        Your assigned tasks and their current status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No tasks assigned</h3>
                            <p className="text-muted-foreground">
                                You don't have any tasks assigned yet. Check back later or contact your manager.
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{task.title || 'Untitled Task'}</div>
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
                                                <Badge variant={getPriorityBadgeVariant(task.priority || 'medium')}>
                                                    {task.priority || 'medium'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(task.status || 'assigned')}>
                                                    {task.status || 'assigned'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`text-sm ${
                                                    task.dueDate && new Date(task.dueDate) < new Date() 
                                                        ? 'text-red-600 font-medium' 
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {formatDate(task.dueDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {renderActionButton(task)}
                                            </TableCell>
                                        </TableRow>
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