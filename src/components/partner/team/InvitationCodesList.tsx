// src/components/partner/team/InvitationCodesList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getPartnerInvitationCodesAction } from '../../actions/partner-invitation-management';
import type { InvitationCodeDisplay } from '../../lib/types/invitation';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { RefreshCw, X, Copy, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InvitationCodesListProps {
  partnerId: string;
}

export default function InvitationCodesList({ partnerId }: InvitationCodesListProps) {
  const [invitations, setInvitations] = useState<InvitationCodeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvitations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPartnerInvitationCodesAction(partnerId);
      if (result.success && result.invitations) {
        setInvitations(result.invitations);
        setError(null);
      } else {
        setError(result.message);
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch invitations.' });
    } finally {
      setIsLoading(false);
    }
  }, [partnerId, toast]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to clipboard!' });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'accepted': return 'success';
      case 'expired': return 'destructive';
      case 'revoked': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading invitations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={fetchInvitations}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No invitation codes found.</p>
        <Button variant="outline" onClick={fetchInvitations}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} found
        </p>
        <Button variant="outline" size="sm" onClick={fetchInvitations}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                    {invitation.invitationCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(invitation.invitationCode)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invitation.name}</p>
                  <p className="text-sm text-muted-foreground">{invitation.phoneNumber}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {invitation.role === 'partner_admin' ? 'Admin' : 'Employee'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(invitation.status)}>
                  {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(invitation.createdAt, { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell>
                {invitation.status === 'pending' && (
                  <Button variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {invitation.status === 'accepted' && invitation.acceptedAt && (
                  <span className="text-xs text-muted-foreground">
                    Accepted {formatDistanceToNow(invitation.acceptedAt, { addSuffix: true })}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
