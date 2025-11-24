import type { ProvideAiPoweredImageCritiqueOutput } from '@/ai/flows/provide-ai-powered-image-critique';
import { z } from 'zod';

export const CriticSchema = z.enum([
  "Default AI",
  "Pretentious Art Critic",
  "Supportive Photographer",
]);
export type Critic = z.infer<typeof CriticSchema>;

export type Critique = ProvideAiPoweredImageCritiqueOutput & { 
  imageId: string; 
  artisticIntention: string;
};

export type Theme = {
  name: string;
  source: 'user' | 'ai';
};
