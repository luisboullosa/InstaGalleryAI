
'use client';

import * as React from 'react';
import { AppHeader } from '@/app/components/layout/header';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { useApp } from '@/app/context/app-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function AgentsPage() {
  const {
    agents,
    toggleAgent,
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
                        <h1 className="text-2xl font-bold tracking-tight">AI Agent Management</h1>
                        <p className="text-muted-foreground">Activate or deactivate AI critics for your gallery reviews.</p>
                    </header>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Object.values(agents).map((agent) => (
                            <Card key={agent.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                                        <CardDescription>{agent.description}</CardDescription>
                                    </div>
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={agent.avatar} data-ai-hint="person" />
                                        <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id={`agent-switch-${agent.id}`}
                                                checked={agent.active}
                                                onCheckedChange={() => toggleAgent(agent.id)}
                                                disabled={agent.pro}
                                            />
                                            <Label htmlFor={`agent-switch-${agent.id}`} className="cursor-pointer">
                                                {agent.active ? 'Active' : 'Inactive'}
                                            </Label>
                                        </div>
                                        {agent.pro && (
                                            <Badge variant="secondary" className="gap-1 pl-2">
                                                <Lock size={12} />
                                                Pro
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
