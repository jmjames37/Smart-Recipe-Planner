// Vercel serverless proxy (Node.js runtime) for the Anthropic Messages API.
//
// The Anthropic API key lives ONLY here, server-side (process.env.ANTHROPIC_API_KEY).
// The web and mobile clients POST the same request body they'd send to
// /v1/messages; we attach the key + version and forward it. Responses — including
// streaming SSE (stream: true) — are piped straight back to the client.
//
// This keeps the key out of the client bundle and removes the browser CORS
// problem (the web app calls this same-origin). No CORS header is set, so other
// websites can't call it from a browser.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// Typed loosely: Vercel injects its Node request/response objects at runtime,
// and this file is excluded from the app's TypeScript build.
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Method not allowed' } });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: 'Server is missing ANTHROPIC_API_KEY.' } });
    return;
  }

  // Vercel parses JSON request bodies into req.body; re-serialize to forward.
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    });
  } catch {
    res.status(502).json({ error: { message: 'Upstream request failed.' } });
    return;
  }

  res.status(upstream.status);
  const contentType = upstream.headers.get('content-type');
  if (contentType) res.setHeader('content-type', contentType);

  if (!upstream.body) {
    res.end();
    return;
  }

  // Pipe the upstream stream through (handles both JSON and SSE responses).
  const reader = upstream.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) res.write(value);
    }
  } finally {
    res.end();
  }
}
