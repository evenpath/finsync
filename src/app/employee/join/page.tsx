"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from '../../../hooks/use-auth';
import { validateInvitationCodeAction, joinWorkspaceWithCodeAction } from '../../../actions/employee-invitation-actions';
import { Ticket, Loader2, ArrowRight, Building2, User, Clock, CheckCircle, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type InvitationPreview = {
  partnerName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
  phoneNumber?: string;
};

export default function JoinWorkspacePage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
    if (!user || !user.phoneNumber) {
      toast({ 
        variant: 'destructive', 
        title: 'Authentication Required', 
        description: 'Please sign in with your phone number first.' 
      });
      router.push('/login');
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
        setSuccess(true);
        toast({
          title: "Welcome to the Team! 🎉",
          description: `You've successfully joined ${result.workspace?.partnerName}`,
        });
        
        // Wait a moment for the user to see the success state
        setTimeout(() => {
          router.push('/employee');
          router.refresh(); // Force refresh to update user claims
        }, 2000);
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Join Failed', 
          description: result.message 
        });
        setError(result.message);
      }
    } catch (e: any) {
      const errorMsg = e.message || 'An unexpected error occurred';
      toast({ variant: 'destructive', title: 'Error', description: errorMsg });
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInviteCode('');
    setPreview(null);
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
            <p className="text-muted-foreground mb-4">
              You've successfully joined {preview?.partnerName}. 
              Redirecting to your dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Loading your workspace...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Dashboard (if user has existing workspaces) */}
        <div className="text-center">
          <Link href="/employee" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Ticket className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Join a Workspace</CardTitle>
            <CardDescription>
              Enter the 8-character invitation code from your employer to join their workspace.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Invitation Code Input */}
            <div className="space-y-4">
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
                    className="pl-4 font-mono text-lg tracking-widest text-center"
                    maxLength={8}
                    disabled={isValidating || isLoading || !!preview}
                  />
                </div>
                <Button
                  onClick={handleValidateCode}
                  disabled={inviteCode.length !== 8 || isValidating || !!preview}
                  variant="outline"
                  size="lg"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Invitation Preview */}
            {preview && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">{preview.partnerName}</h3>
                      <p className="text-sm text-green-700">
                        Invited by {preview.inviterName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Role: {preview.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(preview.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Number Verification */}
                {user?.phoneNumber && preview.phoneNumber && user.phoneNumber !== preview.phoneNumber && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This invitation was sent to {preview.phoneNumber}, 
                      but you're signed in as {user.phoneNumber}. Please verify this is correct.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Change Code
                  </Button>
                  <Button
                    onClick={handleJoinWorkspace}
                    disabled={isLoading}
                    className="flex-1"
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
                </div>
              </div>
            )}
          </CardContent>

          {/* Help Section */}
          <CardFooter className="border-t bg-muted/30">
            <div className="w-full text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Don't have an invitation code?
              </p>
              <p className="text-xs text-muted-foreground">
                Contact your organization's admin to request access to their workspace.
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Workspace Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Plus className="w-4 h-4" />
                <span>You can join multiple workspaces</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Switch between different organizations from your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}