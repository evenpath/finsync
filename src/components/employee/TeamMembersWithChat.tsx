'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Search, Users, Phone, Mail, MapPin } from 'lucide-react';
import { ChatService } from '@/lib/chat-service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  phoneNumber?: string;
  location?: string;
  partnerId: string;
  joinedAt: Date;
}

interface TeamMembersWithChatProps {
  showChatActions?: boolean;
}

export function TeamMembersWithChat({ showChatActions = true }: TeamMembersWithChatProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const partnerId = user?.customClaims?.partnerId || user?.customClaims?.partnerIds?.[0];

  useEffect(() => {
    if (!user || !partnerId) {
      setError('User authentication required');
      setIsLoading(false);
      return;
    }

    loadTeamMembers();
  }, [user, partnerId]);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const members = await ChatService.getTeamMembers(partnerId);
      setTeamMembers(members);
      setError(null);
    } catch (error) {
      console.error('Failed to load team members:', error);
      setError('Failed to load team members');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load team members'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (member: TeamMember) => {
    if (!user?.uid || !partnerId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User authentication required'
      });
      return;
    }

    try {
      // Check if conversation already exists
      const existingConversationId = await ChatService.findExistingDirectConversation(
        partnerId,
        user.uid,
        member.userId
      );

      if (existingConversationId) {
        // Navigate to chat with existing conversation
        router.push(`/employee/chat?conversation=${existingConversationId}`);
        return;
      }

      // Create new conversation
      const conversationId = await ChatService.createConversation(
        partnerId,
        [user.uid, member.userId],
        member.name,
        'direct',
        user.uid
      );

      // Navigate to the new chat
      router.push(`/employee/chat?conversation=${conversationId}`);

      toast({
        title: 'Chat Started',
        description: `Started conversation with ${member.name}`
      });
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start chat'
      });
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUserMembers = filteredMembers.filter(member => member.userId !== user?.uid);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Loading team members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={loadTeamMembers}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members ({currentUserMembers.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {currentUserMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No members found matching your search' : 'No team members found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentUserMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                      <Badge 
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      {member.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phoneNumber && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{member.phoneNumber}</span>
                        </div>
                      )}
                      {member.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{member.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {showChatActions && (
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartChat(member)}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}