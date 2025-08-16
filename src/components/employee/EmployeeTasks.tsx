// src/components/employee/EmployeeTasks.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
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
                    dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : null,
                };
            });
            setTasks(fetchedTasks);
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [partnerId, userId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading your tasks...</span>
            </div>
        );
    }

    if (!partnerId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5" />
                        Tasks
                    </CardTitle>
                    <CardDescription>
                        No workspace found. Please contact your admin.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Workflow</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">
                                            {task.title || 'Untitled Task'}
                                        </TableCell>
                                        <TableCell>{task.workflow || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                task.priority === 'high' ? 'destructive' :
                                                task.priority === 'medium' ? 'default' : 'secondary'
                                            }>
                                                {task.priority || 'medium'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                task.status === 'completed' ? 'default' :
                                                task.status === 'in_progress' ? 'secondary' : 'outline'
                                            }>
                                                {task.status || 'assigned'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}