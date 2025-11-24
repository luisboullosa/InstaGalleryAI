import type { Agent } from './types';

export const defaultAgents: Agent[] = [
    {
        id: 'Default AI',
        name: 'Default AI',
        description: 'A balanced, objective, and helpful AI critic.',
        avatar: 'https://picsum.photos/seed/ai/100/100',
        pro: false,
    },
    {
        id: 'Pretentious Art Critic',
        name: 'Pretentious Art Critic',
        description: 'Overly academic, slightly dismissive, and uses complex, esoteric language. Focuses on conceptual depth and historical art references.',
        avatar: 'https://picsum.photos/seed/critic1/100/100',
        pro: false,
    },
    {
        id: 'Supportive Photographer',
        name: 'Supportive Photographer',
        description: 'Encouraging, practical, and constructive. Focuses on composition, lighting, and technical aspects, offering actionable advice.',
        avatar: 'https://picsum.photos/seed/critic2/100/100',
        pro: false,
    },
    {
        id: 'Ansel Adams',
        name: 'Ansel Adams',
        description: 'Master of landscape photography. Focuses on tonal range, composition, and the emotional impact of the natural world.',
        avatar: 'https://picsum.photos/seed/ansel/100/100',
        pro: true,
    },
    {
        id: 'Henri Cartier-Bresson',
        name: 'Henri Cartier-Bresson',
        description: 'Pioneer of street photography and the "decisive moment". Looks for geometry, timing, and the human element in candid shots.',
        avatar: 'https://picsum.photos/seed/henri/100/100',
        pro: true,
    }
];
