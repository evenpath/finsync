// src/components/employee/EmployeeTasks.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Task } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Loader2, ListTodo } from 'lucide-react';

export default function EmployeeTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const partnerId = user?.customClaims?.activePartnerId;
    const userId = user?.uid;

    useEffect(() => {
        if (!partnerId || !userId) {
            setIsLoading(false);
            return;
        }

        const taskQuery = query(
            collection(db, 'tasks'),
            where('partnerId', '==', partnerId),
            where('assignee', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(taskQuery, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamps to ISO strings
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
                };
            });
            setTasks(fetchedTasks);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching employee tasks:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [partnerId, userId]);

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
        <Card>
            <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>All tasks assigned to you in this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        <ListTodo className="mx-auto h-8 w-8 mb-2" />
                                        You have no assigned tasks.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task: Task) => (
                                    <TableRow key={task.id}>
                                        <TableCell>
                                            <div className="font-medium">{task.title}</div>
                                            <div className="text-sm text-muted-foreground">{task.workflow}</div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                        <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
