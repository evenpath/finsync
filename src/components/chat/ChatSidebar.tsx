
"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Users, 
  Hash,
  Filter,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface Chat {
  id: string;
  name: string;
  type: 'group' | 'direct';
  participants: number;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  workspaceId: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeWorkspace: any;
}

export default function ChatSidebar({
  chats,
  selectedChat,
  onChatSelect,
  searchTerm,
  onSearchChange,
  activeWorkspace
}: ChatSidebarProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups' | 'direct'>('all');

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
  };

  const filteredChats = chats.filter(chat => {
    // Search filter
    if (searchTerm && !chat.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    switch (filter) {
      case 'unread':
        return chat.unreadCount > 0;
      case 'groups':
        return chat.type === 'group';
      case 'direct':
        return chat.type === 'direct';
      default:
        return true;
    }
  });

  const getChatIcon = (chat: Chat) => {
    return chat.type === 'group' ? Hash : MessageSquare;
  };

  const getFilterCount = (type: string) => {
    switch (type) {
      case 'unread':
        return chats.filter(chat => chat.unreadCount > 0).length;
      case 'groups':
        return chats.filter(chat => chat.type === 'group').length;
      case 'direct':
        return chats.filter(chat => chat.type === 'direct').length;
      default:
        return chats.length;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Messages ({getFilterCount('all')})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread ({getFilterCount('unread')})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('groups')}>
                  Groups ({getFilterCount('groups')})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('direct')}>
                  Direct Messages ({getFilterCount('direct')})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter indicator */}
        {filter !== 'all' && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {filter === 'unread' && 'Showing unread messages'}
              {filter === 'groups' && 'Showing group chats'}
              {filter === 'direct' && 'Showing direct messages'}
            </Badge>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No conversations found' : 'No messages yet'}
            </p>
            {!searchTerm && (
              <Button variant="outline" className="mt-3">
                <Plus className="w-4 h-4 mr-2" />
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats.map((chat) => {
              const Icon = getChatIcon(chat);
              const isSelected = selectedChat?.id === chat.id;
              
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        chat.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          chat.type === 'group' ? 'text-purple-600' : 'text-blue-600'
                        )} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                        <div className="flex items-center gap-2">
                          {chat.type === 'group' && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {chat.participants}
                            </div>
                          )}
                          {chat.unreadCount > 0 && (
                            <Badge variant="default" className="bg-blue-600 text-white text-xs">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as read</DropdownMenuItem>
                        <DropdownMenuItem>Pin conversation</DropdownMenuItem>
                        <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Leave conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
