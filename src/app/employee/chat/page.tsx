// src/app/employee/chat/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatInterface from '../../../components/chat/ChatInterface';
import EmployeeWorkspaceSwitcher from '../../../components/employee/EmployeeWorkspaceSwitcher';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { ChatService } from '../../../lib/chat-service';
import { Conversation } from '../../../lib/types';

export default function EmployeeChatPage() {
  const { 
    user, 
    loading, 
    currentWorkspace, 
    availableWorkspaces,
    switchWorkspace
  } = useMultiWorkspaceAuth();
  
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Set up real-time conversations listener
  useEffect(() => {
    if (!user || !currentWorkspace?.partnerId) {
      setConversations([]);
      setSelectedChat(null);
      return;
    }

    setIsLoadingChats(true);
    setChatError(null);

    const unsubscribe = ChatService.subscribeToConversations(
      currentWorkspace.partnerId,
      user.uid,
      (newConversations) => {
        setConversations(newConversations);
        setIsLoadingChats(false);
        
        // If we have a selected chat, update it with the latest data
        if (selectedChat) {
          const updatedSelectedChat = newConversations.find(c => c.id === selectedChat.id);
          if (updatedSelectedChat) {
            setSelectedChat(updatedSelectedChat);
          } else {
            // Chat no longer exists, clear selection
            setSelectedChat(null);
          }
        }
      }
    );

    return () => {
      unsubscribe();
      setIsLoadingChats(false);
    };
  }, [user, currentWorkspace?.partnerId]);

  // Filter chats by current workspace and search term
  const filteredChats = conversations.filter(chat => {
    if (!currentWorkspace) return false;
    
    // Chat should belong to current workspace
    if (chat.partnerId !== currentWorkspace.partnerId) return false;
    
    // Apply search filter
    if (searchTerm && !chat.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Reset selected chat when workspace changes
  useEffect(() => {
    setSelectedChat(null);
    setSearchTerm('');
  }, [currentWorkspace?.partnerId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No workspace selected
  if (!user || !currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Workspace Selected</h2>
          <p className="text-gray-500">Please select a workspace to access chat.</p>
        </div>
      </div>
    );
  }
  
  // Mobile layout - show either sidebar or chat interface
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        {selectedChat ? (
          <ChatInterface
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
            activeWorkspace={currentWorkspace}
          />
        ) : (
          <>
            <EmployeeWorkspaceSwitcher
              workspaces={availableWorkspaces}
              currentWorkspace={currentWorkspace}
              onWorkspaceSwitch={switchWorkspace}
            />
            <div className="flex-1">
              {isLoadingChats ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading conversations...</p>
                  </div>
                </div>
              ) : chatError ? (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-red-300" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Chat Error</h3>
                    <p className="text-red-500 mb-4">{chatError}</p>
                  </div>
                </div>
              ) : (
                <ChatSidebar
                  chats={filteredChats}
                  selectedChat={selectedChat}
                  onChatSelect={setSelectedChat}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activeWorkspace={currentWorkspace}
                />
              )}
            </div>
          </>
        )}
        <BottomNavigation userRole={currentWorkspace.role} />
      </div>
    );
  }

  // Desktop layout - two-pane
  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-80 border-r flex flex-col">
        <EmployeeWorkspaceSwitcher
          workspaces={availableWorkspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSwitch={switchWorkspace}
        />
        
        {isLoadingChats ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : chatError ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-red-300" />
              <p className="text-red-500 text-sm">{chatError}</p>
            </div>
          </div>
        ) : (
          <ChatSidebar
            chats={filteredChats}
            selectedChat={selectedChat}
            onChatSelect={setSelectedChat}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeWorkspace={currentWorkspace}
          />
        )}
      </div>
      
      <div className="flex-1">
        <ChatInterface
          chat={selectedChat}
          activeWorkspace={currentWorkspace}
        />
      </div>
    </div>
  );
}