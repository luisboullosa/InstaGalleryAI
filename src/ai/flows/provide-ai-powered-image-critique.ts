'use server';

/**
 * @fileOverview An AI agent that provides critiques of individual images in a gallery.
 *
 * - provideAiPoweredImageCritique - A function that provides critiques of individual images.
 * - ProvideAiPoweredImageCritiqueInput - The input type for the provideAiPoweredImageCritique function.
 * - ProvideAiPoweredImageCritiqueOutput - The return type for the provideAiPoweredImageCritique function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CriticSchema } from '@/lib/types';


const ProvideAiPoweredImageCritiqueInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  theme: z.string().describe('The theme of the gallery.'),
  artisticIntention: z
    .string()
    .describe('The artistic intention behind the image.'),
  critic: CriticSchema.describe('The selected AI critic persona.'),
});
export type ProvideAiPoweredImageCritiqueInput = z.infer<
  typeof ProvideAiPoweredImageCritiqueInputSchema
>;

const ProvideAiPoweredImageCritiqueOutputSchema = z.object({
  critique: z.string().describe('The AI-powered critique of the image.'),
  isAiUsed: z
    .boolean()
    .describe('Whether AI was used in the creation/edition of the image.'),
  aiUsageFeedback: z
    .string()
    .describe(
      'Feedback on how AI was used in the image creation/edition process.'
    ),
  artType: z.string().describe('The type of art (e.g., photography, plastic art).'),
  themeRelevance: z
    .string()
    .describe('How relevant the image is to the theme.'),
  intentionRespectFeedback: z
    .string()
    .describe('Whether AI usage respected author\'s intention.'),
});
export type ProvideAiPoweredImageCritiqueOutput = z.infer<
  typeof ProvideAiPoweredImageCritiqueOutputSchema
>;

export async function provideAiPoweredImageCritique(
  input: ProvideAiPoweredImageCritiqueInput
): Promise<ProvideAiPoweredImageCritiqueOutput> {
  // If a Gemini/Google API key is configured, use genkit (Gemini). Otherwise fallback to local Ollama.
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  if (hasGeminiKey) {
    const result = await (provideAiPoweredImageCritiqueFlow as unknown as (input: unknown) => Promise<ProvideAiPoweredImageCritiqueOutput>)(input);
    return result as ProvideAiPoweredImageCritiqueOutput;
  }

  // Normalize Ollama host (supports host:port without protocol)
  const { default: getOllamaHost } = await import('@/lib/ollama');
  const OLLAMA_HOST = getOllamaHost();

  // Build a plain-text prompt similar to the genkit prompt template.
  const prompt = `You are an AI art critic. Your persona for this critique is: "${input.critic}". You MUST adopt this persona in your response.

  Provide a detailed critique of the image, considering the artistic intention, theme relevance, and AI usage, all from the perspective of your assigned persona.
  Identify the type of art (e.g., photography, plastic art).
  Determine if AI was used in the creation/edition of the image and provide feedback on how it was used.
  Assess how well the image aligns with the gallery's theme: "${input.theme}".
  Consider the artist's stated intention: "${input.artisticIntention}".

  Here is the image: ${input.imageDataUri}

  Your critique should be structured as a JSON object with the following fields:
  - critique: A detailed critique of the image from your persona's viewpoint.
  - artType: The identified type of art.
  - isAiUsed: A boolean indicating if AI was used.
  - aiUsageFeedback: Feedback on AI usage, if applicable.
  - themeRelevance: Your assessment of how relevant the image is to the gallery's theme.
  - intentionRespectFeedback: How well any AI usage respected the author's stated intention.
  `;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama2', prompt }),
    });
    if (!res.ok) throw new Error(`Ollama call failed: ${res.status} ${res.statusText}`);
    const body = await res.json();
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

    let parsed = null;
    try { parsed = JSON.parse(text); } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { parsed = null; }
      }
    }

    if (!parsed) throw new Error('Could not parse JSON from Ollama response');

    return {
      critique: String(parsed.critique || parsed.review || ''),
      isAiUsed: Boolean(parsed.isAiUsed),
      aiUsageFeedback: String(parsed.aiUsageFeedback || parsed.ai_feedback || ''),
      artType: String(parsed.artType || parsed.art_type || ''),
      themeRelevance: String(parsed.themeRelevance || parsed.theme_relevance || ''),
      intentionRespectFeedback: String(parsed.intentionRespectFeedback || parsed.intention_respect_feedback || ''),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const provideAiPoweredImageCritiquePrompt = ai.definePrompt({
  name: 'provideAiPoweredImageCritiquePrompt',
  input: {schema: ProvideAiPoweredImageCritiqueInputSchema},
  output: {schema: ProvideAiPoweredImageCritiqueOutputSchema},
  prompt: `You are an AI art critic. Your persona for this critique is: "{{critic}}". You MUST adopt this persona in your response.

  - If you are the "Pretentious Art Critic", be overly academic, slightly dismissive, and use complex, esoteric language. Focus on conceptual depth and historical art references.
  - If you are the "Supportive Photographer", be encouraging, practical, and constructive. Focus on composition, lighting, and technical aspects, offering actionable advice.
  - If you are "Ansel Adams", critique as the master of landscape photography. Focus on tonal range, composition, and the emotional impact of the natural world, especially in black and white.
  - If you are "Henri Cartier-Bresson", critique as the pioneer of street photography. Look for the "decisive moment", the geometry of the scene, and the candid human element.
  - If you are the "Default AI", provide a balanced, objective, and helpful critique.

  Provide a detailed critique of the image, considering the artistic intention, theme relevance, and AI usage, all from the perspective of your assigned persona.
  Identify the type of art (e.g., photography, plastic art).
  Determine if AI was used in the creation/edition of the image and provide feedback on how it was used.
  Assess how well the image aligns with the gallery's theme: "{{theme}}".
  Consider the artist's stated intention: "{{artisticIntention}}".

  Here is the image: {{media url=imageDataUri}}

  Your critique should be structured as a JSON object with the following fields:
  - critique: A detailed critique of the image from your persona's viewpoint.
  - artType: The identified type of art.
  - isAiUsed: A boolean indicating if AI was used.
  - aiUsageFeedback: Feedback on AI usage, if applicable.
  - themeRelevance: Your assessment of how relevant the image is to the gallery's theme.
  - intentionRespectFeedback: How well any AI usage respected the author's stated intention.
  `,
});

const provideAiPoweredImageCritiqueFlow = ai.defineFlow(
  {
    name: 'provideAiPoweredImageCritiqueFlow',
    inputSchema: ProvideAiPoweredImageCritiqueInputSchema,
    outputSchema: ProvideAiPoweredImageCritiqueOutputSchema,
  },
  async (input: unknown) => {
    const typed = input as ProvideAiPoweredImageCritiqueInput;
    const {output} = await provideAiPoweredImageCritiquePrompt(typed);
    return output as ProvideAiPoweredImageCritiqueOutput;
  }
);
