'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageCritiqueAction, type CritiqueState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type ImagePlaceholder } from '@/lib/placeholder-images';
import type { Critique, Theme, Critic } from '@/lib/types';
import { Bot, CheckCircle2, Wand2, XCircle, Users, Trash2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '../context/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const initialState: CritiqueState = { status: 'idle' };

function SubmitCritiqueButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Bot className="mr-2 animate-spin" />
          Getting Critique...
        </>
      ) : (
        <>
          <Wand2 className="mr-2" />
          Get AI Critique
        </>
      )}
    </Button>
  );
}

function CritiqueResult({ critique, onDelete }: { critique: Critique, onDelete: () => void }) {
  return (
    <div className="space-y-4 pt-4">
       <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Critique Result</h3>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete critique">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-foreground">{critique.critique}</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
            <CardContent className="p-3">
                <Label className="text-xs text-muted-foreground">Art Type</Label>
                <p className="font-medium">{critique.artType}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-3">
                <Label className="text-xs text-muted-foreground">AI Used</Label>
                <div className="flex items-center gap-2">
                    {critique.isAiUsed ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-destructive"/>}
                    <span className="font-medium">{critique.isAiUsed ? 'Yes' : 'No'}</span>
                </div>
            </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue="ai-usage">
        <AccordionItem value="ai-usage">
          <AccordionTrigger>AI Usage Feedback</AccordionTrigger>
          <AccordionContent>{critique.aiUsageFeedback || 'No AI usage detected.'}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="theme-relevance">
          <AccordionTrigger>Theme Relevance</AccordionTrigger>
          <AccordionContent>{critique.themeRelevance}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="intention">
          <AccordionTrigger>Intention Respect</AccordionTrigger>
          <AccordionContent>{critique.intentionRespectFeedback}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function CritiqueSkeleton() {
    return (
        <div className="space-y-4 pt-4">
             <Skeleton className="h-6 w-1/3" />
            <Card>
                <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
             <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
             </div>
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
        </div>
    )
}

type ImageCritiqueViewProps = {
  image: ImagePlaceholder | null;
  theme: Theme | null;
  onOpenChange: (isOpen: boolean) => void;
  onCritiqueGenerated: (critique: Critique) => void;
  onCritiqueDeleted: (imageId: string) => void;
};

export default function ImageCritiqueView({ image, theme, onOpenChange, onCritiqueGenerated, onCritiqueDeleted }: ImageCritiqueViewProps) {
  const { agents, critiques } = useApp();
  const activeCritics = React.useMemo(() => Object.values(agents).filter(a => a.active), [agents]);
  
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(getImageCritiqueAction, initialState);
  const { pending } = useFormStatus();

  const { toast } = useToast();
  
  const [critic, setCritic] = React.useState<Critic>(activeCritics[0]?.id || 'Default AI');
  
  const existingCritique = React.useMemo(() => {
    if (!image) return null;
    return critiques.find(c => c.imageId === image.id) || null;
  }, [critiques, image]);

  const critiqueToShow = (state.status === 'success' && state.data?.imageId === image?.id) ? { ...state.data, imageId: image.id, artisticIntention: ''} : existingCritique;

  React.useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast({
        variant: 'destructive',
        title: 'Critique Failed',
        description: state.error,
      });
    }
    if (state.status === 'success' && state.data && image) {
        if (state.data.imageId === image.id) {
             onCritiqueGenerated({
                ...state.data,
                imageId: image.id,
                artisticIntention: formRef.current?.artisticIntention.value || ''
            });
        }
    }
  }, [state, toast, image, onCritiqueGenerated]);

  React.useEffect(() => {
    if (image) {
      // Reset form state when image changes
      formRef.current?.reset();
      const currentArtisticIntention = existingCritique?.artisticIntention || '';
      if(formRef.current?.artisticIntention) {
        formRef.current.artisticIntention.value = currentArtisticIntention;
      }
      
      if (activeCritics.length > 0 && !activeCritics.find(c => c.id === critic)) {
        setCritic(activeCritics[0].id);
      }
    }
  }, [image, existingCritique, activeCritics, critic]);
  
  const handleDeleteCritique = () => {
    if (image) {
      onCritiqueDeleted(image.id);
      toast({
        title: "Critique Deleted",
        description: "The critique for this image has been removed."
      })
    }
  }

  if (!image) {
    return (
        <div className="flex h-full items-center justify-center bg-muted/50 text-muted-foreground">
            Select an image to view details.
        </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Image Details</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-7 w-7">
                <X size={16} />
            </Button>
        </div>
        <ScrollArea className="flex-1">
            <div className="p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                    <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover"
                        sizes="30vw"
                    />
                </div>
                 <form action={formAction} ref={formRef} className="space-y-4">
                        <input type="hidden" name="imageUrl" value={image.imageUrl} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="theme" value={theme?.name || 'General'} />

                        <div className="space-y-2">
                            <Label htmlFor="artistic-intention">Artistic Intention</Label>
                            <Textarea
                                id="artistic-intention"
                                name="artisticIntention"
                                placeholder="e.g., 'Capture the feeling of loneliness in a bustling city...'"
                                defaultValue={existingCritique?.artisticIntention || ''}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                          <Label>Council of Critics</Label>
                          <Select name="critic" value={critic} onValueChange={(value) => setCritic(value as Critic)}>
                              <SelectTrigger>
                                <Users className="mr-2" />
                                <SelectValue placeholder="Select a critic..." />
                              </SelectTrigger>
                              <SelectContent>
                                {activeCritics.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                ))}
                              </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                            <SubmitCritiqueButton />
                        </div>
                        
                        <Separator />

                        {pending && <CritiqueSkeleton />}
                    
                        {critiqueToShow && !pending && (
                            <CritiqueResult critique={critiqueToShow} onDelete={handleDeleteCritique} />
                        )}

                        {!critiqueToShow && !pending && (
                            <div className="text-center text-muted-foreground py-8">
                                <Bot size={32} className="mx-auto" />
                                <p className="mt-2 text-sm">Generate an AI critique for this image.</p>
                            </div>
                        )}
                    </form>
            </div>
        </ScrollArea>
    </div>
  );
}
