"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { 
  QrCode, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  User, 
  Shield,
  Copy,
  Trash2,
  RefreshCw,
  RotateCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import type { InvitationCodeDisplay } from '../../../lib/types/invitation';
import { 
  getPartnerInvitationCodesAction, 
  cancelInvitationCodeAction,
  regenerateInvitationCodeAction,
  getInvitationStatsAction
} from '../../../actions/partner-invitation-management';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface InvitationManagementProps {
  partnerId: string;
  refreshTrigger: number;
}

export default function InvitationManagement({ partnerId, refreshTrigger }: InvitationManagementProps) {
  const [invitations, setInvitations] = useState<InvitationCodeDisplay[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: 'cancel' | 'regenerate' | null;
    invitation: InvitationCodeDisplay | null;
  }>({ type: null, invitation: null });
  const { toast } = useToast();

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      // Load invitations and stats in parallel
      const [invitationsResult, statsResult] = await Promise.all([
        getPartnerInvitationCodesAction(partnerId),
        getInvitationStatsAction(partnerId)
      ]);

      if (invitationsResult.success && invitationsResult.invitations) {
        setInvitations(invitationsResult.invitations);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load invitations",
          description: invitationsResult.message
        });
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invitation data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      loadInvitations();
    }
  }, [partnerId, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Invitation code ${code} copied to clipboard`
    });
  };

  const handleCancelInvitation = async () => {
    if (!actionDialog.invitation) return;

    try {
      const result = await cancelInvitationCodeAction(partnerId, actionDialog.invitation.id);
      if (result.success) {
        toast({
          title: "Invitation Cancelled",
          description: result.message
        });
        loadInvitations();
      } else {
        toast({
          variant: "destructive",
          title: "Cancellation Failed",
          description: result.message
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel invitation"
      });
    } finally {
      setActionDialog({ type: null, invitation: null });
    }
  };

  const handleRegenerateCode = async () => {
    if (!actionDialog.invitation) return;

    setRegeneratingId(actionDialog.invitation.id);
    try {
      const result = await regenerateInvitationCodeAction(partnerId, actionDialog.invitation.id);
      if (result.success && result.newInvitationCode) {
        toast({
          title: "New Code Generated!",
          description: `New invitation code: ${result.newInvitationCode}`
        });
        // Automatically copy the new code
        navigator.clipboard.writeText(result.newInvitationCode);
        loadInvitations();
      } else {
        toast({
          variant: "destructive",
          title: "Regeneration Failed",
          description: result.message
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate code"
      });
    } finally {
      setRegeneratingId(null);
      setActionDialog({ type: null, invitation: null });
    }
  };

  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    return hoursLeft <= 24 && hoursLeft > 0;
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{stats?.accepted || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{stats?.expired || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{stats?.cancelled || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invitation Codes ({invitations.length})</CardTitle>
            <Button variant="outline" onClick={loadInvitations} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Invitations Yet</h3>
              <p className="text-muted-foreground">
                Generate invitation codes to invite team members to your workspace
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const expiringSoon = isExpiringSoon(invitation.expiresAt);
                const expired = isExpired(invitation.expiresAt);
                
                return (
                  <div 
                    key={invitation.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      expiringSoon && invitation.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''
                    } ${
                      expired && invitation.status === 'pending' ? 'border-red-200 bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{invitation.name}</h4>
                          {getStatusBadge(invitation.status)}
                          {expiringSoon && invitation.status === 'pending' && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Expires Soon
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {invitation.phoneNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {invitation.role}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {invitation.status === 'pending' 
                              ? `Expires ${invitation.expiresAt.toLocaleDateString()}`
                              : invitation.status === 'accepted'
                              ? `Joined ${invitation.acceptedAt?.toLocaleDateString()}`
                              : `Created ${invitation.createdAt.toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <div className="text-right mr-4">
                            <div className="font-mono font-bold text-lg">{invitation.invitationCode}</div>
                            <div className="text-xs text-muted-foreground">Invitation Code</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCode(invitation.invitationCode)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActionDialog({ type: 'regenerate', invitation })}
                            disabled={regeneratingId === invitation.id}
                          >
                            {regeneratingId === invitation.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCw className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActionDialog({ type: 'cancel', invitation })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {invitation.status === 'accepted' && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">✓ Joined Team</div>
                          <div className="text-xs text-muted-foreground">
                            {invitation.acceptedAt?.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialogs */}
      <AlertDialog 
        open={actionDialog.type === 'cancel'} 
        onOpenChange={() => setActionDialog({ type: null, invitation: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation for {actionDialog.invitation?.name}? 
              This action cannot be undone and the invitation code will no longer be valid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvitation}>
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={actionDialog.type === 'regenerate'} 
        onOpenChange={() => setActionDialog({ type: null, invitation: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Invitation Code</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new invitation code for {actionDialog.invitation?.name} and invalidate the current one. 
              The new code will be automatically copied to your clipboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Current Code</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateCode}>
              Generate New Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}