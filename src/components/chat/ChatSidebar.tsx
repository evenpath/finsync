"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
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
import { ChatService } from '../../lib/chat-service';
import { Conversation, TeamMember } from '../../lib/types';

interface ChatSidebarProps {
  chats: Conversation[];
  selectedChat: Conversation | null;
  onChatSelect: (chat: Conversation) => void;
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspace?.partnerId) {
      loadTeamMembers();
    }
  }, [activeWorkspace?.partnerId]);

  const loadTeamMembers = async () => {
    try {
      const members = await ChatService.getTeamMembers(activeWorkspace.partnerId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m`;
      } else if (hours < 24) {
        return `${Math.floor(hours)}h`;
      } else {
        const days = Math.floor(hours / 24);
        return days === 1 ? '1d' : `${days}d`;
      }
    } catch {
      return '';
    }
  };

  const filteredChats = chats.filter(chat => {
    // Search filter
    if (searchTerm && !chat.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    switch (filter) {
      case 'unread':
        return chat.messageCount > 0; // Simplified unread logic
      case 'groups':
        return chat.type === 'group';
      case 'direct':
        return chat.type === 'direct';
      default:
        return true;
    }
  });

  const getChatIcon = (chat: Conversation) => {
    return chat.type === 'group' ? Users : MessageSquare;
  };

  const handleNewDirectChat = async (member: TeamMember) => {
    if (!activeWorkspace?.partnerId) return;
    
    try {
      setIsLoading(true);
      
      // Check if conversation already exists
      const existingConversationId = await ChatService.findExistingDirectConversation(
        activeWorkspace.partnerId,
        activeWorkspace.userId,
        member.userId
      );

      if (existingConversationId) {
        // Find and select existing conversation
        const existingConversation = chats.find(c => c.id === existingConversationId);
        if (existingConversation) {
          onChatSelect(existingConversation);
        }
      } else {
        // Create new conversation
        const conversationId = await ChatService.createConversation(
          activeWorkspace.partnerId,
          [activeWorkspace.userId, member.userId],
          member.name,
          'direct',
          activeWorkspace.userId
        );

        // The real-time listener will pick up the new conversation
      }
      
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Failed to create/find conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button 
            size="sm" 
            onClick={() => setShowNewChatModal(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-2 gap-1 border-b">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'direct', label: 'Direct' },
          { key: 'groups', label: 'Groups' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="h-7 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground mb-2">No Conversations</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'No conversations found' : 'Start a new conversation to get started'}
            </p>
            {!searchTerm && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewChatModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
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
                    isSelected && "bg-muted border-l-4 border-l-primary"
                  )}
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
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
                        <h3 className="text-sm font-medium truncate">
                          {chat.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(chat.lastMessageAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.type === 'group' && `${chat.participants?.length || 0} members`}
                          {chat.type === 'direct' && 'Direct message'}
                        </p>
                        {chat.messageCount > 0 && (
                          <Badge variant="default" className="h-5 text-xs px-2">
                            {chat.messageCount > 99 ? '99+' : chat.messageCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {teamMembers
                  .filter(member => member.userId !== activeWorkspace?.userId)
                  .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleNewDirectChat(member)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.name?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewChatModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}