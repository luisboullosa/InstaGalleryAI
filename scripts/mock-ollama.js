#!/usr/bin/env node
const http = require('http');
const url = require('url');

const PORT = 11434;

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (req.method === 'GET' && parsed.pathname === '/models') {
    const models = [
      { name: 'llama2-13b' },
      { name: 'vicuna-13b' },
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(models));
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/generate') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const payload = JSON.parse(body || '{}');
      const model = payload.model || 'unknown';
      const prompt = payload.prompt || '';

      // Return a fake structured critique as model output
      const critique = {
        critique: `Sample critique from mock ${model}: The image composition is strong.`,
        isAiUsed: false,
        aiUsageFeedback: 'No AI detected in this mock output.',
        artType: 'photography',
        themeRelevance: 'High',
        intentionRespectFeedback: 'Respects stated intention.',
      };

      const outputText = JSON.stringify(critique);
      const bodyOut = { output: [{ content: outputText }] };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(bodyOut));
      return;
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'bad request' }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock Ollama server listening on http://127.0.0.1:${PORT}`);
});
