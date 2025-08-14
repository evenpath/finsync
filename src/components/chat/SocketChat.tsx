// src/components/chat/SocketChat.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Mic,
  Plus,
  Settings,
  Bell,
  BellOff,
  Pin,
  Archive,
  Trash2,
  Reply,
  Forward,
  Copy,
  Star,
  ChevronDown,
  Users,
  Hash,
  Lock,
  Globe,
  CheckCheck,
  Check,
  Image as LucideImage,
  File,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Building,
  Zap,
  AlertCircle,
  Clock,
  Edit3,
  UserPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  MessageSquare,
  CheckCircle,
  FileText,
  Crown,
  Shield,
  UserMinus,
  Info,
  UserCheck
} from 'lucide-react';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock Data for Chat
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  email: "alex@company.com",
  avatar: "https://placehold.co/40x40.png",
  status: "online"
};

const mockWorkspaceTasks = [
  {
    id: 1,
    title: "Review Marketing Proposal",
    workflow: "Document Review & Approval",
    assignee: "Sarah Wilson",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-07-31",
    currentStep: "AI Analysis",
    description: "Marketing proposal for Q4 campaign needs review"
  },
  {
    id: 2,
    title: "Process Invoice #INV-2024-789",
    workflow: "Invoice Processing Pipeline",
    assignee: "Mike Chen",
    status: "awaiting_approval",
    priority: "medium",
    dueDate: "2024-08-01",
    currentStep: "Manager Approval",
    description: "Office supplies invoice for $2,450.00"
  },
  {
    id: 3,
    title: "Client Data Verification",
    workflow: "Customer Onboarding Flow",
    assignee: "You",
    status: "assigned",
    priority: "low",
    dueDate: "2024-08-02",
    currentStep: "Data Collection",
    description: "New client information needs verification"
  },
  {
    id: 4,
    title: "Content Review - Blog Post",
    workflow: "Content Creation Workflow",
    assignee: "Emma Davis",
    status: "completed",
    priority: "medium",
    dueDate: "2024-07-29",
    currentStep: "Published",
    description: "Review and approve blog post for company website"
  }
];

const mockWorkspaces = [
  {
    id: 1,
    name: "TechCorp Industries",
    role: "Partner Admin",
    avatar: "https://placehold.co/40x40.png",
    unreadCount: 5,
    isActive: true
  },
  {
    id: 2,
    name: "Marketing Solutions",
    role: "Worker",
    avatar: "https://placehold.co/40x40.png",
    unreadCount: 2,
    isActive: false
  },
  {
    id: 3,
    name: "StartupHub",
    role: "Worker",
    avatar: "https://placehold.co/40x40.png",
    unreadCount: 0,
    isActive: false
  }
];

const mockGroupMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@company.com",
    avatar: "https://placehold.co/40x40.png",
    role: "admin",
    status: "online",
    joinedAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@company.com",
    avatar: "https://placehold.co/40x40.png",
    role: "member",
    status: "online",
    joinedAt: "2024-01-20"
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@company.com",
    avatar: "https://placehold.co/40x40.png",
    role: "member",
    status: "offline",
    joinedAt: "2024-02-01"
  },
  {
    id: 4,
    name: "Emma Davis",
    email: "emma@company.com",
    avatar: "https://placehold.co/40x40.png",
    role: "member",
    status: "away",
    joinedAt: "2024-02-10"
  }
];

const mockAvailableUsers = [
  {
    id: 5,
    name: "John Smith",
    email: "john@company.com",
    avatar: "https://placehold.co/40x40.png",
    role: "worker"
  },
  {
    id: 6,
    name: "Lisa Brown",
    email: "lisa@company.com",
    avatar: "https://placehold.co/40x40.png",
    role: "worker"
  }
];

