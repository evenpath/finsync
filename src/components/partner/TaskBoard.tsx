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

const columns = [
    { id: 'assigned', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'awaiting_approval', title: 'In Review' },
    { id: 'completed', title: 'Done' }
];

const TaskCard = ({ task }: { task: Task & { avatar?: string } }) => {
    return (
        <Card className="mb-4 p-4 hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing">
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

const TaskColumn = ({ title, tasks }: { title: string, tasks: any[] }) => {
    return (
        <div className="w-80 bg-secondary/50 rounded-lg p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{tasks.length}</span>
            </div>
            <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto">
                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
            <Button variant="ghost" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
            </Button>
        </div>
    );
};

export default function TaskBoard() {
    const [tasks, setTasks] = useState(mockTasks);

    return (
        <div className="p-6">
            <div className="flex space-x-6">
                {columns.map(column => (
                    <TaskColumn
                        key={column.id}
                        title={column.title}
                        tasks={tasks.filter(task => task.status === column.id)}
                    />
                ))}
            </div>
        </div>
    );
}
