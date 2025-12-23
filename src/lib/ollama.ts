export function getOllamaHost(): string {
  const raw = process.env.OLLAMA_HOST || process.env.OLLAMA_URL || '';
  if (!raw) return 'http://127.0.0.1:11434';

  // If user provided host without protocol, assume http
  if (!/^https?:\/\//i.test(raw)) {
    return `http://${raw}`;
  }

  return raw;
}

export default getOllamaHost;
