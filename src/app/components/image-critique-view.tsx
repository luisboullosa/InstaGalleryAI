'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
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
import { Bot, CheckCircle2, Wand2, XCircle, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '../context/app-provider';

const initialState: CritiqueState = { status: 'idle' };

function SubmitCritiqueButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
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

function CritiqueResult({ critique }: { critique: NonNullable<CritiqueState['data']> }) {
  return (
    <div className="space-y-4">
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

      <Accordion type="single" collapsible className="w-full">
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
        <div className="space-y-4">
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
};

export default function ImageCritiqueView({ image, theme, onOpenChange, onCritiqueGenerated }: ImageCritiqueViewProps) {
  const { agents } = useApp();
  const activeCritics = React.useMemo(() => Object.values(agents).filter(a => a.active), [agents]);

  const [state, formAction] = useActionState(getImageCritiqueAction, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const [critic, setCritic] = React.useState<Critic>(activeCritics[0]?.id || 'Default AI');

  React.useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast({
        variant: 'destructive',
        title: 'Critique Failed',
        description: state.error,
      });
    }
    if (state.status === 'success' && state.data && image) {
      onCritiqueGenerated({
          ...state.data,
          imageId: image.id,
          artisticIntention: formRef.current?.artisticIntention.value || ''
      });
    }
  }, [state, toast, image, onCritiqueGenerated]);

  React.useEffect(() => {
    // Reset form state when image changes
    if (image) {
      formRef.current?.reset();
      // A bit of a hack to reset useFormState
      const mutableInitialState = initialState as { status: CritiqueState['status'] };
      mutableInitialState.status = 'idle';
      if (activeCritics.length > 0) {
        setCritic(activeCritics[0].id);
      }
    }
  }, [image, activeCritics]);

  return (
    <Sheet open={!!image} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col">
        {image && (
          <>
            <SheetHeader>
              <SheetTitle>AI-Powered Critique</SheetTitle>
              <SheetDescription>
                Get feedback on your image from a council of AI critics.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto pr-6 -mr-6 grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                <div className="relative aspect-square lg:aspect-auto rounded-lg overflow-hidden">
                    <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                </div>
                
                <div className="flex flex-col gap-4">
                    <form action={formAction} ref={formRef} className="space-y-4">
                        <input type="hidden" name="imageUrl" value={image.imageUrl} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="theme" value={theme?.name || 'General'} />
                        <input type="hidden" name="critic" value={critic} />

                        <div className="space-y-2">
                            <Label htmlFor="artistic-intention">Artistic Intention</Label>
                            <Textarea
                                id="artistic-intention"
                                name="artisticIntention"
                                placeholder="e.g., 'Capture the feeling of loneliness in a bustling city...'"
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
                        
                        <SheetFooter className="mt-auto !flex-col sm:!flex-row">
                            <SubmitCritiqueButton />
                        </SheetFooter>
                    </form>
                    
                    {state.status === 'loading' && <CritiqueSkeleton />}
                    {state.status === 'success' && state.data && <CritiqueResult critique={state.data} />}
                </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
