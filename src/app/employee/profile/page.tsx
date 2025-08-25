"use client";

import React, { useState } from 'react';
import { useMultiWorkspaceAuth } from '../../../hooks/use-multi-workspace-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Settings,
  Bell,
  Shield,
  LogOut,
  Edit3,
  Save,
  X,
  Camera,
  Loader2
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import EmployeeWorkspaceSwitcher from '../../../components/employee/EmployeeWorkspaceSwitcher';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import { useToast } from '../../../hooks/use-toast';

interface UserProfile {
  displayName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  location: string;
  avatar?: string;
  joinDate: Date;
  lastActiveAt: Date;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskAssignments: boolean;
  taskReminders: boolean;
  chatMessages: boolean;
  workspaceUpdates: boolean;
}

export default function EmployeeProfilePage() {
  const { user, loading, currentWorkspace, availableWorkspaces, switchWorkspace, signOut } = useMultiWorkspaceAuth();
  const { toast } = useToast();
  
  // Initialize profile with user data
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: '',
    location: '',
    avatar: user?.photoURL || '',
    joinDate: new Date('2023-06-15'), // Mock data - replace with real data
    lastActiveAt: new Date()
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    taskAssignments: true,
    taskReminders: true,
    chatMessages: false,
    workspaceUpdates: true
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(editedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Auto-save notification settings
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved."
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Authentication Required</h2>
          <p className="text-gray-500">Please log in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <div className="border-b bg-background">
        <EmployeeWorkspaceSwitcher
          workspaces={availableWorkspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSwitch={switchWorkspace}
        />
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    size="sm"
                    onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                    disabled={isSaving}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-lg">
                        {profile.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile.displayName}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{currentWorkspace?.role || 'Employee'}</Badge>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={isEditing ? editedProfile.displayName : profile.displayName}
                      onChange={(e) => setEditedProfile(prev => ({...prev, displayName: e.target.value}))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled={true}
                      className="opacity-75"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={isEditing ? editedProfile.phoneNumber : profile.phoneNumber}
                      onChange={(e) => setEditedProfile(prev => ({...prev, phoneNumber: e.target.value}))}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={isEditing ? editedProfile.location : profile.location}
                      onChange={(e) => setEditedProfile(prev => ({...prev, location: e.target.value}))}
                      disabled={!isEditing}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? editedProfile.bio : profile.bio}
                    onChange={(e) => setEditedProfile(prev => ({...prev, bio: e.target.value}))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                
                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-sm text-muted-foreground">
                      {profile.joinDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Active</Label>
                    <p className="text-sm text-muted-foreground">
                      {profile.lastActiveAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Task Assignments</h4>
                      <p className="text-sm text-muted-foreground">Notify when new tasks are assigned</p>
                    </div>
                    <Switch
                      checked={notifications.taskAssignments}
                      onCheckedChange={(checked) => handleNotificationChange('taskAssignments', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Task Reminders</h4>
                      <p className="text-sm text-muted-foreground">Remind about upcoming deadlines</p>
                    </div>
                    <Switch
                      checked={notifications.taskReminders}
                      onCheckedChange={(checked) => handleNotificationChange('taskReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Chat Messages</h4>
                      <p className="text-sm text-muted-foreground">Notify for new chat messages</p>
                    </div>
                    <Switch
                      checked={notifications.chatMessages}
                      onCheckedChange={(checked) => handleNotificationChange('chatMessages', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Workspace Updates</h4>
                      <p className="text-sm text-muted-foreground">Notify for workspace announcements</p>
                    </div>
                    <Switch
                      checked={notifications.workspaceUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('workspaceUpdates', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  My Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableWorkspaces.map((workspace) => (
                    <div key={workspace.partnerId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{workspace.partnerName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">
                              {workspace.role?.replace('_', ' ')}
                            </Badge>
                            <span>•</span>
                            <span>Active workspace</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentWorkspace?.partnerId === workspace.partnerId && (
                          <Badge variant="default">Current</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    Join Another Workspace
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to sign out? You'll need to log in again to access your workspaces.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut}>
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation userRole="employee" />
    </div>
  );
}