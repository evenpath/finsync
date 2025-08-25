
// src/app/employee/chat/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatInterface from '../../../components/chat/ChatInterface';
import EmployeeWorkspaceSwitcher from '../../../components/employee/EmployeeWorkspaceSwitcher';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
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

  // Debug logging
  useEffect(() => {
    console.log('Employee Chat Debug:', {
      user: user?.uid,
      currentWorkspace: currentWorkspace?.partnerId,
      userRole: user?.customClaims?.role,
      userClaims: user?.customClaims
    });
  }, [user, currentWorkspace]);

  // Set up real-time conversations listener
  useEffect(() => {
    // Clear previous state
    setConversations([]);
    setSelectedChat(null);
    setChatError(null);

    // Validate required data
    if (!user?.uid) {
      console.log('User not authenticated, skipping chat setup');
      return;
    }

    if (!currentWorkspace?.partnerId) {
      console.log('No current workspace, skipping chat setup');
      setChatError('No workspace selected. Please select a workspace to access chat.');
      return;
    }

    // Validate workspace access
    const hasWorkspaceAccess = user.customClaims?.partnerId === currentWorkspace.partnerId ||
                              user.customClaims?.partnerIds?.includes(currentWorkspace.partnerId);

    if (!hasWorkspaceAccess) {
      console.warn('User does not have access to current workspace');
      setChatError('You do not have access to this workspace.');
      return;
    }

    console.log('Setting up conversations listener for:', {
      partnerId: currentWorkspace.partnerId,
      userId: user.uid
    });

    setIsLoadingChats(true);

    const unsubscribe = ChatService.subscribeToConversations(
      currentWorkspace.partnerId,
      user.uid,
      (newConversations) => {
        console.log('Received conversations update:', newConversations.length);
        setConversations(newConversations);
        setIsLoadingChats(false);
        setChatError(null);
        
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
      console.log('Cleaning up conversations listener');
      unsubscribe();
      setIsLoadingChats(false);
    };
  }, [user?.uid, currentWorkspace?.partnerId, user?.customClaims]);

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

  // No user or workspace
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please log in to access chat.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Workspace Selected</h2>
          <p className="text-gray-500">Please select a workspace to access chat.</p>
          {availableWorkspaces.length > 0 && (
            <div className="mt-4">
              <EmployeeWorkspaceSwitcher
                workspaces={availableWorkspaces}
                currentWorkspace={null}
                onWorkspaceSwitch={switchWorkspace}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Create an enhanced active workspace object that includes the user's ID
  const activeWorkspaceWithUser = {
    ...currentWorkspace,
    userId: user.uid
  };

  // Chat error state
  if (chatError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <EmployeeWorkspaceSwitcher
          workspaces={availableWorkspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSwitch={switchWorkspace}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{chatError}</AlertDescription>
          </Alert>
        </div>
        {isMobile && <BottomNavigation userRole={currentWorkspace.role} />}
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
            activeWorkspace={activeWorkspaceWithUser}
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
              ) : (
                <ChatSidebar
                  chats={filteredChats}
                  selectedChat={selectedChat}
                  onChatSelect={setSelectedChat}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activeWorkspace={activeWorkspaceWithUser}
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
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        ) : (
          <ChatSidebar
            chats={filteredChats}
            selectedChat={selectedChat}
            onChatSelect={setSelectedChat}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeWorkspace={activeWorkspaceWithUser}
          />
        )}
      </div>
      
      <div className="flex-1">
        <ChatInterface
          chat={selectedChat}
          activeWorkspace={activeWorkspaceWithUser}
        />
      </div>
    </div>
  );
}
