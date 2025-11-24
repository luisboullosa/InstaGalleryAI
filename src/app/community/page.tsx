
'use client';

import * as React from 'react';
import { AppHeader } from '@/app/components/layout/header';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { useApp } from '@/app/context/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tag, ShieldQuestion, Swords, Scale, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

function UserProfileCard() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border">
                    <AvatarImage src="https://picsum.photos/seed/user1/100/100" data-ai-hint="person" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle>CreativeEye</CardTitle>
                    <CardDescription>Critique Ratio: 1.2 | Member Since: 2024</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><ShieldQuestion size={16} /> AI-Generated Alignment</h4>
                    <div className="flex gap-2">
                        <Badge variant="secondary">Chaotic Good</Badge>
                        <Badge variant="outline">The Maverick Mentor</Badge>
                    </div>
                     <p className="text-xs text-muted-foreground mt-2">Provides insightful but unconventional feedback, always with the goal of helping the artist grow.</p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Tag size={16} /> AI-Generated Tags</h4>
                    <div className="flex flex-wrap gap-1">
                        <Badge>#StreetPhotography</Badge>
                        <Badge>#Monochrome</Badge>
                        <Badge>#HighContrast</Badge>
                        <Badge>#Constructive</Badge>
                        <Badge>#Conceptual</Badge>
                    </div>
                </div>
                <Button className="w-full" disabled>View Profile (Coming Soon)</Button>
            </CardContent>
        </Card>
    );
}


export default function CommunityPage() {
  const {
    currentTheme,
    isInstagramConnected,
    handleConnectInstagram,
    savedGalleries,
    handleSelectGallery,
    isGoogleDriveConnected,
    handleConnectGoogleDrive,
  } = useApp();

  return (
    <ResizablePanelGroup direction="horizontal" className="flex min-h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} collapsible>
        <AppSidebar
          onCreateGallery={() => {}}
          currentTheme={currentTheme}
          isInstagramConnected={isInstagramConnected}
          onConnectInstagram={handleConnectInstagram}
          isGoogleDriveConnected={isGoogleDriveConnected}
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
                        <h1 className="text-2xl font-bold tracking-tight">Community Hub</h1>
                        <p className="text-muted-foreground">Critique, explore, and connect with other artists.</p>
                    </header>
                    
                    <Tabs defaultValue="explore">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="explore"><Swords className="mr-2" /> Explore Critiques</TabsTrigger>
                            <TabsTrigger value="my-critiques" disabled>
                                <div className="flex items-center gap-2">
                                    <Scale />
                                    <span>My User Critiques</span>
                                    <Badge variant="secondary" className="gap-1 pl-2">
                                        <Lock size={12} />
                                        Pro
                                    </Badge>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="explore" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Explore Public Galleries</CardTitle>
                                    <CardDescription>Discover galleries from other users seeking feedback. You must receive a critique before you can give one.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <UserProfileCard />
                                    <div className="p-8 border rounded-lg bg-muted/50 text-center flex flex-col justify-center items-center col-span-2">
                                        <p className="text-sm text-muted-foreground">More user profiles will appear here.</p>
                                        <p className="text-xs text-muted-foreground mt-1">This feature is coming soon!</p>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="my-critiques" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Critiques on Your Galleries</CardTitle>
                                    <CardDescription>See feedback from other users you've requested critiques from.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-8 border rounded-lg bg-muted/50 text-center flex flex-col justify-center items-center">
                                        <p className="text-sm text-muted-foreground">When you request user critiques, they will appear here.</p>
                                        <p className="text-xs text-muted-foreground mt-1">This is a pro feature!</p>
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
