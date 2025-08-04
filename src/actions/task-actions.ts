// src/actions/task-actions.ts
'use server';

import { db } from '@/lib/firebase-admin';
import type { Task } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

interface CreateTaskInput {
    title: string;
    description?: string;
    workflow: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee: string; // The user ID of the team member
    partnerId: string;
    status: 'assigned';
}

interface CreateTaskResult {
    success: boolean;
    message: string;
    task?: Task;
}

export async function createTaskAction(input: CreateTaskInput): Promise<CreateTaskResult> {
    if (!db) {
        return { success: false, message: 'Database not available.' };
    }

    try {
        const taskRef = db.collection('tasks').doc();
        
        const newTask: Omit<Task, 'id'> = {
            ...input,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        await taskRef.set(newTask);
        
        const taskData = { id: taskRef.id, ...newTask } as Task;

        return {
            success: true,
            message: 'Task created successfully.',
            task: taskData,
        };

    } catch (error: any) {
        console.error('Error creating task:', error);
        return {
            success: false,
            message: `Failed to create task: ${error.message}`,
        };
    }
}
