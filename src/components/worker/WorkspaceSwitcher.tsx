
import React from 'react';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

const WorkspaceAvatar = ({ workspace, size = 'md' }: { workspace: any, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const workspaceName = workspace?.partnerName || 'Workspace';

  return (
    <div className={`${sizeClasses[size]} bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold`}>
      {workspaceName?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

export default function EnhancedWorkspaceSwitcher() {
  const { user, loading } = useAuth();

  const currentWorkspace = user?.customClaims ? {
    partnerId: user.customClaims.partnerId,
    tenantId: user.customClaims.tenantId,
    role: user.customClaims.role,
    partnerName: user.customClaims.partnerName || user.displayName,
  } : null;

  if (loading || !user) {
    return (
      <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="w-20 bg-gray-100 border-r flex flex-col items-center py-4 gap-4">
        <div className="p-2 rounded-lg bg-gray-300 text-gray-500">
          <Briefcase className="w-6 h-6" />
        </div>
        <div className="text-center text-xs text-gray-500 px-2">
          No Workspace
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-20 bg-white border-r flex flex-col items-center py-4 gap-4">
      <div className="p-2 rounded-lg bg-blue-600 text-white mb-4">
        <Briefcase className="w-6 h-6" />
      </div>

      <div
        className="relative group"
        title={`Current: ${currentWorkspace.partnerName || currentWorkspace.partnerId}`}
      >
        <WorkspaceAvatar workspace={currentWorkspace} size="md" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
}
