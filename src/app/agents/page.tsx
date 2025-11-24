'use client';

import * as React from 'react';
import { AppHeader } from '@/app/components/layout/header';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useApp } from '@/app/context/app-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

export default function AgentsPage() {
  const {
    agents,
    toggleAgent,
    currentTheme,
    isInstagramConnected,
    handleConnectInstagram,
    savedGalleries,
    handleSelectGallery,
  } = useApp();

  const handleConnectGoogleDrive = () => {}; // Placeholder

  return (
    <div className="flex min-h-screen">
      <Sidebar variant="sidebar" collapsible="icon">
        <AppSidebar
          onCreateGallery={() => {}}
          currentTheme={currentTheme}
          isInstagramConnected={isInstagramConnected}
          onConnectInstagram={handleConnectInstagram}
          onConnectGoogleDrive={handleConnectGoogleDrive}
          savedGalleries={savedGalleries}
          onSelectGallery={handleSelectGallery}
        />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader
          theme={null}
          hasCritiques={false}
          onAddImages={() => {}}
          onCritiqueGallery={() => {}}
          onExport={() => {}}
          onSaveGallery={() => {}}
          onShowReport={() => {}}
          isGalleryCritiqueLoading={false}
        />
        <main className="flex-1 p-4 md:p-6">
            <div className="space-y-4">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight">Agent Management</h1>
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
      </SidebarInset>
    </div>
  );
}
