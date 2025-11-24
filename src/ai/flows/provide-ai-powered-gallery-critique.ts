'use server';

/**
 * @fileOverview An AI agent that provides critiques of an entire image gallery.
 *
 * - provideAiPoweredGalleryCritique - A function that provides a gallery critique.
 * - ProvideAiPoweredGalleryCritiqueInput - The input type for the function.
 * - ProvideAiPoweredGalleryCritiqueOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageInputSchema = z.object({
  id: z.string(),
  dataUri: z.string().describe('An image as a data URI.'),
});

const ProvideAiPoweredGalleryCritiqueInputSchema = z.object({
  images: z.array(ImageInputSchema).describe('The images in the gallery.'),
  theme: z.string().describe('The theme of the gallery.'),
});
export type ProvideAiPoweredGalleryCritiqueInput = z.infer<typeof ProvideAiPoweredGalleryCritiqueInputSchema>;

const CritiqueSectionSchema = z.object({
    critic: z.string().describe('The critic making the statement (e.g., "Pretentious Art Critic", "Supportive Photographer").'),
    statement: z.string().describe('The critique statement.'),
});

const ProvideAiPoweredGalleryCritiqueOutputSchema = z.object({
  overallAssessment: z.array(CritiqueSectionSchema).describe('Overall assessment of the gallery from multiple critics.'),
  curationAndCoherence: z.array(CritiqueSectionSchema).describe('Feedback on image curation and thematic coherence.'),
  emergingThreads: z.array(CritiqueSectionSchema).describe('Observations on interesting threads or patterns running through the images.'),
  futureDevelopment: z.array(CritiqueSectionSchema).describe('Suggestions for the future development of the work.'),
});
export type ProvideAiPoweredGalleryCritiqueOutput = z.infer<typeof ProvideAiPoweredGalleryCritiqueOutputSchema>;

export async function provideAiPoweredGalleryCritique(
  input: ProvideAiPoweredGalleryCritiqueInput
): Promise<ProvideAiPoweredGalleryCritiqueOutput> {
  return provideAiPoweredGalleryCritiqueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiPoweredGalleryCritiquePrompt',
  input: {schema: ProvideAiPoweredGalleryCritiqueInputSchema},
  output: {schema: ProvideAiPoweredGalleryCritiqueOutputSchema},
  prompt: `You are a council of AI art critics tasked with reviewing a gallery of images. Your council consists of the "Pretentious Art Critic" and the "Supportive Photographer". Each of you must provide feedback.

The theme of this gallery is: "{{theme}}".

Here are the images:
{{#each images}}
  Image {{id}}: {{media url=dataUri}}
{{/each}}

Please provide a comprehensive critique of the gallery as a whole. Address the following points, with each point containing statements from both the "Pretentious Art Critic" and the "Supportive Photographer":

1.  **Overall Assessment**: What is your general impression of the gallery? What are its strengths and weaknesses?
2.  **Curation and Coherence**: How well do the images work together? Do they tell a cohesive story or explore the theme effectively?
3.  **Emerging Threads**: Are there any interesting visual or conceptual threads that run through several images?
4.  **Future Development**: What advice would you give the artist for future work based on this gallery? How could they expand on these ideas or improve their execution?

For each point, provide a 'statement' and attribute it to the 'critic' who said it. Structure your response as a JSON object. Be thoughtful and constructive.`,
});

const provideAiPoweredGalleryCritiqueFlow = ai.defineFlow(
  {
    name: 'provideAiPoweredGalleryCritiqueFlow',
    inputSchema: ProvideAiPoweredGalleryCritiqueInputSchema,
    outputSchema: ProvideAiPoweredGalleryCritiqueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
