'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Critique } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/types';

type CritiqueReportProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  critiques: Critique[];
  images: ImagePlaceholder[];
};

export default function CritiqueReport({
  isOpen,
  onOpenChange,
  critiques,
  images,
}: CritiqueReportProps) {
  const imageMap = new Map(images.map((img) => [img.id, img]));

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Critique Summary Report</SheetTitle>
          <SheetDescription>
            An overview of the AI feedback on your gallery images.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-6 pt-4 space-y-6">
            {critiques.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <p>No critiques generated yet. Get feedback on your images to see a report here.</p>
                </div>
            ) : (
                critiques.map((critique, index) => {
                const image = imageMap.get(critique.imageId);
                return (
                    <React.Fragment key={critique.imageId}>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <div className="flex gap-4">
                                {image && (
                                    <div className="relative w-24 h-24 rounded-md overflow-hidden shrink-0">
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        fill
                                        className="object-cover"
                                    />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-lg">Critique for Image #{critique.imageId}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1 italic">
                                        &quot;{critique.artisticIntention}&quot;
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="secondary">{critique.artType}</Badge>
                                        <Badge variant={critique.isAiUsed ? 'default' : 'outline'}>
                                            AI Used: {critique.isAiUsed ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-2">Key Feedback</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                <li>
                                    <span className="font-medium text-foreground">Critique: </span>
                                    {critique.critique.substring(0, 150)}...
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Theme Relevance: </span>
                                    {critique.themeRelevance}
                                </li>
                                 <li>
                                    <span className="font-medium text-foreground">Intention Respect: </span>
                                    {critique.intentionRespectFeedback}
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                    {index < critiques.length - 1 && <Separator />}
                    </React.Fragment>
                );
                })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