const mockChats = [
  {
    id: 1,
    type: "group",
    name: "General",
    avatar: "https://placehold.co/40x40.png",
    lastMessage: "The new workflow template is ready for testing",
    lastMessageTime: "2:30 PM",
    unreadCount: 3,
    isOnline: true,
    isPinned: true,
    workspaceId: 1,
    members: 12,
    description: "General workspace discussions",
    createdBy: 1,
    admins: [1],
    groupSettings: {
      canMembersInvite: true,
      canMembersPin: false,
      messageRetention: 90
    }
  },
  {
    id: 2,
    type: "workflow",
    name: "Document Review Process",
    avatar: null,
    lastMessage: "Task #DR-2024-156 requires your approval",
    lastMessageTime: "2:15 PM",
    unreadCount: 1,
    isOnline: false,
    isPinned: false,
    workspaceId: 1,
    workflowId: 1,
    description: "Automated notifications for document review workflow"
  },
  {
    id: 3,
    type: "direct",
    name: "Sarah Wilson",
    avatar: "https://placehold.co/40x40.png",
    lastMessage: "Just finished the analysis, uploading results now",
    lastMessageTime: "1:45 PM",
    unreadCount: 0,
    isOnline: true,
    isPinned: false,
    workspaceId: 1,
    userId: 2,
    description: "Direct message"
  },
  {
    id: 4,
    type: "group",
    name: "Marketing Team",
    avatar: "https://placehold.co/40x40.png",
    lastMessage: "Campaign metrics look great this month!",
    lastMessageTime: "12:30 PM",
    unreadCount: 0,
    isOnline: false,
    isPinned: false,
    workspaceId: 2,
    members: 8,
    description: "Marketing team coordination",
    createdBy: 2,
    admins: [1, 2],
    groupSettings: {
      canMembersInvite: false,
      canMembersPin: true,
      messageRetention: 30
    }
  },
  {
    id: 5,
    type: "direct",
    name: "Mike Chen",
    avatar: "https://placehold.co/40x40.png",
    lastMessage: "Thanks for the quick approval! 👍",
    lastMessageTime: "11:15 AM",
    unreadCount: 0,
    isOnline: false,
    isPinned: true,
    workspaceId: 1,
    userId: 3,
    description: "Direct message"
  }
];

const mockMessages = [
  {
    id: 1,
    senderId: 2,
    senderName: "Sarah Wilson",
    senderAvatar: "https://placehold.co/40x40.png",
    content: "Hey team! I've completed the document analysis for the quarterly report. The AI summary looks accurate.",
    timestamp: "10:30 AM",
    type: "text",
    isRead: true,
    reactions: [{ emoji: "👍", count: 2, users: ["Mike Chen", "Alex Johnson"] }]
  },
  {
    id: 2,
    senderId: 1,
    senderName: "Alex Johnson",
    senderAvatar: "https://placehold.co/40x40.png",
    content: "Great work! Can you share the summary document?",
    timestamp: "10:32 AM",
    type: "text",
    isRead: true,
    replyTo: 1
  },
  {
    id: 3,
    senderId: 2,
    senderName: "Sarah Wilson",
    senderAvatar: "https://placehold.co/40x40.png",
    content: "",
    timestamp: "10:35 AM",
    type: "file",
    isRead: true,
    fileData: {
      name: "Q4_Report_Summary.pdf",
      size: "2.4 MB",
      type: "pdf"
    }
  },
  {
    id: 4,
    senderId: 3,
    senderName: "Mike Chen",
    senderAvatar: "https://placehold.co/40x40.png",
    content: "Perfect timing! I was just about to ask for this. The workflow automation is working smoothly 🎉",
    timestamp: "10:38 AM",
    type: "text",
    isRead: true,
    reactions: [{ emoji: "🎉", count: 1, users: ["Sarah Wilson"] }]
  },
  {
    id: 5,
    senderId: 0,
    senderName: "Workflow Bot",
    senderAvatar: null,
    content: "Task #DR-2024-156 has been completed and moved to approval stage. @Alex Johnson please review.",
    timestamp: "2:15 PM",
    type: "system",
    isRead: false,
    systemData: {
      type: "workflow_notification",
      taskId: "DR-2024-156",
      workflowName: "Document Review Process",
      action: "approval_required"
    }
  },
  {
    id: 6,
    senderId: 1,
    senderName: "Alex Johnson",
    senderAvatar: "https://placehold.co/40x40.png",
    content: "Just reviewed and approved! Great work everyone. The new AI analysis feature is really speeding things up.",
    timestamp: "2:30 PM",
    type: "text",
    isRead: false,
    mentions: ["@everyone"]
  }
];

// Components

