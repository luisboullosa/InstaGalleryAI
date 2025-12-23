'use server';

/**
 * @fileOverview Detects the artistic type of an image and how AI was used in its creation.
 *
 * - detectArtisticTypeAndAIUsage - A function that handles the detection process.
 * - DetectArtisticTypeAndAIUsageInput - The input type for the detectArtisticTypeAndAIUsage function.
 * - DetectArtisticTypeAndAIUsageOutput - The return type for the detectArtisticTypeAndAIUsage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectArtisticTypeAndAIUsageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a work of art, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  artistIntention: z.string().optional().describe('The artist intention behind the artwork.'),
});
export type DetectArtisticTypeAndAIUsageInput = z.infer<typeof DetectArtisticTypeAndAIUsageInputSchema>;

const DetectArtisticTypeAndAIUsageOutputSchema = z.object({
  artisticType: z.string().describe('The artistic type of the image (e.g., photography, plastic art, painting).'),
  aiUsage: z.string().describe('How AI was used in the creation/edition of the image (e.g., AI-assisted editing, AI-generated elements, no AI usage).'),
  aiImprovementAssessment: z.string().optional().describe('Assessment of whether AI usage improved the image and respected the author intention.'),
});
export type DetectArtisticTypeAndAIUsageOutput = z.infer<typeof DetectArtisticTypeAndAIUsageOutputSchema>;

export async function detectArtisticTypeAndAIUsage(input: DetectArtisticTypeAndAIUsageInput): Promise<DetectArtisticTypeAndAIUsageOutput> {
  const r = await (detectArtisticTypeAndAIUsageFlow as unknown as (input: unknown) => Promise<DetectArtisticTypeAndAIUsageOutput>)(input);
  return r as DetectArtisticTypeAndAIUsageOutput;
}

const prompt = ai.definePrompt({
  name: 'detectArtisticTypeAndAIUsagePrompt',
  input: {schema: DetectArtisticTypeAndAIUsageInputSchema},
  output: {schema: DetectArtisticTypeAndAIUsageOutputSchema},
  prompt: `You are an art expert analyzing the artistic type and AI usage in a given image.

Analyze the following image and provide the artistic type (e.g., photography, plastic art, painting) and how AI was used in its creation/edition.

{% if artistIntention %}The artist's intention is described as follows: {{{artistIntention}}}.  If AI was used, assess whether AI usage improved the image and respected the author's intention.  If the AI was used inappropriately given the intention, explain how.  If the AI usage was appropriate, explain why it was.  If AI was not used, state that clearly.{% endif %}

Image: {{media url=photoDataUri}}

Format your response as a JSON object. Be concise.
`,
});

const detectArtisticTypeAndAIUsageFlow = ai.defineFlow(
  {
    name: 'detectArtisticTypeAndAIUsageFlow',
    inputSchema: DetectArtisticTypeAndAIUsageInputSchema,
    outputSchema: DetectArtisticTypeAndAIUsageOutputSchema,
  },
  async (input: unknown) => {
    const typed = input as DetectArtisticTypeAndAIUsageInput;
    const {output} = await prompt(typed);
    return output as DetectArtisticTypeAndAIUsageOutput;
  }
);
