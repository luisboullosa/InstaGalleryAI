'use server';

import { z } from 'zod';
import { suggestThemes as suggestThemesFlow } from '@/ai/flows/suggest-themes-based-on-history';
import { provideAiPoweredImageCritique as provideAiPoweredImageCritiqueFlow } from '@/ai/flows/provide-ai-powered-image-critique';
import { CriticSchema } from '@/lib/types';

export type SuggestThemesState = {
  status: 'success' | 'error' | 'idle';
  suggestedThemes?: string[];
  error?: string;
};

export async function suggestThemesAction(
  prevState: SuggestThemesState,
  formData: FormData
): Promise<SuggestThemesState> {
  const schema = z.object({
    postingHistory: z.string().min(1, 'Posting history is required.'),
  });

  const validatedFields = schema.safeParse({
    postingHistory: formData.get('postingHistory'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      error: validatedFields.error.flatten().fieldErrors.postingHistory?.[0],
    };
  }

  try {
    const result = await suggestThemesFlow({
      postingHistory: validatedFields.data.postingHistory,
      numberOfSuggestions: 5,
    });
    return { status: 'success', suggestedThemes: result.themes };
  } catch (error) {
    return { status: 'error', error: 'Failed to get AI suggestions. Please try again.' };
  }
}

export type CritiqueState = {
    status: 'success' | 'error' | 'idle' | 'loading';
    data?: Awaited<ReturnType<typeof provideAiPoweredImageCritiqueFlow>>;
    error?: string;
}

const critiqueSchema = z.object({
    imageUrl: z.string().url(),
    imageId: z.string(),
    artisticIntention: z.string().min(1, 'Please describe your artistic intention.'),
    theme: z.string(),
    critic: CriticSchema,
});

export async function getImageCritiqueAction(prevState: CritiqueState, formData: FormData) : Promise<CritiqueState> {
    const validatedFields = critiqueSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            status: 'error',
            error: validatedFields.error.flatten().fieldErrors.artisticIntention?.[0] || 'Invalid input.',
        };
    }

    const { imageUrl, artisticIntention, theme, critic } = validatedFields.data;

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        const imageDataUri = `data:${mimeType};base64,${base64Image}`;

        const critique = await provideAiPoweredImageCritiqueFlow({
            imageDataUri,
            artisticIntention,
            theme,
            critic,
        });

        return { status: 'success', data: critique };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { status: 'error', error: `Failed to generate critique: ${errorMessage}` };
    }
}
