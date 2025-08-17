"use client";

import React, { useState } from 'react';
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { RefreshCw, Copy, Loader2, AlertCircle } from 'lucide-react';

interface InvitationCodesListProps {
  partnerId: string;
}

// Mock invitation codes data
const mockInvitations = [
  {
    id: '1',
    code: 'ABC123',
    phoneNumber: '+1 (555) 123-4567',
    role: 'employee' as const,
    status: 'pending' as const,
    createdAt: new Date('2024-08-15'),
    expiresAt: new Date('2024-08-22'),
    createdBy: 'admin'
  },
  {
    id: '2',
    code: 'XYZ789',
    phoneNumber: '+1 (555) 987-6543',
    role: 'partner_admin' as const,
    status: 'accepted' as const,
    createdAt: new Date('2024-08-10'),
    expiresAt: new Date('2024-08-17'),
    createdBy: 'admin',
    usedAt: new Date('2024-08-12')
  },
  {
    id: '3',
    code: 'DEF456',
    phoneNumber: '+1 (555) 456-7890',
    role: 'employee' as const,
    status: 'expired' as const,
    createdAt: new Date('2024-08-01'),
    expiresAt: new Date('2024-08-08'),
    createdBy: 'admin'
  }
];

export default function InvitationCodesList({ partnerId }: InvitationCodesListProps) {
  const [invitations] = useState(mockInvitations);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ 
      title: 'Copied to clipboard!',
      description: `Invitation code ${code} copied to clipboard.`
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Refreshed',
        description: 'Invitation codes have been refreshed.'
      });
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'accepted': return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'expired': return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled': return <Badge variant="outline">Cancelled</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'partner_admin': return <Badge variant="default">Admin</Badge>;
      case 'employee': return <Badge variant="secondary">Employee</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading invitations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invitation Codes</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No invitation codes</h3>
          <p className="text-muted-foreground">
            Create invitation codes to allow team members to join your workspace.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Phone Number</TableHead>
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
                    <div className="font-mono font-medium">{invitation.code}</div>
                  </TableCell>
                  <TableCell>{invitation.phoneNumber}</TableCell>
                  <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(invitation.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(invitation.expiresAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(invitation.code)}
                      disabled={invitation.status === 'expired'}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}