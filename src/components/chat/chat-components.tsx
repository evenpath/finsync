import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, Users, Search } from 'lucide-react';
import { Conversation, ChatMessage } from '@/lib/types';
import { ChatService } from '@/lib/chat-service';
import { useAuth } from '@/hooks/use-auth';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Button size="sm" onClick={onNewConversation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 cursor-pointer hover:bg-muted/50 border-l-4 ${
                selectedConversationId === conversation.id
                  ? 'border-l-primary bg-muted/30'
                  : 'border-l-transparent'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {conversation.type === 'group' ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      conversation.title.slice(0, 2).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {conversation.title}
                    </p>
                    {conversation.lastMessageAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {conversation.type}
                    </Badge>
                    {conversation.messageCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {conversation.messageCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations found</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onNewConversation}
              >
                Start a conversation
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg p-3 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div
                  className={`flex items-center mt-1 space-x-2 text-xs text-muted-foreground ${
                    isOwn ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{formatTime(message.createdAt)}</span>
                  {message.isEdited && <span>(edited)</span>}
                </div>
              </div>
              {!isOwn && (
                <Avatar className="h-8 w-8 order-1 mr-3">
                  <AvatarFallback className="text-xs">
                    {message.sender?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled || isSending}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled || isSending}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

interface NewConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantIds: string[], title: string) => Promise<void>;
  teamMembers: any[];
  currentUserId: string;
}

export const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
  teamMembers,
  currentUserId
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const availableMembers = teamMembers.filter(member => member.userId !== currentUserId);

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedMembers.length === 0) return;

    setIsCreating(true);
    try {
      const participants = [currentUserId, ...selectedMembers];
      const title = conversationTitle || 
        (selectedMembers.length === 1 
          ? teamMembers.find(m => m.userId === selectedMembers[0])?.name || 'Direct Chat'
          : 'Group Chat'
        );
      
      await onCreateConversation(participants, title);
      setSelectedMembers([]);
      setConversationTitle('');
      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Conversation Title (optional)
            </label>
            <Input
              value={conversationTitle}
              onChange={(e) => setConversationTitle(e.target.value)}
              placeholder="Enter conversation title..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Team Members
            </label>
            <ScrollArea className="h-48 border rounded">
              {availableMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleMemberToggle(member.userId)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.userId)}
                    onChange={() => {}}
                    className="rounded"
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={selectedMembers.length === 0 || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};