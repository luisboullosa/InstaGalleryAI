'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2 } from 'lucide-react';
import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { suggestThemesAction, type SuggestThemesState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Theme } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const initialState: SuggestThemesState = { status: 'idle' };
const MOCK_POSTING_HISTORY = `A mix of urban exploration and nature photography. Lots of night shots in cities like Tokyo and New York, focusing on neon lights and reflections. Also includes landscape photos from hiking trips in the mountains, with a focus on dramatic sunsets and misty mornings. Some occasional portraits and abstract macro shots of flowers and insects. Style is often moody and atmospheric.`;

function SubmitThemeButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" className="w-full" disabled={pending}>
      {pending ? 'Creating...' : 'Create Gallery'}
    </Button>
  );
}

function SuggestThemesButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" className="w-full" disabled={pending}>
      <Sparkles className="mr-2" />
      {pending ? 'Suggesting...' : 'Suggest Themes'}
    </Button>
  );
}

type ThemeCreatorProps = {
  onCreateGallery: (theme: Theme) => void;
};

export function ThemeCreator({ onCreateGallery }: ThemeCreatorProps) {
  const [themeInput, setThemeInput] = React.useState('');
  const [state, formAction] = useFormState(suggestThemesAction, initialState);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.status === 'error' && state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleUserThemeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (themeInput.trim()) {
      onCreateGallery({ name: themeInput.trim(), source: 'user' });
      setThemeInput('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleUserThemeSubmit} className="space-y-2">
        <Label htmlFor="theme-input">Enter a Theme</Label>
        <Input
          id="theme-input"
          placeholder="e.g., 'Urban Noir' or 'Nature's Geometry'"
          value={themeInput}
          onChange={(e) => setThemeInput(e.target.value)}
        />
        <SubmitThemeButton />
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-sidebar px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <form action={formAction} className="space-y-2">
        <Label htmlFor="posting-history">AI Suggestions</Label>
        <Textarea
          id="posting-history"
          name="postingHistory"
          className="bg-background/50 text-sm"
          rows={5}
          defaultValue={MOCK_POSTING_HISTORY}
        />
        <SuggestThemesButton />
      </form>

      {state.status === 'success' && state.suggestedThemes && (
        <div className="space-y-2">
          <Label>Suggested Themes</Label>
          <div className="flex flex-wrap gap-2">
            {state.suggestedThemes.map((theme, i) => (
              <Button
                key={i}
                variant="secondary"
                size="sm"
                className="font-normal"
                onClick={() => onCreateGallery({ name: theme, source: 'ai' })}
              >
                {theme}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2 pt-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="strictness" className="cursor-help">Selection Strictness</Label>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p className="max-w-xs">How harshly the AI curator selects photos for the gallery. Higher strictness means fewer, but more on-theme, photos.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Slider defaultValue={[50]} max={100} step={1} />
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lenient</span>
            <span>Harsh</span>
        </div>
      </div>
    </div>
  );
}
