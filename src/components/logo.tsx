import { GalleryHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center size-8 bg-sidebar-primary rounded-lg text-sidebar-primary-foreground", className)}>
      <GalleryHorizontal className="size-5" />
    </div>
  );
}
