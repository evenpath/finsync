// src/components/partner/TaskBoard.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import Image from "next/image";
import { Plus, Clock } from 'lucide-react';
import { mockTasks, mockTeamMembers } from '@/lib/mockData';
import type { Task } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import AssignTaskDialog from './tasks/AssignTaskDialog';

const columns = [
    { id: 'assigned', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'awaiting_approval', title: 'In Review', color: 'bg-yellow-500' },
    { id: 'completed', title: 'Done', color: 'bg-green-500' }
];

const TaskCard = ({ task }: { task: Task & { avatar?: string } }) => {
    return (
        <Card className="mb-4 p-4 bg-card hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
            <CardContent className="p-0">
                <p className="font-semibold text-foreground mb-2">{task.title}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    {task.assignee && (
                        <Image 
                          src={mockTeamMembers.find(m => m.name === task.assignee)?.avatar || "https://placehold.co/32x32.png"} 
                          alt={task.assignee} 
                          width={24} 
                          height={24} 
                          className="rounded-full"
                          data-ai-hint="person user"
                        />
                    )}
                </div>
                 <div className="mt-2">
                    <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}>
                        {task.priority}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

const TaskColumn = ({ title, tasks, totalTasks, color }: { title: string, tasks: any[], totalTasks: number, color: string }) => {
    const progress = totalTasks > 0 ? (tasks.length / totalTasks) * 100 : 0;

    return (
        <div className="w-80 bg-secondary/50 rounded-lg p-2 flex-shrink-0 flex flex-col">
            <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{tasks.length}</span>
                </div>
                <Progress value={progress} className="h-1" />
            </div>
            <div className="space-y-4 h-full overflow-y-auto p-2">
                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
        </div>
    );
};

export default function TaskBoard() {
    const [tasks, setTasks] = useState(mockTasks);
    const totalTasks = tasks.length;
    const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

    const handleTaskCreated = (newTask: Task) => {
        // In a real app, this would be handled by the Firestore listener
        // For mock data, we just add it to the local state
        setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
        setIsAssignTaskOpen(false);
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
            <div className="flex space-x-6 flex-1 overflow-x-auto">
                {columns.map(column => (
                    <TaskColumn
                        key={column.id}
                        title={column.title}
                        tasks={tasks.filter(task => task.status === column.id)}
                        totalTasks={totalTasks}
                        color={column.color}
                    />
                ))}
            </div>
        </div>
    );
}
