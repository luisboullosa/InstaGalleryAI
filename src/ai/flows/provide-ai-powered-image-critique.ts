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

const ProvideAiPoweredImageCritiqueInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  theme: z.string().describe('The theme of the gallery.'),
  artisticIntention: z
    .string()
    .describe('The artistic intention behind the image.'),
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
  return provideAiPoweredImageCritiqueFlow(input);
}

const provideAiPoweredImageCritiquePrompt = ai.definePrompt({
  name: 'provideAiPoweredImageCritiquePrompt',
  input: {schema: ProvideAiPoweredImageCritiqueInputSchema},
  output: {schema: ProvideAiPoweredImageCritiqueOutputSchema},
  prompt: `You are an AI art critic providing critiques of images in a gallery.

  Provide a detailed critique of the image, considering the artistic intention, theme relevance, and AI usage.
  Identify the type of art (e.g., photography, plastic art).
  Determine if AI was used in the creation/edition of the image and provide feedback on how it was used.
  Assess how well the image aligns with the theme: {{{theme}}}.
  Consider the artist's stated intention: {{{artisticIntention}}}.

  Here is the image: {{media url=imageDataUri}}

  Your critique should be structured as follows:
  - Critique: [Detailed critique of the image]
  - Art Type: [The type of art]
  - AI Used: [Yes/No]
  - AI Usage Feedback: [Feedback on AI usage, if applicable]
  - Theme Relevance: [How relevant the image is to the theme]
  - Intention Respect Feedback: [How well did AI respect the author's intention]
  `,
});

const provideAiPoweredImageCritiqueFlow = ai.defineFlow(
  {
    name: 'provideAiPoweredImageCritiqueFlow',
    inputSchema: ProvideAiPoweredImageCritiqueInputSchema,
    outputSchema: ProvideAiPoweredImageCritiqueOutputSchema,
  },
  async input => {
    const {output} = await provideAiPoweredImageCritiquePrompt(input);
    return output!;
  }
);
