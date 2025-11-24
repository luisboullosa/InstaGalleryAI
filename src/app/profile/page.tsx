
'use client';

import * as React from 'react';
import { AppHeader } from '@/app/components/layout/header';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { useApp } from '@/app/context/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function UserProfile() {
    return (
        <Card className="max-w-2xl mx-auto">
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
                <div className="space-y-4">
                    <header>
                        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
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
                            <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle>Account Settings</CardTitle>
                                    <CardDescription>Update your account preferences.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-8 border rounded-lg bg-muted/50 text-center flex flex-col justify-center items-center">
                                        <p className="text-sm text-muted-foreground">Account settings will appear here.</p>
                                        <p className="text-xs text-muted-foreground mt-1">This feature is coming soon!</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
