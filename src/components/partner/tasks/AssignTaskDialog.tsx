// src/components/partner/tasks/AssignTaskDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Task, TeamMember } from '@/lib/types';
import { createTaskAction } from '@/actions/task-actions';
import { Loader2, ArrowRight, UserCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface AssignTaskDialogProps {
  children: React.ReactNode;
}

export default function AssignTaskDialog({ children }: AssignTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    workflow: 'General Task',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });
  const [assignedTo, setAssignedTo] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const partnerId = user?.customClaims?.partnerId;

  useEffect(() => {
    if (!partnerId || !open) return;

    const q = query(collection(db, 'teamMembers'), where('partnerId', '==', partnerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      setTeamMembers(members);
    });

    return () => unsubscribe();
  }, [partnerId, open]);

  const handleNextStep = () => {
    if (taskDetails.title) {
      setStep(2);
    } else {
      toast({ variant: 'destructive', title: 'Task title is required' });
    }
  };

  const handleAssignTask = async () => {
    if (!assignedTo) {
      toast({ variant: 'destructive', title: 'Please assign the task to a team member' });
      return;
    }
    setIsLoading(true);
    
    if (!partnerId) {
        toast({ variant: 'destructive', title: 'Could not identify your organization.'});
        setIsLoading(false);
        return;
    }

    try {
      const result = await createTaskAction({
        ...taskDetails,
        assignee: assignedTo,
        partnerId: partnerId,
        status: 'assigned',
      });

      if (result.success && result.task) {
        toast({ title: 'Task Created!', description: `${result.task.title} has been assigned.` });
        resetAndClose();
      } else {
        toast({ variant: 'destructive', title: 'Failed to create task', description: result.message });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'An error occurred', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setStep(1);
    setTaskDetails({
      title: '',
      description: '',
      workflow: 'General Task',
      priority: 'medium',
      dueDate: '',
    });
    setAssignedTo('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) resetAndClose(); else setOpen(true) }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Step 1: Task Details</DialogTitle>
              <DialogDescription>Enter the details for the new task.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskDetails.title}
                  onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
                  placeholder="e.g., Review Q4 marketing proposal"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={taskDetails.description}
                  onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
                  placeholder="Provide more context for the task"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={taskDetails.priority} onValueChange={(v) => setTaskDetails({...taskDetails, priority: v as any})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                     <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" value={taskDetails.dueDate} onChange={e => setTaskDetails({...taskDetails, dueDate: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
              <Button onClick={handleNextStep} disabled={!taskDetails.title}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </>
        )}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Step 2: Assign Task</DialogTitle>
              <DialogDescription>Choose a team member to assign this task to.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-secondary rounded-md">
                <h4 className="font-semibold text-secondary-foreground">{taskDetails.title}</h4>
                <p className="text-sm text-muted-foreground">{taskDetails.description}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Team Member</Label>
                 <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue placeholder="Select a team member"/></SelectTrigger>
                    <SelectContent>
                        {teamMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleAssignTask} disabled={isLoading || !assignedTo}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                Assign Task
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
