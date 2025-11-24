
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { AppHeader } from '@/app/components/layout/header';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { useApp } from '@/app/context/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag, ShieldQuestion, Moon, Sun, Laptop, Download, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

function UserProfile() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-20 w-20 border">
                    <AvatarImage src="https://picsum.photos/seed/user1/100/100" data-ai-hint="person" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-2xl">CreativeEye</CardTitle>
                    <CardDescription>Critique Ratio: 1.2 | Member Since: 2024</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><ShieldQuestion size={18} /> AI-Generated Alignment</h4>
                    <div className="flex gap-2">
                        <Badge variant="secondary">Chaotic Good</Badge>
                        <Badge variant="outline">The Maverick Mentor</Badge>
                    </div>
                     <p className="text-sm text-muted-foreground mt-2">Provides insightful but unconventional feedback, always with the goal of helping the artist grow.</p>
                </div>
                <div>
                    <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><Tag size={18} /> AI-Generated Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        <Badge>#StreetPhotography</Badge>
                        <Badge>#Monochrome</Badge>
                        <Badge>#HighContrast</Badge>
                        <Badge>#Constructive</Badge>
                        <Badge>#Conceptual</Badge>
                    </div>
                </div>
                <Button className="w-full" variant="outline">Edit Profile (Coming Soon)</Button>
            </CardContent>
        </Card>
    );
}

function AccountSettings() {
    const { setTheme } = useTheme();

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground mb-2">Select your preferred color scheme.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setTheme('light')}><Sun className="mr-2" /> Light</Button>
                            <Button variant="outline" onClick={() => setTheme('dark')}><Moon className="mr-2" /> Dark</Button>
                            <Button variant="outline" onClick={() => setTheme('system')}><Laptop className="mr-2" /> System</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account details and settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="CreativeEye" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="creative@example.com" disabled />
                    </div>
                     <Separator />
                     <div className="space-y-4">
                        <h4 className="font-medium">Data Management</h4>
                        <div>
                             <Button variant="outline"><Download className="mr-2" /> Export All Data</Button>
                             <p className="text-sm text-muted-foreground mt-2">Export all your galleries, images, and critiques as a zip file. (Coming Soon)</p>
                        </div>
                        <div>
                            <Button variant="destructive"><Trash2 className="mr-2" /> Delete Account</Button>
                            <p className="text-sm text-muted-foreground mt-2">Permanently delete your account and all associated data. This action cannot be undone. (Coming Soon)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="user-critique-notifications" className="text-base">User Critiques</Label>
                            <p className="text-sm text-muted-foreground">Receive a notification when another user critiques your gallery.</p>
                        </div>
                        <Switch id="user-critique-notifications" disabled />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="community-updates-notifications" className="text-base">Community Updates</Label>
                            <p className="text-sm text-muted-foreground">Get updates on new features and community highlights.</p>
                        </div>
                        <Switch id="community-updates-notifications" disabled />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProfilePage() {
  const {
    currentTheme,
    isInstagramConnected,
    handleConnectInstagram,
    savedGalleries,
    handleSelectGallery,
  } = useApp();

  const handleConnectGoogleDrive = () => {}; // Placeholder

  return (
    <ResizablePanelGroup direction="horizontal" className="flex min-h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} collapsible>
        <AppSidebar
          onCreateGallery={() => {}}
          currentTheme={currentTheme}
          isInstagramConnected={isInstagramConnected}
          onConnectInstagram={handleConnectInstagram}
          onConnectGoogleDrive={handleConnectGoogleDrive}
          savedGalleries={savedGalleries}
          onSelectGallery={handleSelectGallery}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="flex flex-col h-full">
            <AppHeader
            theme={null}
            hasCritiques={false}
            onAddImages={() => {}}
            onCritiqueGallery={() => {}}
            onShowGalleryCritique={() => {}}
            onExport={() => {}}
            onSaveGallery={() => {}}
            onShowReport={() => {}}
            isGalleryCritiqueLoading={false}
            hasExistingGalleryCritique={false}
            />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <div className="space-y-4 max-w-4xl mx-auto">
                    <header>
                        <h1 className="text-2xl font-bold tracking-tight">My Profile & Settings</h1>
                        <p className="text-muted-foreground">Manage your profile and account settings.</p>
                    </header>
                    
                    <Tabs defaultValue="profile">
                        <TabsList className="grid w-full grid-cols-2 max-w-md">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile" className="mt-4">
                            <UserProfile />
                        </TabsContent>
                        <TabsContent value="settings" className="mt-4">
                            <AccountSettings />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
