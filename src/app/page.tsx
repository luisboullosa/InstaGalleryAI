

'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/app/components/layout/header';
import GalleryGrid from '@/app/components/gallery-grid';
import ImageCritiqueView from '@/app/components/image-critique-view';
import type { ImagePlaceholder } from '@/lib/types';
import type { Critique, Theme, SavedGallery } from '@/lib/types';
import { Bot, GalleryHorizontal, Sparkles, X } from 'lucide-react';
import CritiqueReport from './components/critique-report';
import GalleryCritiqueReport from './components/gallery-critique-report';
import { useApp } from './context/app-provider';
import { getGalleryCritiqueAction, type GalleryCritiqueState } from '@/app/actions';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    isInstagramConnecting,
    handleConnectInstagram,
    savedGalleries,
    handleSaveGallery,
    handleSelectGallery,
    isGoogleDriveConnected,
    handleConnectGoogleDrive,
    instagramCollections,
    activeInstagramCollection,
    setActiveInstagramCollection,
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
    React.startTransition(() => {
      galleryCritiqueAction({ type: 'reset' });
    });

    // Only use Instagram images for gallery creation
    if (!instagramCollections || !activeInstagramCollection) {
      toast({
        title: 'No Instagram Images',
        description: 'Connect your Instagram account and select a collection to create a gallery.',
        variant: 'destructive',
      });
      return;
    }

    const collection = instagramCollections[activeInstagramCollection] || [];
    if (collection.length === 0) {
      toast({
        title: 'No Images Available',
        description: `There are no images in your Instagram ${activeInstagramCollection} to create a gallery.`,
        variant: 'destructive',
      });
      return;
    }

    // Optionally filter by theme keywords if desired, or just use all available images
    // For now, just use up to 15 images from the collection
    setGalleryImages(collection.slice(0, 15));
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
    // Only add images from the currently active Instagram collection.
    // Do NOT fall back to placeholder images under any circumstance.
    if (!instagramCollections || !activeInstagramCollection) {
      toast({
        title: 'No Instagram Feed',
        description: 'Connect an Instagram account and select a collection to add images.',
      });
      return;
    }

    const collection = instagramCollections[activeInstagramCollection] || [];
    const available = collection.filter(img => !existingIds.has(img.id));

    if (available.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No New Images',
        description: `There are no new images available in ${activeInstagramCollection}.`,
      });
      return;
    }

    const toAdd = available.slice(0, 3);
    setGalleryImages(prev => [...prev, ...toAdd]);
    toast({
      title: 'More Instagram images added',
      description: `${toAdd.length} new image(s) appended from ${activeInstagramCollection}.`,
    });
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
    React.startTransition(() => {
      galleryCritiqueAction(formData);
    });
  }
  
  const handleDeleteGalleryCritique = () => {
    React.startTransition(() => {
        galleryCritiqueAction({type: 'reset'});
    });
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
  const handleSelectAndReset = (gallery: SavedGallery) => {
    handleSelectGallery(gallery);
    React.startTransition(() => {
      galleryCritiqueAction({type: 'reset'});
    });
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex min-h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25} collapsible>
          <AppSidebar
            onCreateGallery={handleCreateGallery}
            currentTheme={currentTheme}
            isInstagramConnected={isInstagramConnected}
            isInstagramConnecting={isInstagramConnecting}
            onConnectInstagram={handleConnectInstagram}
            isGoogleDriveConnected={isGoogleDriveConnected}
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
              {instagramCollections && (
                <div className="mb-4">
                  <Tabs
                    value={activeInstagramCollection}
                    onValueChange={(value) => {
                      const nextValue = value as typeof activeInstagramCollection;
                      setActiveInstagramCollection(nextValue);
                      setGalleryImages(instagramCollections[nextValue]);
                    }}
                  >
                    <TabsList>
                      <TabsTrigger value="posts">Posts</TabsTrigger>
                      <TabsTrigger value="stories">Stories</TabsTrigger>
                      <TabsTrigger value="highlights">Highlights</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
              {galleryImages.length > 0 && currentTheme ? (
                <GalleryGrid
                  images={galleryImages}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                />
              ) : instagramCollections && galleryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <div className="p-6 border-2 border-dashed rounded-full border-muted mb-4">
                    <GalleryHorizontal size={48} />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">No images in this tab</h2>
                  <p className="max-w-md mt-2">
                    {`Instagram has no ${activeInstagramCollection} with images to show right now. Try another tab or reconnect to refresh the feed.`}
                  </p>
                </div>
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
                  critique={galleryCritiqueState.status === 'success' && galleryCritiqueState.data ? galleryCritiqueState.data : null}
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
        images={galleryImages}
      />
    </ResizablePanelGroup>
  );
}
