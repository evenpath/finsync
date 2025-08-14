
"use client";

import React, { useState } from 'react';
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus, Building, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (partnerData: { name: string; email: string; }) => Promise<void>;
}

export default function AddPartnerModal({ isOpen, onClose, onAdd }: AddPartnerModalProps) {
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({ name: partnerName.trim(), email: email.trim() });
      // The parent component now controls closing the modal on success.
      // We clear the form for the next use if successful.
      setPartnerName('');
      setEmail('');
    } catch (error) {
      console.error("Error in modal submission:", error);
      // Parent component will show a toast.
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      setPartnerName('');
      setEmail('');
      onClose();
    }
  };

  const isValid = partnerName.trim().length > 0 && email.trim().length > 0 && email.includes('@');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserPlus className="w-5 h-5" />
              Create New Partner
            </DialogTitle>
            <DialogDescription>
              Set up a new partner organization with their own workspace and tenant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will create a new Firebase tenant and an admin user account for the partner.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Organization Name
              </Label>
              <Input
                id="name"
                name="name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g., Sunnyvale Properties LLC"
                required
                disabled={isSubmitting}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                This will be used as the business name and tenant display name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Admin Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sunnyvaleproperties.com"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                This person will become the Partner Admin with full workspace access.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
