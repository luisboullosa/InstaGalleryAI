'use client';

import { Button } from '@/components/ui/button';
import { type ImagePlaceholder } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Image from 'next/image';

type GalleryGridProps = {
  images: ImagePlaceholder[];
  onImageSelect: (image: ImagePlaceholder) => void;
  onImageRemove: (image: ImagePlaceholder) => void;
};

export default function GalleryGrid({ images, onImageSelect, onImageRemove }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="relative group aspect-square">
          <button
            className={cn(
              'absolute inset-0 w-full h-full p-0 rounded-lg overflow-hidden appearance-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background'
            )}
            onClick={() => onImageSelect(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={image.imageHint}
              priority={index < 8}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.stopPropagation();
              onImageRemove(image);
            }}
            aria-label="Remove image"
          >
            <X size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}
