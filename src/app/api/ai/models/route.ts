import { NextResponse } from 'next/server';
import getOllamaHost from '@/lib/ollama';

const OLLAMA_HOST = getOllamaHost();

export async function GET() {
  const models: string[] = [];

  // Include Gemini (Google) only when API key is configured
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  if (hasGeminiKey) {
    models.push('googleai/gemini-2.5-flash');
  }

  // Try to discover Ollama models running locally
  try {
    const res = await fetch(`${OLLAMA_HOST}/models`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      // Expecting an array of model objects or strings
      if (Array.isArray(data)) {
        for (const m of data) {
          // If object with name, use that, otherwise stringify
          const name = typeof m === 'string' ? m : m.name || JSON.stringify(m);
          models.push(`ollama:${name}`);
        }
      }
    }
  } catch {
    // ignore discovery errors — Ollama not running
  }

  return NextResponse.json({ models });
}
