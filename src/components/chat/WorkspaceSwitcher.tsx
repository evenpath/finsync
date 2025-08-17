"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronDown, Building2, Check, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';

interface Workspace {
  id: string;
  name: string;
  partnerId: string;
  role: string;
  memberCount?: number;
  status?: 'active' | 'inactive';
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
}

export default function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onWorkspaceChange
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'partner_admin':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkspaceInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 border-b bg-card">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-3 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getWorkspaceInitials(activeWorkspace.name)}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">
                  {activeWorkspace.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getRoleBadgeColor(activeWorkspace.role)}`}
                  >
                    {activeWorkspace.role.replace('_', ' ')}
                  </Badge>
                  {activeWorkspace.memberCount && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {activeWorkspace.memberCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80" align="start">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Your Workspaces
            </div>
            
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                className="p-3 cursor-pointer"
                onClick={() => {
                  onWorkspaceChange(workspace);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {getWorkspaceInitials(workspace.name)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {workspace.name}
                      </span>
                      {workspace.id === activeWorkspace.id && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getRoleBadgeColor(workspace.role)}`}
                      >
                        {workspace.role.replace('_', ' ')}
                      </Badge>
                      
                      {workspace.memberCount && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {workspace.memberCount} members
                        </div>
                      )}
                      
                      {workspace.status && (
                        <div className={`w-2 h-2 rounded-full ${
                          workspace.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="p-3 cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Building2 className="w-4 h-4 mr-2" />
              Join Another Workspace
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