const TabBar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const WorkspaceSwitcher = ({ workspaces, activeWorkspace, onWorkspaceChange, isOpen, onToggle }: any) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-4 right-4 bg-card rounded-lg shadow-lg border z-50">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Switch Workspace</h3>
      </div>
      <div className="py-2">
        {workspaces.map((workspace: any) => (
          <button
            key={workspace.id}
            onClick={() => {
              onWorkspaceChange(workspace);
              onToggle();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors ${workspace.isActive ? 'bg-primary/10 border-r-2 border-primary' : ''
              }`}
          >
            <Image
              src={workspace.avatar}
              alt={workspace.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
              data-ai-hint="logo company"
            />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{workspace.name}</p>
              <p className="text-sm text-muted-foreground">{workspace.role}</p>
            </div>
            {workspace.unreadCount > 0 && (
              <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {workspace.unreadCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const GroupInfoModal = ({ chat, isOpen, onClose, onMemberAction, currentUser }: any) => {
  const [activeTab, setActiveTab] = useState('members');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [description, setDescription] = useState(chat?.description || '');

  useEffect(() => {
    if (chat?.description) {
      setDescription(chat.description);
    }
  }, [chat?.description]);


  if (!isOpen || chat?.type !== 'group') return null;

  const isAdmin = chat.admins?.includes(currentUser.id);
  const isCreator = chat.createdBy === currentUser.id;

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      onMemberAction('add', newMemberEmail);
      setNewMemberEmail('');
      setShowAddMember(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{chat.name}</h3>
              <p className="text-sm text-muted-foreground">{chat.members} members</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 font-medium text-sm ${activeTab === 'members'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 font-medium text-sm ${activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {activeTab === 'members' && (
            <div className="p-4">
              {/* Add Member Section */}
              {(isAdmin || chat.groupSettings?.canMembersInvite) && (
                <div className="mb-6">
                  {!showAddMember ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAddMember(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleAddMember}>
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddMember(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Members ({mockGroupMembers.length})</h4>
                {mockGroupMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                    <div className="relative">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        data-ai-hint="person user"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{member.name}</p>
                        {member.role === 'admin' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {member.id === chat.createdBy && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    {isAdmin && member.id !== currentUser.id && member.id !== chat.createdBy && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMemberAction('remove', member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 space-y-6">
              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a group description..."
                  readOnly={!isAdmin}
                  className="w-full"
                />
              </div>

              {/* Group Settings */}
              {isAdmin && (
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Group Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Members can invite others</p>
                      <p className="text-sm text-muted-foreground">Allow members to add new people</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${chat.groupSettings?.canMembersInvite ? 'bg-primary' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${chat.groupSettings?.canMembersInvite ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Members can pin messages</p>
                      <p className="text-sm text-muted-foreground">Allow members to pin important messages</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${chat.groupSettings?.canMembersPin ? 'bg-primary' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${chat.groupSettings?.canMembersPin ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full text-red-600 border-red-200">
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Group
                  </Button>
                  {isCreator && (
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Group
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup, activeWorkspace }: any) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [groupSettings, setGroupSettings] = useState({
    canMembersInvite: true,
    canMembersPin: false,
    isPrivate: false
  });

  if (!isOpen) return null;

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      onCreateGroup({
        name: groupName,
        description: groupDescription,
        members: selectedMembers,
        settings: groupSettings
      });
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      setGroupSettings({
        canMembersInvite: true,
        canMembersPin: false,
        isPrivate: false
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Create Group Chat</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-96">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Group Name</label>
            <Input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full"
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description (Optional)</label>
            <Textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              className="w-full"
              rows={3}
            />
          </div>

          {/* Add Members */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Add Members</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {mockAvailableUsers.map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => handleMemberToggle(user.id)}
                    className="w-4 h-4 text-primary"
                  />
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    data-ai-hint="person user"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Group Settings */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Group Settings</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Members can invite others</p>
                  <p className="text-xs text-muted-foreground">Allow members to add new people</p>
                </div>
                <button
                  onClick={() => setGroupSettings(prev => ({ ...prev, canMembersInvite: !prev.canMembersInvite }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${groupSettings.canMembersInvite ? 'bg-primary' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${groupSettings.canMembersInvite ? 'translate-x-5' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Private group</p>
                  <p className="text-xs text-muted-foreground">Only invited members can join</p>
                </div>
                <button
                  onClick={() => setGroupSettings(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${groupSettings.isPrivate ? 'bg-primary' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${groupSettings.isPrivate ? 'translate-x-5' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className="flex-1"
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChatContactsList = ({ chats, selectedChat, onChatSelect, searchTerm, onSearchChange, activeWorkspace, onNewChat }: any) => {
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);

  const filteredChats = chats.filter((chat: any) =>
    chat.workspaceId === activeWorkspace.id &&
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChatIcon = (chat: any) => {
    if (chat.type === 'workflow') {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-blue-500" />
        </div>
      );
    }
    if (chat.type === 'group') {
      return chat.avatar ?
        <Image src={chat.avatar} alt={chat.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" data-ai-hint="people group" /> :
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>;
    }
    return <Image src={chat.avatar} alt={chat.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" data-ai-hint="person user" />;
  };

  const handleNewChatAction = (action: string) => {
    setShowNewChatMenu(false);
    if (action === 'group') {
      setShowCreateGroup(true);
    } else {
      onNewChat(action);
    }
  };

  const handleCreateGroup = (groupData: any) => {
    console.log('Creating group:', groupData);
    // Here you would typically call an API to create the group
  };

  return (
    <div className="flex flex-col h-full bg-card relative">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
            className="flex items-center gap-3 hover:bg-secondary rounded-lg p-2 transition-colors"
          >
            <Image
              src={activeWorkspace.avatar}
              alt={activeWorkspace.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
              data-ai-hint="logo company"
            />
            <div className="text-left">
              <p className="font-semibold text-foreground">{activeWorkspace.name}</p>
              <p className="text-sm text-muted-foreground">{activeWorkspace.role}</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNewChatMenu(!showNewChatMenu)}
            >
              <Plus className="w-5 h-5" />
            </Button>
            
            {showNewChatMenu && (
              <div className="absolute top-10 right-0 bg-card border shadow-lg rounded-lg py-2 z-10 min-w-48">
                <button
                  onClick={() => handleNewChatAction('direct')}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary w-full text-left"
                >
                  <MessageSquare className="w-4 h-4" />
                  New Direct Message
                </button>
                <button
                  onClick={() => handleNewChatAction('group')}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary w-full text-left"
                >
                  <Users className="w-4 h-4" />
                  Create Group Chat
                </button>
              </div>
            )}
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e: any) => onSearchChange(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-11 pr-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat: any) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className={`flex items-center gap-4 p-4 hover:bg-secondary cursor-pointer transition-colors border-b ${selectedChat?.id === chat.id ? 'bg-secondary' : ''}`}
          >
            <div className="relative">
              {getChatIcon(chat)}
              {chat.isOnline && chat.type === 'direct' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
              )}
              {chat.isPinned && (
                <Pin className="absolute -top-1 -right-1 w-4 h-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate text-lg">{chat.name}</h3>
                  {chat.type === 'group' && chat.groupSettings?.isPrivate && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{chat.lastMessageTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <div className="w-6 h-6 bg-primary text-primary-foreground text-sm rounded-full flex items-center justify-center ml-3 font-medium">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
              {chat.type === 'group' && (
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{chat.members} members</p>
                </div>
              )}
              {chat.type === 'workflow' && (
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-blue-600">Workflow notifications</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No chats found</p>
            <p className="text-sm">Try changing your search or start a new conversation</p>
          </div>
        )}
      </div>

      {/* Workspace Switcher Overlay */}
      <WorkspaceSwitcher
        workspaces={mockWorkspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={(workspace: any) => {
          console.log('Switch to workspace:', workspace);
        }}
        isOpen={showWorkspaceSwitcher}
        onToggle={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
};

const MessageBubble = ({ message, isOwn, onReply, onReact }: any) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="break-words">
            {message.content.split(' ').map((word: string, index: number) => {
              if (word.startsWith('@')) {
                return <span key={index} className="text-blue-600 font-medium bg-blue-100 px-1 rounded">{word} </span>;
              }
              return word + ' ';
            })}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{message.fileData.name}</p>
              <p className="text-sm text-gray-500">{message.fileData.size}</p>
            </div>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );

      case 'system':
        return (
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{message.content}</p>
              {message.systemData && (
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    View Task
                  </Button>
                  <Button size="sm">
                    Take Action
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>{message.content}</div>;
    }
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="max-w-md">
          {renderMessageContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <Image
          src={message.senderAvatar}
          alt={message.senderName}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
          data-ai-hint="person user"
        />
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : ''}`}>
        {!isOwn && (
          <p className="text-xs text-muted-foreground mb-1">{message.senderName}</p>
        )}

        <div
          className={`relative rounded-2xl px-4 py-2 ${isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground'
            }`}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowContextMenu(!showContextMenu);
          }}
        >
          {message.replyTo && (
            <div className={`text-xs mb-2 p-2 rounded border-l-2 ${isOwn ? 'bg-blue-400 border-white' : 'bg-gray-200 border-gray-400'
              }`}>
              <p className="opacity-75">Replying to message</p>
            </div>
          )}

          {renderMessageContent()}

          <div className={`flex items-center justify-between mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-muted-foreground'
            }`}>
            <span>{formatTime(message.timestamp)}</span>
            <div className="flex items-center gap-1">
              {isOwn && (
                <>
                  {message.isRead ? (
                    <CheckCheck className="w-3 h-3" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction: any, index: number) => (
              <button
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                title={reaction.users.join(', ')}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {showContextMenu && (
          <div className="absolute right-0 mt-1 bg-card rounded-lg shadow-lg border py-1 z-10">
            <button
              onClick={() => onReply(message)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-secondary w-full text-left"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button
              onClick={() => onReact(message, '👍')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-secondary w-full text-left"
            >
              <span>👍</span>
              React
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary w-full text-left">
              <Forward className="w-4 h-4" />
              Forward
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary w-full text-left">
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatHeader = ({ chat, onBack, onShowInfo }: any) => {
  const isMobile = useIsMobile();
  const getChatAvatar = () => {
    if (chat.type === 'workflow') {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
      );
    }
    if (chat.type === 'group') {
      return chat.avatar ?
        <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" data-ai-hint="logo company" /> :
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>;
    }
    if (chat.avatar) {
      return <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" data-ai-hint="logo company" />;
    }
    return (
      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
        <Users className="w-5 h-5 text-white" />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button onClick={onBack} className="p-1 hover:bg-secondary rounded-lg">
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
        )}
        <div 
          className="relative cursor-pointer"
          onClick={() => chat.type === 'group' && onShowInfo?.()}
        >
          {getChatAvatar()}
          {chat.isOnline && chat.type === 'direct' && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
          )}
        </div>
        <div 
          className="cursor-pointer"
          onClick={() => chat.type === 'group' && onShowInfo?.()}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{chat.name}</h3>
            {chat.type === 'group' && chat.groupSettings?.isPrivate && (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {chat.type === 'direct' && chat.isOnline && 'Online'}
            {chat.type === 'group' && `${chat.members} members`}
            {chat.type === 'workflow' && 'Workflow notifications'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {chat.type === 'direct' && (
          <>
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}
        {chat.type === 'group' && (
          <Button variant="ghost" size="sm" onClick={onShowInfo}>
            <Info className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply, chat }: any) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, replyingTo);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle @mentions for group chats
    if (chat?.type === 'group') {
      const lastWord = value.split(' ').pop() || '';
      if (lastWord.startsWith('@')) {
        setMentionQuery(lastWord.slice(1));
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
        setMentionQuery('');
      }
    }
  };

  const handleMentionSelect = (member: any) => {
    const words = message.split(' ');
    words[words.length - 1] = `@${member.name}`;
    setMessage(words.join(' ') + ' ');
    setShowMentionDropdown(false);
    setMentionQuery('');
  };

  const emojis = ['😀', '😂', '😍', '👍', '👏', '🎉', '❤️', '🔥', '💪', '👌'];

  const filteredMembers = chat?.type === 'group' && mentionQuery
    ? mockGroupMembers.filter((member: any) =>
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : [];

  return (
    <div className="p-4 border-t bg-card">
      {replyingTo && (
        <div className="flex items-center justify-between p-3 mb-2 bg-secondary rounded-lg">
          <div className="flex items-center gap-2">
            <Reply className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Replying to {replyingTo.senderName}</span>
          </div>
          <button onClick={onCancelReply}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 relative">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              console.log('File selected:', e.target.files?.[0]);
            }}
          />
        </div>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              chat?.type === 'group' 
                ? `Message ${chat.name}... (use @ to mention)`
                : "Type a message..."
            }
            className="w-full p-3 pr-12 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Mention Dropdown */}
          {showMentionDropdown && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 bg-card border shadow-lg rounded-lg py-2 z-10 min-w-48 max-w-64">
              {filteredMembers.map((member: any) => (
                <button
                  key={member.id}
                  onClick={() => handleMentionSelect(member)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-secondary w-full text-left"
                >
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                    data-ai-hint="person user"
                  />
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 bg-card rounded-lg shadow-lg border p-3">
              <div className="grid grid-cols-5 gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessage(message + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl hover:bg-secondary rounded p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {message.trim() ? (
            <Button
              onClick={handleSend}
              className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => setIsRecording(!isRecording)}
              variant="ghost"
              size="icon"
              className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ chat, messages, onSendMessage, onBack }: any) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = (message: any) => {
    setReplyingTo(message);
  };

  const handleReact = (message: any, emoji: string) => {
    console.log('React to message:', message.id, 'with:', emoji);
  };

  const handleSendMessage = (content: string, replyTo: any) => {
    onSendMessage(content, replyTo);
    setReplyingTo(null);
  };

  const handleMemberAction = (action: string, data: any) => {
    console.log('Member action:', action, data);
    // Handle member actions (add, remove, etc.)
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader 
        chat={chat} 
        onBack={onBack} 
        onShowInfo={() => setShowGroupInfo(true)}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message: any) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === mockUser.id}
            onReply={handleReply}
            onReact={handleReact}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        chat={chat}
      />

      {/* Group Info Modal */}
      <GroupInfoModal
        chat={chat}
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        onMemberAction={handleMemberAction}
        currentUser={mockUser}
      />
    </div>
  );
};

const MainContent = ({activeTab, selectedChat, setSelectedChat, activeWorkspace, onSendMessage, onNewChat}: any) => {
    const isMobile = useIsMobile();
    
    // For mobile, we only show one view at a time
    if (isMobile) {
        switch (activeTab) {
            case 'chats':
                return selectedChat ? (
                    <ChatInterface
                        chat={selectedChat}
                        messages={mockMessages}
                        onSendMessage={onSendMessage}
                        onBack={() => setSelectedChat(null)}
                    />
                ) : (
                    <ChatContactsList
                        chats={mockChats}
                        selectedChat={selectedChat}
                        onChatSelect={setSelectedChat}
                        searchTerm={""}
                        onSearchChange={() => {}}
                        activeWorkspace={activeWorkspace}
                        onNewChat={onNewChat}
                    />
                );
            case 'tasks':
                return <TasksView activeWorkspace={activeWorkspace} />;
            case 'settings':
                return <SettingsView activeWorkspace={activeWorkspace} />;
            default:
                return (
                    <div className="flex-1 flex items-center justify-center bg-background">
                        <div className="text-center">
                            <p className="text-muted-foreground">Select a tab to continue</p>
                        </div>
                    </div>
                );
        }
    }
    
    // For desktop, we can have a two-pane layout
    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="w-full md:w-1/3 xl:w-1/4 border-r">
                <ChatContactsList
                    chats={mockChats}
                    selectedChat={selectedChat}
                    onChatSelect={setSelectedChat}
                    searchTerm={""}
                    onSearchChange={() => {}}
                    activeWorkspace={activeWorkspace}
                    onNewChat={onNewChat}
                />
            </div>
            <div className="flex-1 hidden md:flex flex-col">
                {selectedChat ? (
                    <ChatInterface
                        chat={selectedChat}
                        messages={mockMessages}
                        onSendMessage={onSendMessage}
                        onBack={() => setSelectedChat(null)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-background">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium text-muted-foreground">Select a chat to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TasksView = ({ activeWorkspace }: any) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showNewTask, setShowNewTask] = useState(false);

  const filteredTasks = filterStatus === 'all'
    ? mockWorkspaceTasks
    : mockWorkspaceTasks.filter(task => task.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <div className="px-2 py-1 text-xs font-bold text-green-800 bg-green-200 rounded-full">COMPLETED</div>;
      case 'in_progress': return <div className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-200 rounded-full">IN PROGRESS</div>;
      case 'awaiting_approval': return <div className="px-2 py-1 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full">AWAITING APPROVAL</div>;
      case 'assigned': return <div className="px-2 py-1 text-xs font-bold text-gray-800 bg-gray-200 rounded-full">ASSIGNED</div>;
      default: return null;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'medium': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'low': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default: return null;
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };


  const handleBackToList = () => {
    setSelectedTask(null);
    setShowNewTask(false);
  };

  const handleNewTask = () => {
    setShowNewTask(true);
    setSelectedTask(null);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'awaiting_approval': return 'bg-yellow-500 text-white';
      case 'assigned': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Main Task List View
  if (!selectedTask && !showNewTask) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Tasks</h2>
              <p className="text-sm text-muted-foreground">{activeWorkspace.name}</p>
            </div>
            <Button size="sm" onClick={handleNewTask}>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'assigned', 'in_progress', 'awaiting_approval', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="p-4 border-b hover:bg-secondary cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{task.workflow}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm">Try changing the filter or create a new task</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Task Detail View
  if (selectedTask) {
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBackToList} className="p-2 hover:bg-secondary rounded-lg">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">Task Details</h2>
            </div>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          </div>

          {/* Status - Primary */}
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedTask.status)}`}>
            {selectedTask.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        {/* Task Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{selectedTask.title}</h3>
            <p className="text-muted-foreground">{selectedTask.description}</p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workflow</label>
                <p className="text-foreground font-medium">{selectedTask.workflow}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assignee</label>
                <p className="text-foreground font-medium">{selectedTask.assignee}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</label>
                <p className="text-foreground font-medium">{selectedTask.dueDate}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Step</label>
                <p className="text-blue-600 font-medium">{selectedTask.currentStep}</p>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-3 h-3 rounded-full ${selectedTask.priority === 'high' ? 'bg-red-500' :
                  selectedTask.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
              <span className="font-medium text-foreground capitalize">{selectedTask.priority}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-3">
              {selectedTask.status === 'assigned' && selectedTask.assignee === 'You' && (
                <>
                  <Button className="flex-1">
                    <Play className="w-4 h-4" />
                    Start Task
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4" />
                    Discuss
                  </Button>
                </>
              )}

              {selectedTask.status === 'awaiting_approval' && (
                <>
                  <Button variant="success" className="flex-1">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                </>
              )}

              {selectedTask.status === 'in_progress' && (
                <Button className="flex-1">
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New Task View
  if (showNewTask) {
    return <NewTaskView onBack={handleBackToList} activeWorkspace={activeWorkspace} />;
  }
  return null;
};

const NewTaskView = ({ onBack, activeWorkspace }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workflow: '',
    assignee: '',
    priority: 'medium',
    dueDate: ''
  });

  const workflows = [
    'Document Review & Approval',
    'Invoice Processing Pipeline',
    'Customer Onboarding Flow',
    'Content Creation Workflow'
  ];

  const teamMembers = [
    'Sarah Wilson',
    'Mike Chen',
    'Emma Davis',
    'You'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating task:', formData);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">New Task</h2>
            <p className="text-sm text-muted-foreground">{activeWorkspace.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Title</label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the task"
            rows={3}
          />
        </div>

        {/* Workflow */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Workflow</label>
          <select
            value={formData.workflow}
            onChange={(e) => handleInputChange('workflow', e.target.value)}
            className="w-full p-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          >
            <option value="">Select workflow</option>
            {workflows.map(workflow => (
              <option key={workflow} value={workflow}>{workflow}</option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Assign to</label>
          <select
            value={formData.assignee}
            onChange={(e) => handleInputChange('assignee', e.target.value)}
            className="w-full p-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          >
            <option value="">Select assignee</option>
            {teamMembers.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
          <div className="flex gap-3">
            {['low', 'medium', 'high'].map(priority => (
              <button
                key={priority}
                type="button"
                onClick={() => handleInputChange('priority', priority)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${formData.priority === priority
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input hover:bg-secondary'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${priority === 'high' ? 'bg-red-500' :
                    priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                <span className="capitalize font-medium">{priority}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const SettingsView = ({ activeWorkspace }: any) => {
  const [notifications, setNotifications] = useState({
    messages: true,
    taskUpdates: true,
    workflowNotifications: true,
    mentions: true,
    sound: true
  });

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b">
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">{activeWorkspace.name}</p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="bg-card border-b p-4">
          <h3 className="font-medium text-foreground mb-4">Profile</h3>
          <div className="flex items-center gap-4">
            <Image
              src={mockUser.avatar}
              alt={mockUser.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
              data-ai-hint="person user"
            />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{mockUser.name}</h4>
              <p className="text-sm text-muted-foreground">{mockUser.email}</p>
              <p className="text-xs text-muted-foreground">{activeWorkspace.role} in {activeWorkspace.name}</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border-b p-4">
          <h3 className="font-medium text-foreground mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'messages', label: 'New Messages', desc: 'Get notified when you receive new messages' },
              { key: 'taskUpdates', label: 'Task Updates', desc: 'Notifications for task status changes' },
              { key: 'workflowNotifications', label: 'Workflow Alerts', desc: 'Automated workflow notifications' },
              { key: 'mentions', label: 'Mentions', desc: 'When someone mentions you in a chat' },
              { key: 'sound', label: 'Sound', desc: 'Play notification sounds' }
            ].map((setting: any) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">{setting.desc}</p>
                </div>
                <button
                  onClick={() => handleNotificationChange(setting.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(notifications as any)[setting.key] ? 'bg-primary' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(notifications as any)[setting.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Settings */}
        <div className="bg-card border-b p-4">
          <h3 className="font-medium text-foreground mb-4">Chat Settings</h3>
          <div className="space-y-3">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <Archive className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Archived Chats</p>
                <p className="text-sm text-muted-foreground">View archived conversations</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <Download className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Export Chat Data</p>
                <p className="text-sm text-muted-foreground">Download your chat history</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Privacy Settings</p>
                <p className="text-sm text-muted-foreground">Control who can message you</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Workspace Actions */}
        <div className="bg-card border-b p-4">
          <h3 className="font-medium text-foreground mb-4">Workspace</h3>
          <div className="space-y-3">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Team Members</p>
                <p className="text-sm text-muted-foreground">See who's in this workspace</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Active Workflows</p>
                <p className="text-sm text-muted-foreground">View assigned workflows</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Switch Workspace</p>
                <p className="text-sm text-muted-foreground">Change to another workspace</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-card p-4">
          <h3 className="font-medium text-foreground mb-4">Help & Support</h3>
          <div className="space-y-3">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Help Center</span>
            </button>

            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Contact Support</span>
            </button>

            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors text-red-600">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Chat App Component
export default function SocketChatApp() {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState(mockWorkspaces[0]);
  const [activeTab, setActiveTab] = useState('chats');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Auto-select the first chat on desktop if none is selected
    if (!isMobile && !selectedChat && mockChats.length > 0) {
      setSelectedChat(mockChats[0]);
    }
    // If we go to mobile view, and a chat is selected, we want to keep it
    // if we go to desktop from mobile, and no chat is selected, select one.
    if (!isMobile && !selectedChat) {
      setSelectedChat(mockChats[0]);
    }

  }, [isMobile, selectedChat]);


  const handleSendMessage = (content: string, replyTo: any) => {
    const newMessage = {
      id: Date.now(),
      senderId: mockUser.id,
      senderName: mockUser.name,
      senderAvatar: mockUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: false,
      replyTo: replyTo?.id
    };

    console.log('Sending message:', newMessage);
    // This is where you would typically add the new message to your state
  };

  const handleNewChat = () => {
    console.log('New chat action');
  };

  return (
    <div className="h-screen flex flex-col bg-card">
      <div className="flex-1 flex overflow-hidden">
        <MainContent 
            activeTab={activeTab}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            activeWorkspace={activeWorkspace}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
        />
      </div>
      {isMobile && <TabBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
