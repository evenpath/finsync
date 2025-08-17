"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Users,
  CheckSquare,
  Plus,
  Hash,
  MessageSquare,
  Phone,
  Video
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import TaskAssignmentModal from './TaskAssignmentModal';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'task' | 'system';
  taskData?: {
    title: string;
    assignee: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
  };
}

interface ChatInterfaceProps {
  chat: any;
  onBack?: () => void;
  activeWorkspace: any;
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey team! How is everyone doing with their current tasks?',
    sender: { id: '1', name: 'Sarah Chen' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    type: 'text'
  },
  {
    id: '2',
    content: 'I just completed the UI mockups for the new feature.',
    sender: { id: '2', name: 'Mike Johnson' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'text'
  },
  {
    id: '3',
    content: 'Review website mockups',
    sender: { id: '1', name: 'Sarah Chen' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'task',
    taskData: {
      title: 'Review website mockups',
      assignee: 'Mike Johnson',
      priority: 'high',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
    }
  },
  {
    id: '4',
    content: 'Perfect! I\'ll get on that right away.',
    sender: { id: '2', name: 'Mike Johnson' },
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text'
  }
];

export default function ChatInterface({ chat, onBack, activeWorkspace }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: { id: 'current-user', name: 'You' },
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTaskAssigned = (taskData: any) => {
    const taskMessage: Message = {
      id: Date.now().toString(),
      content: `Task assigned: ${taskData.title}`,
      sender: { id: 'current-user', name: 'You' },
      timestamp: new Date(),
      type: 'task',
      taskData
    };

    setMessages(prev => [...prev, taskMessage]);
    setIsTaskModalOpen(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatIcon = () => {
    return chat.type === 'group' ? Hash : MessageSquare;
  };

  const renderMessage = (msg: Message) => {
    const isCurrentUser = msg.sender.id === 'current-user';

    if (msg.type === 'task') {
      return (
        <div className={cn(
          "max-w-sm p-3 rounded-lg border bg-card",
          isCurrentUser ? "ml-auto" : "mr-auto"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Task Assigned</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">{msg.taskData?.title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Assigned to: {msg.taskData?.assignee}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                msg.taskData?.priority === 'high' ? 'destructive' :
                msg.taskData?.priority === 'medium' ? 'default' : 'secondary'
              }>
                {msg.taskData?.priority} priority
              </Badge>
              {msg.taskData?.dueDate && (
                <span className="text-xs text-muted-foreground">
                  Due: {new Date(msg.taskData.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg",
        isCurrentUser
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-muted"
      )}>
        <p className="text-sm">{msg.content}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              chat.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'
            )}>
              {React.createElement(getChatIcon(), {
                className: cn(
                  "w-5 h-5",
                  chat.type === 'group' ? 'text-purple-600' : 'text-blue-600'
                )
              })}
            </div>
            
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{chat.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {chat.type === 'group' && (
                  <>
                    <Users className="w-4 h-4" />
                    <span>{chat.participants} members</span>
                  </>
                )}
                <span className="text-green-600">● Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsTaskModalOpen(true)}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Assign Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  View Members
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Mute Notifications
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Leave Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {msg.sender.id !== 'current-user' && (
              <div className="text-xs text-muted-foreground">
                {msg.sender.name} • {formatTimestamp(msg.timestamp)}
              </div>
            )}
            {renderMessage(msg)}
            {msg.sender.id === 'current-user' && (
              <div className="text-xs text-muted-foreground text-right">
                {formatTimestamp(msg.timestamp)}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsTaskModalOpen(true)}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Assign Task
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Paperclip className="w-4 h-4 mr-2" />
                Attach File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskAssigned={handleTaskAssigned}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
}
