'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { defaultAgents } from '@/lib/agents';
import type { Agent, Critique, Critic, SavedGallery, Theme } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/types';
import { useRouter } from 'next/navigation';

type AgentState = Record<Critic, Agent & { active: boolean }>;
export type InstagramCollectionKey = 'posts' | 'stories' | 'highlights';
type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
};
type InstagramHighlightItem = {
  id: string;
  title?: string;
  cover_media?: {
    media_url?: string;
    thumbnail_url?: string;
    media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  };
};
type InstagramCollections = Record<InstagramCollectionKey, ImagePlaceholder[]>;

type AppContextType = {
  currentTheme: Theme | null;
  setCurrentTheme: React.Dispatch<React.SetStateAction<Theme | null>>;
  galleryImages: ImagePlaceholder[];
  setGalleryImages: React.Dispatch<React.SetStateAction<ImagePlaceholder[]>>;
  critiques: Critique[];
  setCritiques: React.Dispatch<React.SetStateAction<Critique[]>>;
  isInstagramConnected: boolean;
  isInstagramConnecting: boolean;
  handleConnectInstagram: () => Promise<void>;
  handleDisconnectInstagram: () => void;
  instagramCollections: InstagramCollections | null;
  instagramProfileImage: string | null;
  activeInstagramCollection: InstagramCollectionKey;
  setActiveInstagramCollection: React.Dispatch<React.SetStateAction<InstagramCollectionKey>>;
  isGoogleDriveConnected: boolean;
  handleConnectGoogleDrive: () => void;
  handleDisconnectGoogleDrive: () => void;
  savedGalleries: SavedGallery[];
  handleSaveGallery: (theme: Theme, images: ImagePlaceholder[], critiques: Critique[]) => void;
  handleSelectGallery: (gallery: SavedGallery) => void;
  agents: AgentState;
  toggleAgent: (agentId: Critic) => void;
  // Local auth
  currentUser: string | null;
  registerLocalUser: (username: string, password: string) => Promise<boolean>;
  loginLocalUser: (username: string, password: string) => Promise<boolean>;
  logoutLocalUser: () => void;
};

