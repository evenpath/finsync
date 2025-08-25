"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MoreVertical,
  Users,
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
import { cn } from '../../lib/utils';
import { ChatService } from '../../lib/chat-service';
import { ChatMessage, Conversation } from '../../lib/types';

interface ChatInterfaceProps {
  chat: Conversation | null;
  onBack?: () => void;
  activeWorkspace: any;
}

export default function ChatInterface({ chat, onBack, activeWorkspace }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chat?.id) {
      // Set up real-time listener for messages
      const unsubscribe = ChatService.subscribeToMessages(
        chat.id,
        (newMessages) => {
          setMessages(newMessages);
        }
      );

      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [chat?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chat?.id || !activeWorkspace?.userId || isSending) return;

    const messageContent = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await ChatService.sendMessage(
        chat.id,
        activeWorkspace.userId,
        messageContent,
        activeWorkspace.partnerId
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message if sending failed
      setMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (messageDate.getTime() === today.getTime()) {
        return 'Today';
      } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return '';
    }
  };

  const getChatIcon = () => {
    return chat?.type === 'group' ? Users : MessageSquare;
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isCurrentUser = msg.senderId === activeWorkspace?.userId;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !prevMessage || 
      formatMessageDate(msg.createdAt) !== formatMessageDate(prevMessage.createdAt);

    return (
      <div key={msg.id}>
        {/* Date Separator */}
        {showDateSeparator && (
          <div className="flex items-center justify-center my-4">
            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {formatMessageDate(msg.createdAt)}
            </div>
          </div>
        )}

        {/* Message */}
        <div className={cn(
          "flex gap-3 mb-4",
          isCurrentUser ? "justify-end" : "justify-start"
        )}>
          {!isCurrentUser && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="text-xs">
                {msg.sender?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={cn(
            "max-w-[70%] space-y-1",
            isCurrentUser ? "items-end" : "items-start"
          )}>
            {!isCurrentUser && chat?.type === 'group' && (
              <p className="text-xs text-muted-foreground font-medium px-1">
                {msg.sender?.name || 'Unknown User'}
              </p>
            )}
            
            <div className={cn(
              "rounded-lg p-3 break-words",
              isCurrentUser 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              <p className="text-sm">{msg.content}</p>
            </div>
            
            <p className={cn(
              "text-xs text-muted-foreground px-1",
              isCurrentUser ? "text-right" : "text-left"
            )}>
              {formatTimestamp(msg.createdAt)}
              {msg.isEdited && " (edited)"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            Select a conversation
          </h2>
          <p className="text-muted-foreground">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  const ChatIcon = getChatIcon();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex-shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            chat.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'
          )}>
            <ChatIcon className={cn(
              "w-5 h-5",
              chat.type === 'group' ? 'text-purple-600' : 'text-blue-600'
            )} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">
            {chat.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {chat.type === 'group' 
              ? `${chat.participants?.length || 0} members`
              : chat.isActive ? 'Active' : 'Offline'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Video className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Search Messages</DropdownMenuItem>
              <DropdownMenuSeparator />
              {chat.type === 'group' && (
                <>
                  <DropdownMenuItem>Group Settings</DropdownMenuItem>
                  <DropdownMenuItem>Leave Group</DropdownMenuItem>
                </>
              )}
              {chat.type === 'direct' && (
                <DropdownMenuItem>Block User</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            messages.map((msg, index) => renderMessage(msg, index))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending}
              className="pr-12"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}