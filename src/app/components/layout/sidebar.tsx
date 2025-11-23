'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ThemeCreator } from '@/app/components/theme-creator';
import type { Theme } from '@/lib/types';
import { Bell, Home, Instagram } from 'lucide-react';

type AppSidebarProps = {
  onCreateGallery: (theme: Theme) => void;
  currentTheme: Theme | null;
};

export function AppSidebar({ onCreateGallery, currentTheme }: AppSidebarProps) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold">InstaGalleryAI</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <ThemeCreator onCreateGallery={onCreateGallery} />
        <SidebarSeparator className="my-4" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Dashboard" isActive>
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Notifications">
              <Bell />
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Connect Instagram" variant="outline">
              <Instagram />
              <span>Connect Instagram</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
