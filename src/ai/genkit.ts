import { genkit } from 'genkit';

type PromptCallable = (input: unknown) => Promise<{ output?: unknown; promptText?: string }>;

type GenkitStub = {
  definePrompt: (opts: { prompt?: string }) => PromptCallable;
  defineFlow: (config: unknown, fn: (input: unknown) => Promise<unknown>) => (input: unknown) => Promise<unknown>;
};

let ai: ReturnType<typeof genkit> | GenkitStub;
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

if (hasGeminiKey) {
  // Dynamically import the googleAI plugin only when a key is present.
  // Use top-level await to avoid require() style imports which ESLint flags.
  const google = await import('@genkit-ai/google-genai');
  const googleAI = (google as unknown as { googleAI?: (...args: unknown[]) => unknown }).googleAI as () => unknown;
  ai = genkit({ plugins: [googleAI() as unknown], model: 'googleai/gemini-2.5-flash' }) as unknown as ReturnType<typeof genkit>;
} else {
  // Minimal stub for environments without Gemini; keeps same runtime API shape used by flows.
  ai = {
    definePrompt: (opts: { prompt?: string }) => {
      const promptText = opts?.prompt ?? '';
      const callable: PromptCallable = async (_input: unknown) => {
        void _input;
        return { output: undefined, promptText };
      };
      return callable;
    },
    defineFlow: (_config: unknown, _fn: (input: unknown) => Promise<unknown>) => {
      void _config;
      void _fn;
      return async (_input: unknown) => {
        void _input;
        throw new Error('GenKit/Gemini not configured');
      };
    },
  };
}

export { ai };
