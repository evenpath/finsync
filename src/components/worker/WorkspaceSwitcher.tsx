
import React, { useState } from 'react';
import { Briefcase, ChevronsUpDown, PlusCircle, Check, Building, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMultiWorkspaceAuth } from '@/hooks/use-multi-workspace-auth';

const WorkspaceAvatar = ({ workspace, size = 'md' }: { workspace: any, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold`}>
      {workspace.partnerName?.charAt(0)?.toUpperCase() || workspace.partnerId?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

const WorkspaceDropdown = ({ 
  isOpen, 
  onClose, 
  workspaces, 
  currentWorkspace, 
  onWorkspaceSwitch, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  workspaces: any[];
  currentWorkspace: any;
  onWorkspaceSwitch: (partnerId: string) => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Building className="w-4 h-4" />
          Switch Workspace
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          You have access to {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="py-2">
        {workspaces.map((workspace) => {
          const isActive = currentWorkspace?.partnerId === workspace.partnerId;
          
          return (
            <button
              key={workspace.partnerId}
              onClick={() => {
                if (!isActive && !isLoading) {
                  onWorkspaceSwitch(workspace.partnerId);
                }
                onClose();
              }}
              disabled={isLoading}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors relative ${
                isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <WorkspaceAvatar workspace={workspace} size="md" />
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{workspace.partnerName || `Partner ${workspace.partnerId}`}</p>
                  {isActive && <Check className="w-4 h-4 text-blue-500" />}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={workspace.role === 'partner_admin' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {workspace.role === 'partner_admin' ? 'Admin' : 'Employee'}
                  </Badge>
                  
                  {workspace.status === 'invited' && (
                    <Badge variant="outline" className="text-xs">
                      Invited
                    </Badge>
                  )}
                </div>
              </div>
              
              {(workspace.unreadCount || 0) > 0 && (
                <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {workspace.unreadCount > 99 ? '99+' : workspace.unreadCount}
                </div>
              )}
            </button>
          );
        })}
        
        {workspaces.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            <Building className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No workspaces available</p>
            <p className="text-xs text-gray-400 mt-1">Contact an admin to get invited to a workspace</p>
          </div>
        )}
      </div>
      
      <div className="border-t p-3">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          onClick={() => {
            // TODO: Implement join workspace functionality
            onClose();
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Join Another Workspace
        </button>
      </div>
    </div>
  );
};

export default function EnhancedWorkspaceSwitcher() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  
  const {
    user,
    loading,
    currentWorkspace,
    availableWorkspaces,
    switchWorkspace,
    hasAccessToPartner,
  } = useMultiWorkspaceAuth();

  const handleWorkspaceSwitch = async (partnerId: string) => {
    if (isSwitching || !hasAccessToPartner(partnerId)) return;
    
    setIsSwitching(true);
    try {
      const success = await switchWorkspace(partnerId);
      if (success) {
        console.log(`Switched to workspace: ${partnerId}`);
      } else {
        console.error('Failed to switch workspace');
      }
    } catch (error) {
      console.error('Error switching workspace:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || availableWorkspaces.length === 0) {
    return (
      <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4">
        <div className="p-2 rounded-lg bg-gray-300 text-gray-500">
          <Briefcase className="w-6 h-6" />
        </div>
        <div className="text-center text-xs text-gray-500 px-2">
          No workspaces
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-20 bg-white border-r flex flex-col items-center py-4 gap-4">
      {/* App Logo/Brand */}
      <div className="p-2 rounded-lg bg-blue-600 text-white mb-4">
        <Briefcase className="w-6 h-6" />
      </div>

      {/* Current Workspace */}
      {currentWorkspace && (
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`relative transition-all duration-200 ${
            isDropdownOpen ? 'rounded-xl' : 'rounded-full'
          } hover:rounded-xl group`}
          title={`Current: ${currentWorkspace.partnerName || currentWorkspace.partnerId}`}
        >
          <WorkspaceAvatar workspace={currentWorkspace} size="md" />
          
          {/* Active indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          
          {/* Dropdown indicator */}
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronsUpDown className="w-2 h-2" />
          </div>
        </button>
      )}

      {/* Other Available Workspaces (Quick Access) */}
      <div className="flex flex-col gap-2">
        {availableWorkspaces
          .filter(w => w.partnerId !== currentWorkspace?.partnerId)
          .slice(0, 3) // Show max 3 quick access workspaces
          .map((workspace) => (
            <button
              key={workspace.partnerId}
              onClick={() => handleWorkspaceSwitch(workspace.partnerId)}
              disabled={isSwitching}
              className="relative group transition-all duration-200 rounded-full hover:rounded-xl disabled:opacity-50"
              title={workspace.partnerName || workspace.partnerId}
            >
              <WorkspaceAvatar workspace={workspace} size="md" />
              
              {workspace.status === 'invited' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 border border-white rounded-full"></div>
              )}
              
              {isSwitching && (
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
      </div>

      {/* More Workspaces / Settings */}
      {availableWorkspaces.length > 4 && (
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-12 h-12 mt-4 text-gray-400 hover:text-gray-600 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-full flex items-center justify-center transition-colors"
          title="More workspaces"
        >
          <ChevronsUpDown className="w-4 h-4" />
        </button>
      )}

      {/* Join Workspace Button */}
      <button
        className="w-12 h-12 mt-auto text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
        title="Join Workspace"
        onClick={() => {
          console.log('Join workspace clicked');
        }}
      >
        <PlusCircle className="w-5 h-5" />
      </button>

      {/* Workspace Dropdown */}
      <WorkspaceDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        workspaces={availableWorkspaces}
        currentWorkspace={currentWorkspace}
        onWorkspaceSwitch={handleWorkspaceSwitch}
        isLoading={isSwitching}
      />

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
