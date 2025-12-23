import type { ProvideAiPoweredImageCritiqueOutput } from '@/ai/flows/provide-ai-powered-image-critique';
import { z } from 'zod';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
};

export const CriticSchema = z.enum([
  "Default AI",
  "Pretentious Art Critic",
  "Supportive Photographer",
  "Ansel Adams",
  "Henri Cartier-Bresson"
]);
export type Critic = z.infer<typeof CriticSchema>;

export type Critique = ProvideAiPoweredImageCritiqueOutput & { 
  imageId: string; 
  artisticIntention: string;
};

export type Theme = {
  name: string;
  source: 'user' | 'ai';
  strictness?: number; // 0-100 selection strictness used when creating galleries
};

export type SavedGallery = {
    id: string;
    theme: Theme;
    images: ImagePlaceholder[];
    critiques: Critique[];
};

export type Agent = {
  id: Critic;
  name: Critic;
  description: string;
  avatar: string;
  pro: boolean;
};