const AppContext = React.createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<ImagePlaceholder[]>([]);
  const [critiques, setCritiques] = React.useState<Critique[]>([]);
  const [isInstagramConnected, setIsInstagramConnected] = React.useState(false);
  const [isInstagramConnecting, setIsInstagramConnecting] = React.useState(false);
  const [instagramCollections, setInstagramCollections] = React.useState<InstagramCollections | null>(null);
  const [instagramProfileImage, setInstagramProfileImage] = React.useState<string | null>(null);
  const [activeInstagramCollection, setActiveInstagramCollection] = React.useState<InstagramCollectionKey>('posts');
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = React.useState(false);
  const [savedGalleries, setSavedGalleries] = React.useState<SavedGallery[]>([]);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Simple client-side password hashing using Web Crypto
  async function hashPassword(password: string) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Local user storage helpers
  function loadLocalUsers(): Array<{ username: string; passwordHash: string }> {
    try {
      const raw = localStorage.getItem('iga_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveLocalUsers(users: Array<{ username: string; passwordHash: string }>) {
    try { localStorage.setItem('iga_users', JSON.stringify(users)); } catch { }
  }

  const registerLocalUser = async (username: string, password: string) => {
    if (!username || !password) return false;
    const users = loadLocalUsers();
    if (users.find(u => u.username === username)) return false;
    const passwordHash = await hashPassword(password);
    users.push({ username, passwordHash });
    saveLocalUsers(users);
    localStorage.setItem('iga_current_user', username);
    setCurrentUser(username);
    return true;
  };

  const loginLocalUser = async (username: string, password: string) => {
    const users = loadLocalUsers();
    const user = users.find(u => u.username === username);
    if (!user) return false;
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) return false;
    localStorage.setItem('iga_current_user', username);
    setCurrentUser(username);
    return true;
  };

  const logoutLocalUser = () => {
    localStorage.removeItem('iga_current_user');
    setCurrentUser(null);
  };

  const [agents, setAgents] = React.useState<AgentState>(() => {
    const initial: Partial<AgentState> = {};
    defaultAgents.forEach(agent => {
      initial[agent.id] = { ...agent, active: !agent.pro };
    });
    return initial as AgentState;
  });

  const toggleAgent = (agentId: Critic) => {
    setAgents(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], active: !prev[agentId].active },
    }));
  };

  const mapInstagramMedia = (item: InstagramMediaItem): ImagePlaceholder | null => {
    if (item.media_type === 'VIDEO') {
      return null;
    }
    const imageUrl = item.media_url ?? item.thumbnail_url;
    if (!imageUrl) return null;

    const description = item.caption?.trim() || 'Instagram media';
    return {
      id: `instagram-${item.id}`,
      description,
      imageUrl,
      imageHint: description,
    };
  };

  const mapInstagramHighlight = (highlight: InstagramHighlightItem): ImagePlaceholder | null => {
    const cover = highlight.cover_media;
    if (!cover || cover.media_type === 'VIDEO') {
      return null;
    }
    const imageUrl = cover.media_url ?? cover.thumbnail_url;
    if (!imageUrl) return null;

    const description = highlight.title?.trim() || 'Instagram highlight';
    return {
      id: `instagram-highlight-${highlight.id}`,
      description,
      imageUrl,
      imageHint: description,
    };
  };

  const handleConnectInstagram = async () => {
    if (isInstagramConnecting) {
      return;
    }
    setIsInstagramConnecting(true);

    try {
      const response = await fetch('/api/instagram/media');
      const payload = (await response
        .json()
        .catch(() => ({} as { error?: string | { message?: string }; posts?: InstagramMediaItem[]; stories?: InstagramMediaItem[]; highlights?: InstagramHighlightItem[] }))) as {
        error?: string | { message?: string };
        posts?: InstagramMediaItem[];
        stories?: InstagramMediaItem[];
        highlights?: InstagramHighlightItem[];
      };

      if (!response.ok) {
        const errorMessage = typeof payload.error === 'string' ? payload.error : payload.error?.message;
        throw new Error(errorMessage ?? 'Unable to fetch Instagram media.');
      }

      const posts = Array.isArray(payload.posts) ? payload.posts : [];
      const stories = Array.isArray(payload.stories) ? payload.stories : [];
      const highlights = Array.isArray(payload.highlights) ? payload.highlights : [];

      const mappedPosts = posts
        .map(mapInstagramMedia)
        .filter((item): item is ImagePlaceholder => item !== null);
      const mappedStories = stories
        .map(mapInstagramMedia)
        .filter((item): item is ImagePlaceholder => item !== null);
      const mappedHighlights = highlights
        .map(mapInstagramHighlight)
        .filter((item): item is ImagePlaceholder => item !== null);

      if (mappedPosts.length === 0 && mappedStories.length === 0 && mappedHighlights.length === 0) {
        throw new Error('No usable media items returned from Instagram.');
      }

      const collections: InstagramCollections = {
        posts: mappedPosts,
        stories: mappedStories,
        highlights: mappedHighlights,
      };

      setInstagramCollections(collections);
      // Prefer an explicit profile image returned by the API, otherwise use the first post image if available
      const profileImgFromApi = (payload as Record<string, unknown>)?.profileImage as string | undefined;
      const fallbackPostImage = mappedPosts[0]?.imageUrl || null;
      setInstagramProfileImage(profileImgFromApi || fallbackPostImage || null);
      const defaultCollection: InstagramCollectionKey = mappedPosts.length
        ? 'posts'
        : mappedStories.length
        ? 'stories'
        : 'highlights';

      setActiveInstagramCollection(defaultCollection);
      setCurrentTheme({ name: 'Instagram Feed', source: 'user' });
      setCritiques([]);
      setIsInstagramConnected(true);
      setGalleryImages(collections[defaultCollection]);
      
      toast({
        title: 'Instagram Connected',
        description: 'Latest Instagram media are now in your gallery.',
      });
    } catch (error) {
      setIsInstagramConnected(false);
      setInstagramCollections(null);
      setInstagramProfileImage(null);
      setGalleryImages([]);
      const message = error instanceof Error ? error.message : 'Unable to fetch Instagram media.';
      toast({
        variant: 'destructive',
        title: 'Instagram Connection Failed',
        description: message,
      });
    } finally {
      setIsInstagramConnecting(false);
    }
  };

  const handleDisconnectInstagram = () => {
    setIsInstagramConnected(false);
    setIsInstagramConnecting(false);
    setGalleryImages([]);
    setCritiques([]);
    setCurrentTheme(null);
    setInstagramCollections(null);
    setActiveInstagramCollection('posts');
    toast({
      variant: 'destructive',
      title: 'Instagram Disconnected',
      description: 'Instagram images have been cleared.',
    });
  };

  const handleConnectGoogleDrive = () => {
    setIsGoogleDriveConnected(true);
    toast({
      title: 'Google Drive Connected',
      description: 'You can now import images from your Google Drive.',
    });
  };

  const handleDisconnectGoogleDrive = () => {
    setIsGoogleDriveConnected(false);
    toast({
      variant: 'destructive',
      title: 'Google Drive Disconnected',
      description: 'You will no longer be able to import from Google Drive.',
    });
  };

  const handleSaveGallery = (theme: Theme, images: ImagePlaceholder[], critiques: Critique[]) => {
    const existingIndex = savedGalleries.findIndex(g => g.theme.name === theme.name);

    if (existingIndex > -1) {
      const updatedGalleries = [...savedGalleries];
      updatedGalleries[existingIndex] = { ...updatedGalleries[existingIndex], images, critiques };
      setSavedGalleries(updatedGalleries);
      toast({
        title: 'Gallery Updated',
        description: `${theme.name} has been updated.`,
      });
      return;
    }

    const newSavedGallery: SavedGallery = {
      id: `${theme.name}-${Date.now()}`,
      theme,
      images,
      critiques,
    };
    setSavedGalleries(prev => [...prev, newSavedGallery]);
    toast({
      title: 'Gallery Saved',
      description: `${theme.name} has been added to your collection.`,
    });
  };

  // Persist/load local application state: saved galleries, theme, instagram profile
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('iga_saved_galleries');
      if (raw) setSavedGalleries(JSON.parse(raw));
    } catch {}
    try {
      const rawTheme = localStorage.getItem('iga_current_theme');
      if (rawTheme) setCurrentTheme(JSON.parse(rawTheme));
    } catch {}
    try {
      const profile = localStorage.getItem('iga_instagram_profile');
      if (profile) setInstagramProfileImage(profile);
    } catch {}
    try {
      const user = localStorage.getItem('iga_current_user');
      if (user) setCurrentUser(user);
    } catch {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem('iga_saved_galleries', JSON.stringify(savedGalleries)); } catch {}
  }, [savedGalleries]);

  React.useEffect(() => {
    try { localStorage.setItem('iga_current_theme', JSON.stringify(currentTheme)); } catch {}
  }, [currentTheme]);

  React.useEffect(() => {
    try { if (instagramProfileImage) localStorage.setItem('iga_instagram_profile', instagramProfileImage); else localStorage.removeItem('iga_instagram_profile'); } catch {}
  }, [instagramProfileImage]);

  const handleSelectGallery = (gallery: SavedGallery) => {
    setCurrentTheme(gallery.theme);
    setGalleryImages(gallery.images);
    setCritiques(gallery.critiques);
    router.push('/');
  };

  React.useEffect(() => {
    if (!instagramCollections) {
      return;
    }
    setGalleryImages(instagramCollections[activeInstagramCollection]);
  }, [activeInstagramCollection, instagramCollections]);

  return (
    <AppContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        galleryImages,
        setGalleryImages,
        critiques,
        setCritiques,
        isInstagramConnected,
        isInstagramConnecting,
        handleConnectInstagram,
        handleDisconnectInstagram,
        instagramProfileImage,
        instagramCollections,
        activeInstagramCollection,
        setActiveInstagramCollection,
        isGoogleDriveConnected,
        handleConnectGoogleDrive,
        handleDisconnectGoogleDrive,
        savedGalleries,
        handleSaveGallery,
        handleSelectGallery,
        agents,
        toggleAgent,
        // Local auth + profile
        currentUser,
        registerLocalUser,
        loginLocalUser,
        logoutLocalUser,
      }}
    >
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
