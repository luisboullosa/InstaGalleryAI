'use client';

import * as React from 'react';
import { useActionState, useTransition } from 'react';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { AppHeader } from '@/app/components/layout/header';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import GalleryGrid from '@/app/components/gallery-grid';
import ImageCritiqueView from '@/app/components/image-critique-view';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import type { Critique, Theme } from '@/lib/types';
import { Bot, GalleryHorizontal, Sparkles } from 'lucide-react';
import CritiqueReport from './components/critique-report';
import GalleryCritiqueReport from './components/gallery-critique-report';
import { useToast } from '@/hooks/use-toast';
import { getGalleryCritiqueAction, type GalleryCritiqueState } from '@/app/actions';

const initialGalleryCritiqueState: GalleryCritiqueState = { status: 'idle' };

export default function Home() {
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<ImagePlaceholder[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<ImagePlaceholder | null>(null);
  const [critiques, setCritiques] = React.useState<Critique[]>([]);
  const [isReportOpen, setReportOpen] = React.useState(false);
  const [isGalleryReportOpen, setGalleryReportOpen] = React.useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = React.useState(false);
  const { toast } = useToast();

  const [galleryCritiqueState, galleryCritiqueAction] = useActionState(getGalleryCritiqueAction, initialGalleryCritiqueState);
  const [isGalleryCritiquePending, startGalleryCritiqueTransition] = useTransition();

  const handleCreateGallery = (theme: Theme) => {
    setCurrentTheme(theme);
    // Mocking AI selection based on theme keywords and image hints
    const themeKeywords = theme.name.toLowerCase().split(' ');
    const filteredImages = PlaceHolderImages.filter(image => 
      themeKeywords.some(keyword => image.imageHint.includes(keyword))
    );
    // If no images match, show a random selection for demonstration
    setGalleryImages(filteredImages.length > 0 ? filteredImages : PlaceHolderImages.slice(0, 9));
    setSelectedImage(null);
  };
  
  const handleCritiqueGenerated = (critique: Critique) => {
    setCritiques(prev => [...prev.filter(c => c.imageId !== critique.imageId), critique]);
  };

  const handleConnectInstagram = () => {
    // In a real app, this would trigger the OAuth flow.
    // For now, we'll just simulate a successful connection.
    setIsInstagramConnected(true);
    toast({
      title: 'Instagram Connected',
      description: "You can now create galleries from your Instagram posts.",
    })
  };

  const handleConnectGoogleDrive = () => {
    toast({
      title: 'Coming Soon!',
      description: "Google Drive integration is not yet available.",
    })
  };

  const handleCritiqueGallery = () => {
    if (!currentTheme) return;

    startGalleryCritiqueTransition(() => {
        const formData = new FormData();
        formData.append('theme', currentTheme.name);
        formData.append('images', JSON.stringify(galleryImages));
        galleryCritiqueAction(formData);
    });
  }

  React.useEffect(() => {
    if (galleryCritiqueState.status === 'success' && galleryCritiqueState.data) {
        setGalleryReportOpen(true);
    }
    if (galleryCritiqueState.status === 'error' && galleryCritiqueState.error) {
        toast({
            variant: 'destructive',
            title: 'Gallery Critique Failed',
            description: galleryCritiqueState.error,
        });
    }
  }, [galleryCritiqueState, toast]);

  return (
    <div className="flex min-h-screen">
      <Sidebar variant="sidebar" collapsible="icon">
        <AppSidebar
          onCreateGallery={handleCreateGallery}
          currentTheme={currentTheme}
          isInstagramConnected={isInstagramConnected}
          onConnectInstagram={handleConnectInstagram}
          onConnectGoogleDrive={handleConnectGoogleDrive}
        />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader 
          theme={currentTheme} 
          onShowReport={() => setReportOpen(true)}
          hasCritiques={critiques.length > 0}
          onCritiqueGallery={handleCritiqueGallery}
          isGalleryCritiqueLoading={isGalleryCritiquePending}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {galleryImages.length > 0 && currentTheme ? (
            <GalleryGrid
              images={galleryImages}
              onImageSelect={setSelectedImage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="p-6 border-2 border-dashed rounded-full border-muted mb-4">
                <GalleryHorizontal size={48} />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Welcome to InstaGalleryAI</h2>
              <p className="max-w-md mt-2">
                Your personal AI gallery curator. To begin, create a new themed gallery using the options in the sidebar.
              </p>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Theme Suggestions</div>
                <div className="flex items-center gap-2"><Bot className="text-primary" /> AI Image Critiques</div>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>

      <ImageCritiqueView
        image={selectedImage}
        theme={currentTheme}
        onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
        onCritiqueGenerated={handleCritiqueGenerated}
      />

      <CritiqueReport
        isOpen={isReportOpen}
        onOpenChange={setReportOpen}
        critiques={critiques}
        images={PlaceHolderImages}
      />

      <GalleryCritiqueReport
        isOpen={isGalleryReportOpen}
        onOpenChange={setGalleryReportOpen}
        critique={galleryCritiqueState.status === 'success' ? galleryCritiqueState.data : null}
        theme={currentTheme}
      />
    </div>
  );
}
