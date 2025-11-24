'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, BookOpen, Lightbulb, TrendingUp, Users } from 'lucide-react';
import type { ProvideAiPoweredGalleryCritiqueOutput } from '@/ai/flows/provide-ai-powered-gallery-critique';
import type { Theme } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type GalleryCritiqueReportProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  critique: ProvideAiPoweredGalleryCritiqueOutput | null;
  theme: Theme | null;
};

const criticAvatars: Record<string, string> = {
    'Pretentious Art Critic': 'https://picsum.photos/seed/critic1/100/100',
    'Supportive Photographer': 'https://picsum.photos/seed/critic2/100/100',
}

const criticInitials: Record<string, string> = {
    'Pretentious Art Critic': 'AC',
    'Supportive Photographer': 'SP',
}

function CritiqueSection({ title, icon, sections }: { title: string, icon: React.ReactNode, sections: {critic: string, statement: string}[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sections.map((section, index) => (
                    <div key={index} className="flex gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={criticAvatars[section.critic]} data-ai-hint="person" />
                            <AvatarFallback>{criticInitials[section.critic]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{section.critic}</p>
                            <p className="text-sm text-muted-foreground">{section.statement}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function ReportSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function GalleryCritiqueReport({
  isOpen,
  onOpenChange,
  critique,
  theme
}: GalleryCritiqueReportProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Gallery Critique: <span className="font-normal">{theme?.name}</span></SheetTitle>
          <SheetDescription>
            The AI Council of Critics has reviewed your gallery. Here is their feedback.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-6 pt-4">
            {!critique ? <ReportSkeleton /> : (
                <div className="space-y-6">
                    <CritiqueSection title="Overall Assessment" icon={<Users size={20} />} sections={critique.overallAssessment} />
                    <CritiqueSection title="Curation & Coherence" icon={<BookOpen size={20} />} sections={critique.curationAndCoherence} />
                    <CritiqueSection title="Emerging Threads" icon={<TrendingUp size={20} />} sections={critique.emergingThreads} />
                    <CritiqueSection title="Future Development" icon={<Lightbulb size={20} />} sections={critique.futureDevelopment} />

                    <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-2">Discuss with the Council</h3>
                        <div className="p-4 border rounded-lg bg-muted/50 text-center">
                            <p className="text-sm text-muted-foreground">This feature is coming soon!</p>
                            <p className="text-xs text-muted-foreground mt-1">You'll be able to ask follow-up questions to the critics.</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
