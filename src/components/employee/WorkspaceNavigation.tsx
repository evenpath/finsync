"use client";

import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Settings, 
  LogOut,
  Briefcase
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import JoinWorkspaceDialog from './JoinWorkspaceDialog';
import type { WorkspaceAccess } from '../../lib/types';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../lib/firebase';

interface WorkspaceNavigationProps {
  workspaces: WorkspaceAccess[];
  currentWorkspace: WorkspaceAccess | null;
  onWorkspaceSwitch: (workspace: WorkspaceAccess) => void;
  onJoinSuccess: () => void;
}

const WorkspaceAvatar = ({ workspace, isActive }: { workspace: WorkspaceAccess, isActive: boolean }) => {
  const initial = workspace.partnerName.charAt(0).toUpperCase();
  
  return (
    <div className="relative group">
      <div 
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 cursor-pointer ${
          isActive 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 group-hover:rounded-lg'
        }`}
      >
        {initial}
      </div>
      {isActive && (
        <div className="absolute -right-1 top-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
      
      {/* Tooltip */}
      <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {workspace.partnerName}
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </div>
  );
};

export default function WorkspaceNavigation({ 
  workspaces, 
  currentWorkspace, 
  onWorkspaceSwitch, 
  onJoinSuccess 
}: WorkspaceNavigationProps) {
  const { toast } = useToast();
  const auth = getAuth(app);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      window.location.href = '/login';
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Unable to sign out. Please try again."
      });
    }
  };

  return (
    <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-3">
      {/* App Logo */}
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
        <Briefcase className="w-6 h-6 text-white" />
      </div>
      
      {/* Divider */}
      <div className="w-8 h-px bg-gray-300 mb-1"></div>

      {/* Workspaces */}
      <div className="flex flex-col gap-2">
        {workspaces.map((workspace) => (
          <div
            key={workspace.partnerId}
            onClick={() => onWorkspaceSwitch(workspace)}
          >
            <WorkspaceAvatar 
              workspace={workspace} 
              isActive={currentWorkspace?.partnerId === workspace.partnerId}
            />
          </div>
        ))}
      </div>

      {/* Add Workspace Button */}
      <JoinWorkspaceDialog
        trigger={
          <div className="relative group">
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-100">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </div>
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Join Workspace
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        }
        onSuccess={onJoinSuccess}
      />

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2">
        {/* Settings */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-xl p-0 hover:bg-gray-200"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </Button>
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Settings
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-xl p-0 hover:bg-red-100 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
          </Button>
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Sign Out
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
