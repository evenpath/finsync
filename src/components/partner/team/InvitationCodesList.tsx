// src/components/partner/team/InvitationCodesList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getPartnerInvitationCodesAction, cancelInvitationCodeAction, regenerateInvitationCodeAction } from '@/actions/partner-invitation-management';
import type { InvitationCodeDisplay } from '@/lib/types/invitation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    toast({ title: 'Copied to clipboard!', description: code });
  };
  
  const handleCancel = async (invitationId: string) => {
      const result = await cancelInvitationCodeAction(invitationId, partnerId);
      if(result.success) {
          toast({title: "Invitation Cancelled", description: result.message});
          fetchInvitations();
      } else {
          toast({variant: "destructive", title: "Error", description: result.message});
      }
  }
  
  const handleRegenerate = async (invitationId: string) => {
      const result = await regenerateInvitationCodeAction(invitationId, partnerId);
       if(result.success) {
          toast({title: "Invitation Regenerated", description: `New code: ${result.newInvitationCode}`});
          fetchInvitations();
      } else {
          toast({variant: "destructive", title: "Error", description: result.message});
      }
  }

  const getStatusBadge = (status: InvitationCodeDisplay['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted': return <Badge variant="secondary" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'expired': return <Badge variant="outline">Expired</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center gap-2 p-4 bg-destructive/10 rounded-md">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invitee</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No invitations found.
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <div className="font-medium">{invite.name}</div>
                    <div className="text-sm text-muted-foreground">{invite.phoneNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{invite.invitationCode}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(invite.invitationCode)}>
                                    <Copy className="w-3 h-3"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy code</TooltipContent>
                        </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invite.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {invite.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleRegenerate(invite.id)}>
                                        <RefreshCw className="w-4 h-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Regenerate Code</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleCancel(invite.id)}>
                                        <X className="w-4 h-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel Invitation</TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
