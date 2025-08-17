"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
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
  X
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import BottomNavigation from '../../../components/navigation/BottomNavigation';
import { useToast } from '../../../hooks/use-toast';

interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  joinDate: Date;
  workspaces: Array<{
    id: string;
    name: string;
    role: string;
    joinDate: Date;
  }>;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskAssignments: boolean;
  taskReminders: boolean;
  chatMessages: boolean;
  workspaceUpdates: boolean;
}

// Mock data - replace with real data from Firebase/API
const mockProfile: UserProfile = {
  displayName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Experienced developer with a passion for creating efficient solutions.',
  location: 'San Francisco, CA',
  joinDate: new Date('2023-06-15'),
  workspaces: [
    {
      id: '1',
      name: 'Acme Corp',
      role: 'employee',
      joinDate: new Date('2023-06-15')
    },
    {
      id: '2',
      name: 'TechStart Inc',
      role: 'employee',
      joinDate: new Date('2023-08-20')
    }
  ]
};

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  taskAssignments: true,
  taskReminders: true,
  chatMessages: false,
  workspaceUpdates: true
};

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotificationSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
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

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
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
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
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
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                      {(isEditing ? editedProfile : profile).displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {(isEditing ? editedProfile : profile).displayName}
                    </h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile.joinDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    {isEditing ? (
                      <Input
                        id="displayName"
                        value={editedProfile.displayName}
                        onChange={(e) => setEditedProfile(prev => ({
                          ...prev,
                          displayName: e.target.value
                        }))}
                      />
                    ) : (
                      <p className="p-2 text-foreground">{profile.displayName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="p-2 text-muted-foreground">{profile.email}</p>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                      />
                    ) : (
                      <p className="p-2 text-foreground">{profile.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile(prev => ({
                          ...prev,
                          location: e.target.value
                        }))}
                      />
                    ) : (
                      <p className="p-2 text-foreground">{profile.location}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        bio: e.target.value
                      }))}
                      rows={3}
                    />
                  ) : (
                    <p className="p-2 text-foreground">{profile.bio}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>Saving...</>
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
                      <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Task Assignments</h4>
                      <p className="text-sm text-muted-foreground">Notify when tasks are assigned to you</p>
                    </div>
                    <Switch
                      checked={notifications.taskAssignments}
                      onCheckedChange={(checked) => handleNotificationChange('taskAssignments', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Task Reminders</h4>
                      <p className="text-sm text-muted-foreground">Receive reminders for upcoming due dates</p>
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
                  {profile.workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{workspace.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">
                              {workspace.role.replace('_', ' ')}
                            </Badge>
                            <span>•</span>
                            <span>Joined {workspace.joinDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
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
                  
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
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
