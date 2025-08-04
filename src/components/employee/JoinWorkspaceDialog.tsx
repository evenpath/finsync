// src/components/employee/JoinWorkspaceDialog.tsx
"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Check, Loader2 } from 'lucide-react';
import { acceptWorkspaceInvitationAction } from '@/actions/workspace-actions';
import { useAuth } from '@/hooks/use-auth';

interface JoinWorkspaceDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function JoinWorkspaceDialog({ trigger, onSuccess }: JoinWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to join a workspace."
      });
      return;
    }

    if (!inviteCode.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid invitation code."
      });
      return;
    }

    setIsLoading(true);

    try {
      // For invite codes in format: PARTNER_ID-TENANT_ID or actual invitation IDs
      let invitationId = inviteCode.trim();
      
      // If it looks like a partner-tenant code, we'd need to look up the actual invitation
      // For now, we'll assume it's a direct invitation ID
      
      const result = await acceptWorkspaceInvitationAction(invitationId, user.uid);

      if (result.success) {
        toast({
          title: "Workspace Joined",
          description: result.message
        });
        
        setOpen(false);
        setInviteCode('');
        onSuccess?.();
        
        // Refresh the page to update workspace context
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Join",
          description: result.message
        });
      }

    } catch (error: any) {
      console.error("Error joining workspace:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Join Workspace
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleJoinWorkspace}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Join Workspace
            </DialogTitle>
            <DialogDescription>
              Enter the invitation code provided by your organization admin to join their workspace.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inviteCode">Invitation Code</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="ABC123-DEF456 or invitation ID"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">
                This code was provided by your organization admin via email, SMS, or in person.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !inviteCode.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Join Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simplified version for use in dropdowns/menus
 */
export function JoinWorkspaceMenuItem({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <JoinWorkspaceDialog
      trigger={
        <div className="flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          Join Workspace
        </div>
      }
      onSuccess={onSuccess}
    />
  );
}