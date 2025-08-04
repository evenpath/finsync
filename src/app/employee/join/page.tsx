// src/app/employee/join/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { validateInvitationCodeAction, joinWorkspaceWithCodeAction } from '@/actions/employee-invitation-actions';
import { Ticket, Loader2, ArrowRight, Building2, User, Clock } from 'lucide-react';

type InvitationPreview = {
  partnerName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
};

export default function JoinWorkspacePage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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
      } else {
        setError(result.message);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinWorkspace = async () => {
    if (!user || !user.phoneNumber) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not verify your phone number.' });
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
          title: "Success!",
          description: `You have successfully joined ${result.workspace?.partnerName}. Redirecting...`,
        });
        // Redirect to the main employee dashboard, which will now have the new workspace.
        router.push('/employee');
        router.refresh(); // Force a refresh to update user claims and workspace context
      } else {
        toast({ variant: 'destructive', title: 'Could not join workspace', description: result.message });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            Join a Workspace
          </CardTitle>
          <CardDescription>
            Enter the 8-character invitation code from your employer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="inviteCode">Invitation Code</Label>
              <Input
                id="inviteCode"
                placeholder="ABC123DE"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError(null);
                  setPreview(null);
                }}
                className="pl-4 font-mono text-lg tracking-widest"
                maxLength={8}
                disabled={isValidating || isLoading}
              />
            </div>
            <Button
              onClick={handleValidateCode}
              disabled={inviteCode.length !== 8 || isValidating || !!preview}
              variant="outline"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Validate"
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          {preview && (
            <Card className="bg-secondary">
              <CardHeader>
                <CardTitle className="text-lg">Invitation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>Join <span className="font-semibold">{preview.partnerName}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Invited by <span className="font-semibold">{preview.inviterName}</span></span>
                </div>
                 <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Expires on {new Date(preview.expiresAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleJoinWorkspace}
            disabled={!preview || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Accept Invitation & Join
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
