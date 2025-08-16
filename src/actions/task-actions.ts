// src/actions/task-actions.ts
'use server';

import { db } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Task } from '../lib/types';

/**
 * Create a new task
 */
export async function createTaskAction(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
  success: boolean;
  message: string;
  task?: Task & { id: string };
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const taskRef = db.collection('tasks').doc();
    const now = FieldValue.serverTimestamp();
    
    const newTask = {
      ...taskData,
      createdAt: now,
      updatedAt: now,
      status: taskData.status || 'assigned'
    };

    await taskRef.set(newTask);

    return {
      success: true,
      message: 'Task created successfully',
      task: {
        id: taskRef.id,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: taskData.status || 'assigned'
      }
    };

  } catch (error: any) {
    console.error('Error creating task:', error);
    return {
      success: false,
      message: `Failed to create task: ${error.message}`
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTaskAction(taskId: string, partnerId: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!db) {
    return {
      success: false,
      message: 'Database not available'
    };
  }

  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return {
        success: false,
        message: 'Task not found'
      };
    }

    const taskData = taskDoc.data();
    
    // Verify the task belongs to this partner
    if (taskData?.partnerId !== partnerId) {
      return {
        success: false,
        message: 'You do not have permission to delete this task'
      };
    }

    await taskRef.delete();

    return {
      success: true,
      message: 'Task deleted successfully'
    };

  } catch (error: any) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      message: `Failed to delete task: ${error.message}`
    };
  }
}