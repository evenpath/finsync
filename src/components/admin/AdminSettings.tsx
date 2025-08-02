"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Database,
  Upload,
  RotateCcw,
  AlertTriangle,
  FileText,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input id="systemName" type="text" defaultValue="Suupe.com" />
            </div>
            <div>
              <Label>Default Partner Limits</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="maxWorkflows" className="text-xs text-muted-foreground">Max Workflows</Label>
                  <Input id="maxWorkflows" type="number" defaultValue="20" />
                </div>
                <div>
                  <Label htmlFor="maxUsers" className="text-xs text-muted-foreground">Max Users</Label>
                  <Input id="maxUsers" type="number" defaultValue="100" />
                </div>
              </div>
            </div>
            <div>
              <Label>Security Settings</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="2fa" className="flex flex-col space-y-1">
                    <span>Require 2FA for admin accounts</span>
                  </Label>
                  <Switch id="2fa" defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                   <Label htmlFor="auditLog" className="flex flex-col space-y-1">
                    <span>Enable audit logging</span>
                  </Label>
                  <Switch id="auditLog" defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                   <Label htmlFor="autoExpire" className="flex flex-col space-y-1">
                    <span>Auto-expire inactive sessions</span>
                  </Label>
                  <Switch id="autoExpire" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="aiModel">Default AI Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger id="aiModel">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                  <SelectItem value="gemini-pro">Gemini 1.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label>Rate Limits</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="block text-xs text-muted-foreground mb-1">Requests per minute</Label>
                    <Input type="number" defaultValue="1000" />
                  </div>
                  <div>
                    <Label className="block text-xs text-muted-foreground mb-1">Tokens per day</Label>
                    <Input type="number" defaultValue="1000000" />
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start"><Database className="w-4 h-4 mr-2" />Backup Database</Button>
            <Button variant="outline" className="w-full justify-start"><Upload className="w-4 h-4 mr-2" />Import Data</Button>
            <Button variant="outline" className="w-full justify-start"><RotateCcw className="w-4 h-4 mr-2" />Reset Cache</Button>
            <Button variant="destructive" className="w-full justify-start"><AlertTriangle className="w-4 h-4 mr-2" />System Maintenance</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Support & Docs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" />Admin Documentation</Button>
            <Button variant="ghost" className="w-full justify-start"><ExternalLink className="w-4 h-4 mr-2" />API Reference</Button>
            <Button variant="ghost" className="w-full justify-start"><Shield className="w-4 h-4 mr-2" />Security Guidelines</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
