'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Sparkles } from 'lucide-react';
import React from 'react';
import { useFormStatus } from 'react-dom';
import { suggestThemesAction, type SuggestThemesState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
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

function SubmitThemeButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" className="w-full" disabled={disabled || pending}>
      {pending ? 'Creating...' : 'Create Gallery'}
    </Button>
  );
}

function SuggestThemesButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" className="w-full" disabled={disabled || pending}>
      <Sparkles className="mr-2" />
      {pending ? 'Suggesting...' : 'Suggest Themes'}
    </Button>
  );
}

type ThemeCreatorProps = {
  onCreateGallery: (theme: Theme) => void;
  isInstagramConnected: boolean;
};

export function ThemeCreator({ onCreateGallery, isInstagramConnected }: ThemeCreatorProps) {
  const [themeInput, setThemeInput] = React.useState('');
  const [state, formAction] = React.useActionState(suggestThemesAction, initialState);
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

  if (!isInstagramConnected) {
    return (
        <div className="space-y-4 rounded-lg border border-dashed border-sidebar-border p-4 text-center">
            <div className="mx-auto w-fit rounded-full bg-sidebar-accent p-3">
                <Lock className="text-sidebar-accent-foreground" />
            </div>
            <h3 className="font-semibold">Connect an Account</h3>
            <p className="text-sm text-muted-foreground">
                Please connect your Instagram or Google Drive account to start creating galleries.
            </p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleUserThemeSubmit} className="space-y-2">
        <Label htmlFor="theme-input">Enter a Theme</Label>
        <Input
          id="theme-input"
          placeholder="e.g., 'Urban Noir'"
          value={themeInput}
          onChange={(e) => setThemeInput(e.target.value)}
          disabled={!isInstagramConnected}
        />
        <SubmitThemeButton disabled={!isInstagramConnected} />
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-sidebar-border" />
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
          className="bg-sidebar-background text-sm"
          rows={5}
          defaultValue={MOCK_POSTING_HISTORY}
          disabled={!isInstagramConnected}
        />
        <SuggestThemesButton disabled={!isInstagramConnected} />
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
        <Slider defaultValue={[50]} max={100} step={1} disabled={!isInstagramConnected} />
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lenient</span>
            <span>Harsh</span>
        </div>
      </div>
    </div>
  );
}
