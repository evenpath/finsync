// src/components/partner/tasks/AssignTaskDialog.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useToast } from '../../../hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import type { TeamMember } from '../../../lib/types';
import { createTaskAction } from '../../../actions/task-actions';

interface AssignTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  partnerId: string;
}

export default function AssignTaskDialog({
  isOpen,
  onClose,
  teamMembers,
  partnerId
}: AssignTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [workflow, setWorkflow] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createTaskAction({
        title,
        description,
        assignee,
        priority,
        dueDate,
        workflow,
        partnerId,
        status: 'assigned', // Default status for new tasks
      });
      
      if(result.success) {
          const assignedMember = teamMembers.find(member => member.id === assignee);
          toast({
            title: 'Task Assigned',
            description: `Task "${title}" has been assigned to ${assignedMember?.name || 'team member'}.`
          });
          resetAndClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to assign task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setAssignee('');
    setPriority('medium');
    setDueDate('');
    setWorkflow('');
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetAndClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Assign New Task
          </DialogTitle>
          <DialogDescription>
            Create and assign a new task to a team member.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the task details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To *</Label>
                <Select value={assignee} onValueChange={setAssignee} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow">Workflow</Label>
                <Input
                  id="workflow"
                  placeholder="e.g., Client Management"
                  value={workflow}
                  onChange={(e) => setWorkflow(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !assignee}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
