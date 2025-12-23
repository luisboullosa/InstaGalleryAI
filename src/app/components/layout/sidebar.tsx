
'use client';

import {
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ThemeCreator } from '@/app/components/theme-creator';
import type { Theme, SavedGallery } from '@/lib/types';
import { Home, Instagram, FolderKanban, Library, Users, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

type AppSidebarProps = {
  onCreateGallery: (theme: Theme) => void;
  currentTheme: Theme | null;
  isInstagramConnected: boolean;
  onConnectInstagram: () => Promise<void>;
  isInstagramConnecting: boolean;
  isGoogleDriveConnected: boolean;
  onConnectGoogleDrive: () => void;
  savedGalleries: SavedGallery[];
  onSelectGallery: (gallery: SavedGallery) => void;
};

export function AppSidebar({ onCreateGallery, currentTheme, isInstagramConnected, isInstagramConnecting, onConnectInstagram, isGoogleDriveConnected, onConnectGoogleDrive, savedGalleries, onSelectGallery }: AppSidebarProps) {
  const pathname = usePathname();
  
  const isHomePage = pathname === '/';
  const isAgentsPage = pathname === '/agents';
  const isCommunityPage = pathname === '/community';

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold">InstaGalleryAI</span>
        </div>
      </SidebarHeader>
      <ScrollArea>
        <div className="p-2">
          <ThemeCreator onCreateGallery={onCreateGallery} isInstagramConnected={isInstagramConnected} />
        </div>

        <SidebarSeparator className="my-2" />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="w-full">
                <SidebarMenuButton tooltip="Dashboard" isActive={isHomePage && !currentTheme}>
                    <Home />
                    <span>Dashboard</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          {savedGalleries.length > 0 && (
            <SidebarMenuItem>
                <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground/80">My Galleries</h3>
                {savedGalleries.map(gallery => (
                    <SidebarMenuButton 
                        key={gallery.id}
                        tooltip={gallery.theme.name}
                        isActive={isHomePage && currentTheme?.name === gallery.theme.name}
                        onClick={() => onSelectGallery(gallery)}
                    >
                        <Library />
                        <span>{gallery.theme.name}</span>
                    </SidebarMenuButton>
                ))}
            </SidebarMenuItem>
          )}
           <SidebarMenuItem>
                <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground/80">Social & Settings</h3>
                 <Link href="/agents" className="w-full">
                    <SidebarMenuButton tooltip="Agents" isActive={isAgentsPage}>
                        <Users />
                        <span>AI Agents</span>
                    </SidebarMenuButton>
                </Link>
                <Link href="/community" className="w-full">
                    <SidebarMenuButton tooltip="Community" isActive={isCommunityPage}>
                        <MessageSquareQuote />
                        <span>Community</span>
                    </SidebarMenuButton>
                </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </ScrollArea>

      <SidebarFooter>
        <div className="space-y-2 p-2">
          <Button
            onClick={onConnectInstagram}
            variant={isInstagramConnected ? 'secondary' : 'outline'}
            className="w-full justify-start gap-2"
            disabled={isInstagramConnected || isInstagramConnecting}
          >
            <Instagram />
            <span>
              {isInstagramConnected
                ? 'Instagram Connected'
                : isInstagramConnecting
                  ? 'Connecting…'
                  : 'Connect Instagram'}
            </span>
          </Button>
          <Button onClick={onConnectGoogleDrive} variant={isGoogleDriveConnected ? 'secondary' : 'outline'} className="w-full justify-start gap-2" disabled={isGoogleDriveConnected}>
            <FolderKanban />
            <span>{isGoogleDriveConnected ? 'Drive Connected' : 'Connect Google Drive'}</span>
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
