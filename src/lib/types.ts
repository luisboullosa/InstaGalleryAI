import type { ProvideAiPoweredImageCritiqueOutput } from '@/ai/flows/provide-ai-powered-image-critique';

export type Critique = ProvideAiPoweredImageCritiqueOutput & { 
  imageId: string; 
  artisticIntention: string;
};

export type Theme = {
  name: string;
  source: 'user' | 'ai';
};
