// src/actions/task-actions.ts
'use server';

import { db } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Task } from '../lib/types';

export async function createTaskAction(input: {
  title: string;
  description?: string;
  assignee: string; // Team member ID
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  workflow?: string;
  partnerId: string;
  status?: string;
}): Promise<{ success: boolean; message: string; taskId?: string }> {
  
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  if (!input.title || !input.assignee || !input.partnerId) {
    return {
      success: false,
      message: "Title, assignee, and partner ID are required"
    };
  }

  try {
    console.log('Creating task:', input);

    // Get assignee details from teamMembers collection
    const teamMemberRef = db.collection('teamMembers').doc(input.assignee);
    const teamMemberDoc = await teamMemberRef.get();
    
    if (!teamMemberDoc.exists) {
      return {
        success: false,
        message: "Assigned team member not found"
      };
    }

    const teamMemberData = teamMemberDoc.data();

    // Create task document
    const taskData = {
      title: input.title,
      description: input.description || '',
      assignee: input.assignee,
      assigneeName: teamMemberData?.name || 'Unknown',
      assigneeEmail: teamMemberData?.email || '',
      priority: input.priority,
      status: input.status || 'assigned',
      workflow: input.workflow || '',
      partnerId: input.partnerId,
      tenantId: teamMemberData?.tenantId, // FIX: Correctly get tenantId from the team member
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const taskRef = await db.collection('tasks').add(taskData);
    console.log('Task created with ID:', taskRef.id);

    return {
      success: true,
      message: "Task assigned successfully",
      taskId: taskRef.id
    };

  } catch (error: any) {
    console.error('Error creating task:', error);
    return {
      success: false,
      message: `Failed to create task: ${error.message}`
    };
  }
}

export async function updateTaskAction(input: {
  taskId: string;
  title?: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  dueDate?: string;
  workflow?: string;
  partnerId: string;
}): Promise<{ success: boolean; message: string }> {
  
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  if (!input.taskId || !input.partnerId) {
    return {
      success: false,
      message: "Task ID and partner ID are required"
    };
  }

  try {
    console.log('Updating task:', input);

    const taskRef = db.collection('tasks').doc(input.taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return {
        success: false,
        message: "Task not found"
      };
    }

    // Verify the task belongs to this partner
    const taskData = taskDoc.data();
    if (taskData?.partnerId !== input.partnerId) {
      return {
        success: false,
        message: "You don't have permission to update this task"
      };
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Only update provided fields
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.workflow !== undefined) updateData.workflow = input.workflow;
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    // If assignee is being changed, update assignee details
    if (input.assignee !== undefined && input.assignee !== taskData?.assignee) {
      const teamMemberRef = db.collection('teamMembers').doc(input.assignee);
      const teamMemberDoc = await teamMemberRef.get();
      
      if (teamMemberDoc.exists) {
        const teamMemberData = teamMemberDoc.data();
        updateData.assignee = input.assignee;
        updateData.assigneeName = teamMemberData?.name || 'Unknown';
        updateData.assigneeEmail = teamMemberData?.email || '';
      }
    }

    await taskRef.update(updateData);
    console.log('Task updated successfully');

    return {
      success: true,
      message: "Task updated successfully"
    };

  } catch (error: any) {
    console.error('Error updating task:', error);
    return {
      success: false,
      message: `Failed to update task: ${error.message}`
    };
  }
}

export async function deleteTaskAction(input: {
  taskId: string;
  partnerId: string;
}): Promise<{ success: boolean; message: string }> {
  
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  try {
    const taskRef = db.collection('tasks').doc(input.taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return {
        success: false,
        message: "Task not found"
      };
    }

    // Verify the task belongs to this partner
    const taskData = taskDoc.data();
    if (taskData?.partnerId !== input.partnerId) {
      return {
        success: false,
        message: "You don't have permission to delete this task"
      };
    }

    await taskRef.delete();
    console.log('Task deleted successfully');

    return {
      success: true,
      message: "Task deleted successfully"
    };

  } catch (error: any) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      message: `Failed to delete task: ${error.message}`
    };
  }
}
