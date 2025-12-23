'use client';

import * as React from 'react';
import { useActionState, startTransition } from 'react';
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
import { type ImagePlaceholder } from '@/lib/types';
import type { Critique, Theme, Critic } from '@/lib/types';
import { Bot, CheckCircle2, Wand2, XCircle, Users, Trash2 } from 'lucide-react';
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
  onCritiqueGenerated: (critique: Critique) => void;
  onCritiqueDeleted: (imageId: string) => void;
};

export default function ImageCritiqueView({ image, theme, onCritiqueGenerated, onCritiqueDeleted }: ImageCritiqueViewProps) {
  const { agents, critiques } = useApp();
  const activeCritics = React.useMemo(() => Object.values(agents).filter(a => a.active), [agents]);
  
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(getImageCritiqueAction, initialState);
  
  const { toast } = useToast();
  
  const [critic, setCritic] = React.useState<Critic>(activeCritics[0]?.id || 'Default AI');
  const [models, setModels] = React.useState<string[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  
  const existingCritique = React.useMemo(() => {
    if (!image) return null;
    return critiques.find(c => c.imageId === image.id) || null;
  }, [critiques, image]);

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
      // Reset form action state when image changes
      formRef.current?.reset();
      const resetFormData = new FormData();
      resetFormData.append('type', 'reset');
      startTransition(() => {
        formAction(resetFormData);
      });

      // Manually set the intention textarea value from the existing critique if present
      const intentionTextarea = formRef.current?.elements.namedItem('artisticIntention') as HTMLTextAreaElement | null;
      if (intentionTextarea) {
          intentionTextarea.value = existingCritique?.artisticIntention || '';
      }
      
      // Reset critic selection if current one isn't active
      if (activeCritics.length > 0 && !activeCritics.find(c => c.id === critic)) {
        setCritic(activeCritics[0].id);
      }
    }
  }, [image, existingCritique, activeCritics, critic, formAction]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/ai/models');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
          if (Array.isArray(data.models) && data.models.length > 0) {
            setModels(data.models);
            // Prefer an Ollama model when available (e.g., when Gemini isn't configured)
            const preferred = data.models.find((m: string) => m.startsWith('ollama:')) || data.models[0];
            setSelectedModel(preferred);
          }
      } catch {
        // ignore discovery errors
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Determine what to display
  const critiqueToShow = (state.status === 'success' && state.data?.imageId === image?.id) ? { ...state.data, artisticIntention: formRef.current?.artisticIntention.value || '' } : existingCritique;
  
  const isCritiquing = state.status === 'loading';

  const handleDeleteCritique = () => {
    if (image) {
      onCritiqueDeleted(image.id);
      formRef.current?.reset();
      const resetFormData = new FormData();
      resetFormData.append('type', 'reset');
      startTransition(() => {
        formAction(resetFormData);
      });
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
                            placeholder="e.g., 'Capture the feeling of loneliness...'"
                            defaultValue={existingCritique?.artisticIntention || ''}
                            required
                            readOnly={!!critiqueToShow}
                        />
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select name="model" value={selectedModel} onValueChange={(value) => setSelectedModel(value)} disabled={!!critiqueToShow}>
                        <SelectTrigger>
                          <Bot className="mr-2" />
                          <SelectValue placeholder="Select a model..." />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((m) => (
                            <SelectItem key={m} value={m}>{m.startsWith('ollama:') ? `Ollama — ${m.replace('ollama:', '')}` : `Gemini — ${m}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Council of Critics</Label>
                      <Select name="critic" value={critic} onValueChange={(value) => setCritic(value as Critic)} disabled={!!critiqueToShow}>
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
                    
                    {!critiqueToShow && (
                        <div>
                            <SubmitCritiqueButton />
                        </div>
                    )}
                    
                    <Separator />

                    {isCritiquing && <CritiqueSkeleton />}
                
                    {critiqueToShow && !isCritiquing && (
                      <CritiqueResult critique={critiqueToShow as Critique} onDelete={handleDeleteCritique} />
                    )}

                    {!critiqueToShow && !isCritiquing && (
                        <div className="text-center text-muted-foreground py-8">
                            <Bot size={32} className="mx-auto" />
                            <p className="mt-2 text-sm">Generate an AI critique for this image.</p>
                        </div>
                    )}
                </form>
        </div>
    </ScrollArea>
  );
}
