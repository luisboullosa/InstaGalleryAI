import type { ProvideAiPoweredImageCritiqueOutput } from '@/ai/flows/provide-ai-powered-image-critique';
import { z } from 'zod';
import type { ImagePlaceholder } from './placeholder-images';

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
