'use server';

import { z } from 'zod';
import { suggestThemes as suggestThemesFlow } from '@/ai/flows/suggest-themes-based-on-history';
import { provideAiPoweredImageCritique as provideAiPoweredImageCritiqueFlow } from '@/ai/flows/provide-ai-powered-image-critique';
import { provideAiPoweredGalleryCritique as provideAiPoweredGalleryCritiqueFlow } from '@/ai/flows/provide-ai-powered-gallery-critique';
import { CriticSchema } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/types';
import type { ProvideAiPoweredImageCritiqueOutput } from '@/ai/flows/provide-ai-powered-image-critique';

export type SuggestThemesState = {
  status: 'success' | 'error' | 'idle';
  suggestedThemes?: string[];
  error?: string;
};

export async function suggestThemesAction(
  _prevState: SuggestThemesState,
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
    console.error(error);
    return { status: 'error', error: 'Failed to get AI suggestions. Please try again.' };
  }
}

export type CritiqueState = {
    status: 'success' | 'error' | 'idle' | 'loading';
    data?: ProvideAiPoweredImageCritiqueOutput & { imageId: string };
    error?: string;
}

const critiqueSchema = z.object({
    imageUrl: z.string().url(),
    imageId: z.string(),
  artisticIntention: z.string().min(1, 'Please describe your artistic intention.'),
  theme: z.string(),
  critic: CriticSchema,
  model: z.string().optional(),
});

export async function getImageCritiqueAction(_prevState: CritiqueState, formData: FormData) : Promise<CritiqueState> {
    if (formData.get('type') === 'reset') {
        return { status: 'idle' };
    }

    const validatedFields = critiqueSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            status: 'error',
            error: validatedFields.error.flatten().fieldErrors.artisticIntention?.[0] || 'Invalid input.',
        };
    }

    const { imageUrl, artisticIntention, theme, critic, imageId, model } = validatedFields.data;

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        const imageDataUri = `data:${mimeType};base64,${base64Image}`;

        // If a local Ollama model was requested, route the prompt to Ollama
        if (model && typeof model === 'string' && model.startsWith('ollama:')) {
          const modelName = model.replace(/^ollama:/, '');
          // Normalize Ollama host (supports host:port without protocol)
          const { default: getOllamaHost } = await import('@/lib/ollama');
          const OLLAMA_HOST = getOllamaHost();

          // Build an instruction prompting the model to return a JSON matching the expected schema
          const prompt = `You are an AI art critic. Your persona is: "${critic}". Provide a JSON object with the following fields: ` +
            `critique (string), isAiUsed (boolean), aiUsageFeedback (string), artType (string), themeRelevance (string), intentionRespectFeedback (string). ` +
            `Consider the gallery theme: "${theme}" and the artist intention: "${artisticIntention}". ` +
            `Return only valid JSON. Here is the image (data URI): ${imageDataUri}`;

          try {
            const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: modelName, prompt }),
            });

            if (!res.ok) {
              throw new Error(`Ollama generate failed: ${res.status} ${res.statusText}`);
            }

            const body = await res.json();
            // Try to extract text content from common Ollama response shapes
            let text = '';
            if (body.output && Array.isArray(body.output) && body.output[0] && body.output[0].content) {
              text = body.output[0].content;
            } else if (body.result) {
              text = typeof body.result === 'string' ? body.result : JSON.stringify(body.result);
            } else if (typeof body === 'string') {
              text = body;
            } else {
              text = JSON.stringify(body);
            }

            // Parse JSON response from model into a record and normalize fields
            let parsed: Record<string, unknown> | null = null;
            try {
              parsed = JSON.parse(text) as Record<string, unknown>;
            } catch {
              const m = text.match(/\{[\s\S]*\}/);
              if (m) {
                try { parsed = JSON.parse(m[0]) as Record<string, unknown>; } catch { parsed = null; }
              }
            }

            if (!parsed) throw new Error('Could not parse JSON from Ollama response');

            const getString = (obj: Record<string, unknown> | null, keys: string[]) => {
              for (const k of keys) {
                const v = obj?.[k];
                if (typeof v === 'string') return v;
              }
              return '';
            };

            const getBoolean = (obj: Record<string, unknown> | null, key: string) => {
              const v = obj?.[key];
              if (typeof v === 'boolean') return v;
              if (typeof v === 'string') return v.toLowerCase() === 'true';
              return false;
            };

            const critiqueOut: ProvideAiPoweredImageCritiqueOutput = {
              critique: getString(parsed, ['critique', 'review']),
              isAiUsed: getBoolean(parsed, 'isAiUsed'),
              aiUsageFeedback: getString(parsed, ['aiUsageFeedback', 'ai_feedback']),
              artType: getString(parsed, ['artType', 'art_type']),
              themeRelevance: getString(parsed, ['themeRelevance', 'theme_relevance']),
              intentionRespectFeedback: getString(parsed, ['intentionRespectFeedback', 'intention_respect_feedback']),
            };

            return { status: 'success', data: { ...critiqueOut, imageId } };
          } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            return { status: 'error', error: `Ollama critique failed: ${msg}` };
          }
        }

        // Default: use configured GenKit/Gemini flow
        const critique = await provideAiPoweredImageCritiqueFlow({
          imageDataUri,
          artisticIntention,
          theme,
          critic,
        });

        return { status: 'success', data: {...critique, imageId } };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { status: 'error', error: `Failed to generate critique: ${errorMessage}` };
    }
}


export type GalleryCritiqueState = {
  status: 'success' | 'error' | 'idle' | 'loading';
  data?: Awaited<ReturnType<typeof provideAiPoweredGalleryCritiqueFlow>>;
  error?: string;
}

const galleryCritiqueSchema = z.object({
  theme: z.string(),
  images: z.string(), // JSON string of ImagePlaceholder[]
});

export async function getGalleryCritiqueAction(_prevState: GalleryCritiqueState, formData: FormData | {type: 'reset'}) : Promise<GalleryCritiqueState> {
    if (!(formData instanceof FormData)) {
      if ((formData as { type: string }).type === 'reset') {
        return { status: 'idle' };
      }
      return { status: 'error', error: 'Invalid input for gallery critique.' };
    }

    const validatedFields = galleryCritiqueSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { status: 'error', error: 'Invalid input for gallery critique.' };
    }

    const { theme, images: imagesJson } = validatedFields.data;
    const images: ImagePlaceholder[] = JSON.parse(imagesJson);

    try {
      const imageProms = images.map(async (image) => {
        const response = await fetch(image.imageUrl);
        if (!response.ok) {
            console.warn(`Failed to fetch image ${image.imageUrl}. Skipping.`);
            return null;
        }
        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        return {
          id: image.id,
          dataUri: `data:${mimeType};base64,${base64Image}`,
        };
      });

      const imageData = (await Promise.all(imageProms)).filter(Boolean) as {id: string, dataUri: string}[];

      const critique = await provideAiPoweredGalleryCritiqueFlow({
          theme,
          images: imageData,
      });

      return { status: 'success', data: critique };

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { status: 'error', error: `Failed to generate gallery critique: ${errorMessage}` };
    }
}
