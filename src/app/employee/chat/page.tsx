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

// Mock data - This will be replaced with real data from Firebase/API later.
// For now, we use an empty array to focus on the UI structure and auth flow.
const mockChats: any[] = [];

export default function EmployeeChatPage() {
  const { 
    user, 
    loading, 
    currentWorkspace, 
    availableWorkspaces,
    switchWorkspace
  } = useMultiWorkspaceAuth();
  
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chats by current workspace
  const filteredChats = mockChats.filter(chat => {
    if (!currentWorkspace) return false;
    return chat.workspaceId === currentWorkspace.partnerId;
  });

  // Reset selected chat when workspace changes
  useEffect(() => {
    setSelectedChat(null);
  }, [currentWorkspace?.partnerId]);

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
              <ChatSidebar
                chats={filteredChats}
                selectedChat={selectedChat}
                onChatSelect={setSelectedChat}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeWorkspace={currentWorkspace}
              />
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
        <ChatSidebar
          chats={filteredChats}
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeWorkspace={currentWorkspace}
        />
      </div>
      <div className="flex-1">
        {selectedChat ? (
          <ChatInterface
            chat={selectedChat}
            activeWorkspace={currentWorkspace}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h2>
              <p className="text-gray-500">Choose a chat from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
