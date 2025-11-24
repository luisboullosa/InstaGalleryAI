'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { AppHeader } from '@/app/components/layout/header';
import GalleryGrid from '@/app/components/gallery-grid';
import ImageCritiqueView from '@/app/components/image-critique-view';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import type { Critique, Theme } from '@/lib/types';
import { Bot, GalleryHorizontal, Sparkles, X } from 'lucide-react';
import CritiqueReport from './components/critique-report';
import GalleryCritiqueReport from './components/gallery-critique-report';
import { useToast } from '@/hooks/use-toast';
import { getGalleryCritiqueAction, type GalleryCritiqueState } from '@/app/actions';
import { useApp } from './context/app-provider';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';

const initialGalleryCritiqueState: GalleryCritiqueState = { status: 'idle' };

export default function Home() {
  const {
    currentTheme,
    setCurrentTheme,
    galleryImages,
    setGalleryImages,
    critiques,
    setCritiques,
    isInstagramConnected,
    handleConnectInstagram,
    savedGalleries,
    handleSaveGallery,
    handleSelectGallery,
  } = useApp();

  const [selectedImage, setSelectedImage] = React.useState<ImagePlaceholder | null>(null);
  const [isReportOpen, setReportOpen] = React.useState(false);
  const [showGalleryCritique, setShowGalleryCritique] = React.useState(false);
  
  const { toast } = useToast();

  const [galleryCritiqueState, galleryCritiqueAction, isGalleryCritiquePending] = useActionState(getGalleryCritiqueAction, initialGalleryCritiqueState);
  
  const detailViewActive = !!selectedImage || showGalleryCritique;
  const hasExistingGalleryCritique = galleryCritiqueState.status === 'success' && galleryCritiqueState.data;

  const handleCreateGallery = (theme: Theme) => {
    setCurrentTheme(theme);
    setCritiques([]);
    galleryCritiqueAction({type: 'reset'}); // Reset gallery critique state
    
    const imageMap = new Map<string, ImagePlaceholder>();
    const themeKeywords = theme.name.toLowerCase().split(' ');

    PlaceHolderImages.forEach(image => {
        const hint = image.imageHint.toLowerCase();
        if (themeKeywords.some(keyword => hint.includes(keyword))) {
            imageMap.set(image.id, image);
        }
    });

    let finalImages = Array.from(imageMap.values());
    
    if (finalImages.length === 0) {
      const shuffled = [...PlaceHolderImages].sort(() => 0.5 - Math.random());
      finalImages = shuffled.slice(0, 9);
    }
  
    setGalleryImages(finalImages.slice(0, 15));
    setSelectedImage(null);
    setShowGalleryCritique(false);
  };
  
  const handleCritiqueGenerated = (critique: Critique) => {
    setCritiques(prev => [...prev.filter(c => c.imageId !== critique.imageId), critique]);
  };
  
  const handleCritiqueDeleted = (imageId: string) => {
    setCritiques(prev => prev.filter(c => c.imageId !== imageId));
    toast({
        title: "Critique Deleted",
        description: "The critique for this image has been removed."
    });
  };

  const handleImageRemove = (imageToRemove: ImagePlaceholder) => {
    setGalleryImages(prev => prev.filter(img => img.id !== imageToRemove.id));
    setCritiques(prev => prev.filter(c => c.imageId !== imageToRemove.id));
    if (selectedImage?.id === imageToRemove.id) {
        setSelectedImage(null);
    }
  };

  const handleAddImages = () => {
    const existingIds = new Set(galleryImages.map(img => img.id));
    const availableImages = PlaceHolderImages.filter(img => !existingIds.has(img.id));
    
    if (availableImages.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No More Images',
            description: 'There are no more unique images to add.',
        });
        return;
    }

    const newImages = [...availableImages].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    setGalleryImages(prev => [...prev, ...newImages]);
    toast({
        title: 'Images Added',
        description: `${newImages.length} new image(s) were added to the gallery.`,
    });
  };

  const handleConnectGoogleDrive = () => {
    toast({
      title: 'Coming Soon!',
      description: "Google Drive integration is not yet available.",
    })
  };

  const handleCritiqueGallery = () => {
    if (!currentTheme) return;

    if (hasExistingGalleryCritique) {
        setShowGalleryCritique(true);
        setSelectedImage(null);
        return;
    }
    const formData = new FormData();
    formData.append('theme', currentTheme.name);
    formData.append('images', JSON.stringify(galleryImages));
    galleryCritiqueAction(formData);
  }
  
  const handleDeleteGalleryCritique = () => {
    galleryCritiqueAction({type: 'reset'});
    setShowGalleryCritique(false);
    toast({
      title: 'Gallery Critique Deleted',
      description: 'You can now re-run the gallery critique.',
    });
  }

  const handleShowGalleryCritique = () => {
    if (hasExistingGalleryCritique) {
      setShowGalleryCritique(true);
      setSelectedImage(null);
    }
  }

  const handleExport = () => {
    toast({
        title: 'Coming Soon!',
        description: 'The export feature is under development.',
    });
  }
  
  const handleImageSelect = (image: ImagePlaceholder) => {
    setSelectedImage(image);
    setShowGalleryCritique(false);
  }
  
  const handleCloseDetailView = () => {
    setSelectedImage(null);
    setShowGalleryCritique(false);
  }

  React.useEffect(() => {
    if (galleryCritiqueState.status === 'success' && galleryCritiqueState.data) {
        setShowGalleryCritique(true);
        setSelectedImage(null);
    }
    if (galleryCritiqueState.status === 'error' && galleryCritiqueState.error) {
        toast({
            variant: 'destructive',
            title: 'Gallery Critique Failed',
            description: galleryCritiqueState.error,
        });
    }
  }, [galleryCritiqueState, toast]);

  // When selecting a saved gallery, reset the critique state
  const handleSelectAndReset = (gallery: any) => {
    handleSelectGallery(gallery);
    galleryCritiqueAction({type: 'reset'});
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex min-h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} collapsible>
          <AppSidebar
            onCreateGallery={handleCreateGallery}
            currentTheme={currentTheme}
            isInstagramConnected={isInstagramConnected}
            onConnectInstagram={handleConnectInstagram}
            onConnectGoogleDrive={handleConnectGoogleDrive}
            savedGalleries={savedGalleries}
            onSelectGallery={handleSelectAndReset}
          />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={detailViewActive ? 50 : 80}>
          <div className="flex flex-col h-full">
            <AppHeader 
              theme={currentTheme} 
              onShowReport={() => setReportOpen(true)}
              hasCritiques={critiques.length > 0}
              onCritiqueGallery={handleCritiqueGallery}
              onShowGalleryCritique={handleShowGalleryCritique}
              hasExistingGalleryCritique={!!hasExistingGalleryCritique}
              isGalleryCritiqueLoading={isGalleryCritiquePending}
              onAddImages={handleAddImages}
              onSaveGallery={() => currentTheme && handleSaveGallery(currentTheme, galleryImages, critiques)}
              onExport={handleExport}
            />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {galleryImages.length > 0 && currentTheme ? (
                <GalleryGrid
                  images={galleryImages}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
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
          </div>
      </ResizablePanel>

      {detailViewActive && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={25} collapsible>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold text-lg">
                      {showGalleryCritique ? "Gallery Critique" : "Image Details"}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={handleCloseDetailView} className="h-7 w-7">
                      <X size={16} />
                  </Button>
              </div>
              
              {showGalleryCritique ? (
                <GalleryCritiqueReport
                  critique={galleryCritiqueState.status === 'success' ? galleryCritiqueState.data : null}
                  theme={currentTheme}
                  onDelete={handleDeleteGalleryCritique}
                />
              ) : (
                <ImageCritiqueView
                  image={selectedImage}
                  theme={currentTheme}
                  onCritiqueGenerated={handleCritiqueGenerated}
                  onCritiqueDeleted={handleCritiqueDeleted}
                />
              )}
            </div>
          </ResizablePanel>
        </>
      )}

      <CritiqueReport
        isOpen={isReportOpen}
        onOpenChange={setReportOpen}
        critiques={critiques}
        images={PlaceHolderImages}
      />
    </ResizablePanelGroup>
  );
}
