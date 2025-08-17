"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useIsMobile } from '../../hooks/use-mobile';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatInterface from '../../components/chat/ChatInterface';
import WorkspaceSwitcher from '../../components/chat/WorkspaceSwitcher';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import { MessageSquare } from 'lucide-react';

// Mock data - replace with real data from Firebase/API
const mockWorkspaces = [
  { id: '1', name: 'Acme Corp', partnerId: 'partner1', role: 'employee' },
  { id: '2', name: 'TechStart Inc', partnerId: 'partner2', role: 'employee' },
];

const mockChats = [
  {
    id: '1',
    name: 'General Discussion',
    type: 'group',
    participants: 5,
    lastMessage: 'Hey team, how is the project going?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2,
    workspaceId: '1'
  },
  {
    id: '2',
    name: 'Task Updates',
    type: 'group',
    participants: 3,
    lastMessage: 'Task completed successfully!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    unreadCount: 0,
    workspaceId: '1'
  },
  {
    id: '3',
    name: 'John Smith',
    type: 'direct',
    participants: 2,
    lastMessage: 'Can you review this document?',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    unreadCount: 1,
    workspaceId: '2'
  }
];

export default function ChatPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [activeWorkspace, setActiveWorkspace] = useState(mockWorkspaces[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chats by active workspace
  const filteredChats = mockChats.filter(chat => chat.workspaceId === activeWorkspace.id);

  useEffect(() => {
    // Auto-select first chat on desktop if none selected
    if (!isMobile && !selectedChat && filteredChats.length > 0) {
      setSelectedChat(filteredChats[0]);
    }
  }, [isMobile, selectedChat, filteredChats]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please log in to access chat.</p>
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
            activeWorkspace={activeWorkspace}
          />
        ) : (
          <>
            <WorkspaceSwitcher
              workspaces={mockWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1">
              <ChatSidebar
                chats={filteredChats}
                selectedChat={selectedChat}
                onChatSelect={setSelectedChat}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeWorkspace={activeWorkspace}
              />
            </div>
          </>
        )}
        <BottomNavigation userRole={user?.customClaims?.role || 'employee'} />
      </div>
    );
  }

  // Desktop layout - two-pane
  return (
    <div className="h-screen flex bg-background">
      <div className="w-80 border-r flex flex-col">
        <WorkspaceSwitcher
          workspaces={mockWorkspaces}
          activeWorkspace={activeWorkspace}
          onWorkspaceChange={setActiveWorkspace}
        />
        <ChatSidebar
          chats={filteredChats}
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeWorkspace={activeWorkspace}
        />
      </div>
      <div className="flex-1">
        {selectedChat ? (
          <ChatInterface
            chat={selectedChat}
            activeWorkspace={activeWorkspace}
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
