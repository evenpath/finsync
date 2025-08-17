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
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Plus, Building2, Check, Loader2, Ticket, User, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { validateInvitationCodeAction, joinWorkspaceWithCodeAction } from '../../actions/employee-invitation-actions';

interface JoinWorkspaceDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type InvitationPreview = {
  partnerName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
  phoneNumber?: string;
};

export default function JoinWorkspaceDialog({ trigger, onSuccess }: JoinWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleValidateCode = async () => {
    if (inviteCode.length !== 8) {
      setError("Please enter a valid 8-character code.");
      return;
    }

    setIsValidating(true);
    setError(null);
    setPreview(null);
    
    try {
      const result = await validateInvitationCodeAction(inviteCode);
      if (result.success && result.invitation) {
        setPreview(result.invitation);
        setError(null);
      } else {
        setError(result.message);
        setPreview(null);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to validate invitation code');
      setPreview(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinWorkspace = async () => {
    if (!user?.uid || !user?.phoneNumber) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to join a workspace."
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await joinWorkspaceWithCodeAction({
        invitationCode: inviteCode,
        phoneNumber: user.phoneNumber,
        uid: user.uid,
      });

      if (result.success) {
        toast({
          title: "Workspace Joined! 🎉",
          description: `Welcome to ${result.workspace?.partnerName}`
        });
        
        setOpen(false);
        handleReset();
        onSuccess?.();
        
        // Refresh to update workspace context
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.message);
        toast({
          variant: "destructive",
          title: "Failed to Join",
          description: result.message
        });
      }

    } catch (error: any) {
      console.error("Error joining workspace:", error);
      const errorMsg = error.message || "An unexpected error occurred";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInviteCode('');
    setPreview(null);
    setError(null);
    setIsValidating(false);
    setIsLoading(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <Plus className="w-4 h-4 mr-2" />
      Join Workspace
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Join Workspace
          </DialogTitle>
          <DialogDescription>
            Enter your 8-character invitation code to join a new workspace.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Code Input */}
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invitation Code</Label>
            <div className="flex gap-2">
              <Input
                id="invite-code"
                placeholder="ABC123DE"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError(null);
                  setPreview(null);
                }}
                className="font-mono text-center tracking-widest"
                maxLength={8}
                disabled={isValidating || isLoading || !!preview}
                autoFocus
              />
              {!preview && (
                <Button
                  onClick={handleValidateCode}
                  disabled={inviteCode.length !== 8 || isValidating}
                  variant="outline"
                  size="sm"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Invitation Preview */}
          {preview && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">{preview.partnerName}</h3>
                  <p className="text-sm text-green-700">
                    Invited by {preview.inviterName}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-green-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {preview.role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires {new Date(preview.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone number verification warning */}
              {user?.phoneNumber && preview.phoneNumber && user.phoneNumber !== preview.phoneNumber && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ This invitation was sent to {preview.phoneNumber}, but you're signed in as {user.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          )}
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
          
          {preview ? (
            <Button 
              onClick={handleJoinWorkspace} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleValidateCode}
              disabled={inviteCode.length !== 8 || isValidating}
              variant="secondary"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate Code'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simplified MenuItem version for dropdowns
 */
export function JoinWorkspaceMenuItem({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <JoinWorkspaceDialog
      trigger={
        <div className="flex items-center cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Join Workspace
        </div>
      }
      onSuccess={onSuccess}
    />
  );
}