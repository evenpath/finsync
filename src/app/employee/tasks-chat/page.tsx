"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, MessageCircle, Users } from 'lucide-react';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import { Badge } from '@/components/ui/badge';
import EmployeeWorkspaceSwitcher from '../../../components/employee/EmployeeWorkspaceSwitcher';
import BottomNavigation from '../../../components/navigation/BottomNavigation';

// Import your existing task components - adjust paths as needed
// import TaskList from '../../../components/tasks/TaskList';

// Import the chat components we just created
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatInterface from '../../../components/chat/ChatInterface';
import { ChatService } from '../../../lib/chat-service';
import { Conversation } from '../../../lib/types';

export default function TasksChatPage() {
  const {
    user,
    loading,
    currentWorkspace,
    availableWorkspaces,
    switchWorkspace
  } = useMultiWorkspaceAuth();

  const [activeTab, setActiveTab] = useState('tasks');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set up conversations listener (similar to main chat page)
  React.useEffect(() => {
    if (!user || !currentWorkspace?.partnerId) {
      setConversations([]);
      return;
    }

    const unsubscribe = ChatService.subscribeToConversations(
      currentWorkspace.partnerId,
      user.uid,
      (newConversations) => {
        setConversations(newConversations);
      }
    );

    return () => unsubscribe();
  }, [user, currentWorkspace?.partnerId]);

  const filteredChats = conversations.filter(chat => {
    if (!currentWorkspace || chat.partnerId !== currentWorkspace.partnerId) return false;
    if (searchTerm && !chat.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please select a workspace</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Workspace Switcher */}
      <EmployeeWorkspaceSwitcher
        workspaces={availableWorkspaces}
        currentWorkspace={currentWorkspace}
        onWorkspaceSwitch={switchWorkspace}
      />

      {/* Main Content with Tabs */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
              {/* You can add task count badge here */}
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
              {conversations.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {conversations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="h-[calc(100vh-12rem)]">
            <div className="h-full border rounded-lg p-4 bg-card">
              <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
              {/* Replace this with your actual task component */}
              <div className="text-center text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your existing task component goes here</p>
                <p className="text-sm mt-2">Import and use your current TaskList component</p>
              </div>
              {/* 
                Example integration:
                <TaskList 
                  workspaceId={currentWorkspace.partnerId}
                  userId={user.uid}
                />
              */}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="h-[calc(100vh-12rem)]">
            <div className="h-full border rounded-lg bg-card overflow-hidden">
              <div className="flex h-full">
                {/* Chat Sidebar */}
                <div className="w-80 border-r">
                  <ChatSidebar
                    chats={filteredChats}
                    selectedChat={selectedChat}
                    onChatSelect={setSelectedChat}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    activeWorkspace={currentWorkspace}
                  />
                </div>
                
                {/* Chat Interface */}
                <div className="flex-1">
                  <ChatInterface
                    chat={selectedChat}
                    activeWorkspace={currentWorkspace}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation userRole={currentWorkspace.role} />
    </div>
  );
}