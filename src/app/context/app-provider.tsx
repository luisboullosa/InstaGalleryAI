'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { defaultAgents } from '@/lib/agents';
import type { Agent, Critique, Critic, SavedGallery, Theme } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';

type AgentState = Record<Critic, Agent & { active: boolean }>;

type AppContextType = {
  currentTheme: Theme | null;
  setCurrentTheme: React.Dispatch<React.SetStateAction<Theme | null>>;
  galleryImages: ImagePlaceholder[];
  setGalleryImages: React.Dispatch<React.SetStateAction<ImagePlaceholder[]>>;
  critiques: Critique[];
  setCritiques: React.Dispatch<React.SetStateAction<Critique[]>>;
  isInstagramConnected: boolean;
  setIsInstagramConnected: React.Dispatch<React.SetStateAction<boolean>>;
  handleConnectInstagram: () => void;
  savedGalleries: SavedGallery[];
  setSavedGalleries: React.Dispatch<React.SetStateAction<SavedGallery[]>>;
  handleSaveGallery: (theme: Theme, images: ImagePlaceholder[], critiques: Critique[]) => void;
  handleSelectGallery: (gallery: SavedGallery) => void;
  agents: AgentState;
  toggleAgent: (agentId: Critic) => void;
};

const AppContext = React.createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<ImagePlaceholder[]>([]);
  const [critiques, setCritiques] = React.useState<Critique[]>([]);
  const [isInstagramConnected, setIsInstagramConnected] = React.useState(false);
  const [savedGalleries, setSavedGalleries] = React.useState<SavedGallery[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [agents, setAgents] = React.useState<AgentState>(() => {
    const initialAgents: Partial<AgentState> = {};
    defaultAgents.forEach(agent => {
        initialAgents[agent.id] = { ...agent, active: !agent.pro };
    });
    return initialAgents as AgentState;
  });

  const toggleAgent = (agentId: Critic) => {
    setAgents(prev => ({
        ...prev,
        [agentId]: { ...prev[agentId], active: !prev[agentId].active }
    }));
  };

  const handleConnectInstagram = () => {
    setIsInstagramConnected(true);
    toast({
      title: 'Instagram Connected',
      description: "You can now create galleries from your Instagram posts.",
    });
  };

  const handleSaveGallery = (theme: Theme, images: ImagePlaceholder[], critiques: Critique[]) => {
    const existingIndex = savedGalleries.findIndex(g => g.theme.name === theme.name);
    
    if (existingIndex > -1) {
        // Update existing gallery
        const updatedGalleries = [...savedGalleries];
        updatedGalleries[existingIndex] = { ...updatedGalleries[existingIndex], images, critiques };
        setSavedGalleries(updatedGalleries);
        toast({
            title: 'Gallery Updated',
            description: `"${theme.name}" has been updated.`,
        });
    } else {
        // Add new gallery
        const newSavedGallery: SavedGallery = {
            id: theme.name + '-' + Date.now(),
            theme: theme,
            images: images,
            critiques: critiques,
        };
        setSavedGalleries(prev => [...prev, newSavedGallery]);
        toast({
            title: 'Gallery Saved',
            description: `"${theme.name}" has been added to your collection.`,
        });
    }
  };

  const handleSelectGallery = (gallery: SavedGallery) => {
    setCurrentTheme(gallery.theme);
    setGalleryImages(gallery.images);
    setCritiques(gallery.critiques);
    router.push('/');
  };

  return (
    <AppContext.Provider value={{ 
        currentTheme, setCurrentTheme,
        galleryImages, setGalleryImages,
        critiques, setCritiques,
        isInstagramConnected, setIsInstagramConnected,
        handleConnectInstagram,
        savedGalleries, setSavedGalleries,
        handleSaveGallery,
        handleSelectGallery,
        agents,
        toggleAgent
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
