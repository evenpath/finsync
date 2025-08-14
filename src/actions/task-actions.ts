// src/actions/task-actions.ts
'use server';

import { db } from '@/lib/firebase-admin';
import type { Task } from '../../lib/types';
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
        
        const newTaskData = {
            ...input,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        await taskRef.set(newTaskData);
        
        // After creation, we create a serializable object to return to the client.
        // new Date() is a good approximation for the server timestamp for immediate client-side use.
        const taskForClient: Task = {
            id: taskRef.id,
            ...input,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return {
            success: true,
            message: 'Task created successfully.',
            task: taskForClient,
        };

    } catch (error: any) {
        console.error('Error creating task:', error);
        return {
            success: false,
            message: `Failed to create task: ${error.message}`,
        };
    }
}

/**
 * Deletes a task from Firestore.
 */
export async function deleteTaskAction(taskId: string): Promise<{ success: boolean; message: string }> {
    if (!db) {
        return { success: false, message: 'Database not available.' };
    }
    if (!taskId) {
        return { success: false, message: 'Task ID is required.' };
    }

    try {
        await db.collection('tasks').doc(taskId).delete();
        return { success: true, message: 'Task deleted successfully.' };
    } catch (error: any) {
        console.error('Error deleting task:', error);
        return { success: false, message: `Failed to delete task: ${error.message}` };
    }
}
