// src/components/partner/TaskBoard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from 'lucide-react';
import type { Task, TeamMember } from '@/lib/types';
import AssignTaskDialog from './tasks/AssignTaskDialog';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';

const TaskRow = ({ task, teamMembers }: { task: Task & { id: string }, teamMembers: TeamMember[] }) => {
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
            <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
        </TableRow>
    );
};

export default function TaskBoard() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const partnerId = user?.customClaims?.partnerId;

    useEffect(() => {
        if (!partnerId) {
            setIsLoading(false);
            return;
        }

        const taskQuery = query(collection(db, 'tasks'), where('partnerId', '==', partnerId), orderBy('createdAt', 'desc'));
        const memberQuery = query(collection(db, 'teamMembers'), where('partnerId', '==', partnerId));
        
        const unsubscribeTasks = onSnapshot(taskQuery, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamps to serializable strings
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
                };
            });
            setTasks(fetchedTasks);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            setIsLoading(false);
        });
        
        const unsubscribeMembers = onSnapshot(memberQuery, (snapshot) => {
            const fetchedMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
            setTeamMembers(fetchedMembers);
        });

        return () => {
            unsubscribeTasks();
            unsubscribeMembers();
        };

    }, [partnerId]);
    

    const handleTaskCreated = (newTask: Task) => {
        // The Firestore listener will automatically add the new task,
        // so we don't need to manually update state here.
        console.log("New task created:", newTask);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-1 pb-4 flex items-center justify-between">
                <div />
                <AssignTaskDialog onTaskCreated={handleTaskCreated}>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </AssignTaskDialog>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Due Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No tasks found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                           tasks.map(task => (
                                <TaskRow key={task.id} task={task} teamMembers={teamMembers} />
                           ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
