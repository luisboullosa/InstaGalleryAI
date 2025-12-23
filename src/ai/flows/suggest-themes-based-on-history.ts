'use server';

/**
 * @fileOverview AI theme suggestion based on user's Instagram posting history.
 *
 * - suggestThemes - A function that suggests gallery themes.
 * - SuggestThemesInput - The input type for the suggestThemes function.
 * - SuggestThemesOutput - The return type for the suggestThemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestThemesInputSchema = z.object({
  postingHistory: z
    .string()
    .describe(
      'The user Instagram posting history as text description. Provide as much detail as possible.'
    ),
  numberOfSuggestions: z
    .number()
    .default(3)
    .describe('The number of theme suggestions to return.'),
});
export type SuggestThemesInput = z.infer<typeof SuggestThemesInputSchema>;

const SuggestThemesOutputSchema = z.object({
  themes: z.array(z.string()).describe('Array of suggested gallery themes.'),
});
export type SuggestThemesOutput = z.infer<typeof SuggestThemesOutputSchema>;

export async function suggestThemes(input: SuggestThemesInput): Promise<SuggestThemesOutput> {
  const r = await (suggestThemesFlow as unknown as (input: unknown) => Promise<SuggestThemesOutput>)(input);
  return r as SuggestThemesOutput;
}

const prompt = ai.definePrompt({
  name: 'suggestThemesPrompt',
  input: {schema: SuggestThemesInputSchema},
  output: {schema: SuggestThemesOutputSchema},
  prompt: `You are a gallery curator who suggests themes for art galleries.

Given the following Instagram posting history, suggest {{numberOfSuggestions}} gallery themes that would be relevant and engaging for the user.

Posting History: {{{postingHistory}}}

Respond with a JSON object that contains an array of themes.
Example: {"themes": ["Theme 1", "Theme 2", "Theme 3"]}
`,
});

const suggestThemesFlow = ai.defineFlow(
  {
    name: 'suggestThemesFlow',
    inputSchema: SuggestThemesInputSchema,
    outputSchema: SuggestThemesOutputSchema,
  },
  async (input: unknown) => {
    const parsed = SuggestThemesInputSchema.parse(input);
    const {output} = await prompt(parsed);
    return output as SuggestThemesOutput;
  }
);
