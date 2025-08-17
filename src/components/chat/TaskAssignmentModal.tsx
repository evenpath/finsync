"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  User, 
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAssigned: (taskData: any) => void;
  activeWorkspace: any;
}

// Mock team members - replace with real data
const mockTeamMembers = [
  { id: '1', name: 'Sarah Chen', role: 'Designer', status: 'online' },
  { id: '2', name: 'Mike Johnson', role: 'Developer', status: 'online' },
  { id: '3', name: 'Alex Rivera', role: 'Product Manager', status: 'away' },
  { id: '4', name: 'Emma Davis', role: 'QA Engineer', status: 'offline' },
];

const workflows = [
  { id: '1', name: 'Design Review', steps: ['Initial Review', 'Feedback', 'Revision', 'Approval'] },
  { id: '2', name: 'Development Task', steps: ['Planning', 'Implementation', 'Testing', 'Deployment'] },
  { id: '3', name: 'Content Creation', steps: ['Research', 'Draft', 'Review', 'Publish'] },
];

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  onTaskAssigned,
  activeWorkspace
}: TaskAssignmentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [workflow, setWorkflow] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !assignee) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assignedMember = mockTeamMembers.find(member => member.id === assignee);
      
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        assignee: assignedMember?.name || 'Unknown',
        assigneeId: assignee,
        priority,
        dueDate,
        workflow: workflow ? workflows.find(w => w.id === workflow)?.name : undefined,
        workspaceId: activeWorkspace.id
      };

      onTaskAssigned(taskData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setAssignee('');
      setPriority('medium');
      setDueDate(undefined);
      setWorkflow('');
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Assign New Task
          </DialogTitle>
          <DialogDescription>
            Create and assign a task to a team member in {activeWorkspace.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Task Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
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

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Assign To *
            </Label>
            <Select value={assignee} onValueChange={setAssignee} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {mockTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      )} />
                      <span>{member.name}</span>
                      <span className="text-xs text-muted-foreground">({member.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? dueDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Workflow */}
          <div className="space-y-2">
            <Label>Workflow (Optional)</Label>
            <Select value={workflow} onValueChange={setWorkflow} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select workflow template..." />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((wf) => (
                  <SelectItem key={wf.id} value={wf.id}>
                    <div>
                      <div className="font-medium">{wf.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {wf.steps.length} steps: {wf.steps.join(' → ')}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Preview */}
          {title && assignee && (
            <div className="p-3 bg-muted rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Task Preview</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="font-medium">{title}</div>
                {description && (
                  <div className="text-muted-foreground">{description}</div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Assigned to: {mockTeamMembers.find(m => m.id === assignee)?.name}</span>
                  <Badge className={getPriorityColor(priority)}>
                    {priority} priority
                  </Badge>
                  {dueDate && (
                    <span className="text-muted-foreground">
                      Due: {dueDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !assignee || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
