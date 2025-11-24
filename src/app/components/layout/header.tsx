'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Theme } from '@/lib/types';
import { FileText, Instagram, LogOut, Settings, User, Bot, PlusCircle, Save, Download, Eye } from 'lucide-react';

type AppHeaderProps = {
  theme: Theme | null;
  onShowReport: () => void;
  hasCritiques: boolean;
  onCritiqueGallery: () => void;
  onShowGalleryCritique: () => void;
  hasExistingGalleryCritique: boolean;
  isGalleryCritiqueLoading: boolean;
  onAddImages: () => void;
  onSaveGallery: () => void;
  onExport: () => void;
};

export function AppHeader({ theme, onShowReport, hasCritiques, onCritiqueGallery, onShowGalleryCritique, hasExistingGalleryCritique, isGalleryCritiqueLoading, onAddImages, onSaveGallery, onExport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          {theme ? (
            <>
              <span className="text-muted-foreground">Gallery:</span> {theme.name}
            </>
          ) : (
            'Dashboard'
          )}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {theme && (
            <>
                <Button variant="outline" size="sm" onClick={onAddImages}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Images
                </Button>

                {hasExistingGalleryCritique ? (
                  <Button variant="outline" size="sm" onClick={onShowGalleryCritique}>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Critique
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={onCritiqueGallery} disabled={isGalleryCritiqueLoading}>
                    {isGalleryCritiqueLoading ? (
                        <>
                        <Bot className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                        </>
                    ) : (
                        <>
                        <Bot className="mr-2 h-4 w-4" />
                        Critique Gallery
                        </>
                    )}
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={onSaveGallery}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                </Button>
                <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </>
        )}
        {hasCritiques && (
          <Button variant="outline" size="sm" onClick={onShowReport}>
            <FileText className="mr-2 h-4 w-4" />
            View Report
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/avatar/100/100" alt="@shadcn" data-ai-hint="person" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Instagram className="mr-2" />
              <span>Instagram</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
