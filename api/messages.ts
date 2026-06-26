// Vercel serverless proxy for the Anthropic Messages API.
//
// The Anthropic API key lives ONLY here, server-side (process.env.ANTHROPIC_API_KEY).
// The web and mobile clients POST the same request body they'd send to
// /v1/messages to this endpoint; we attach the key + version and forward it.
// Responses (including streaming SSE) are piped straight back to the client.
//
// This keeps the key out of the client bundle entirely and removes the browser
// CORS problem (the web app calls this same-origin).

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: { message: 'Method not allowed' } }, 405);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      { error: { message: 'Server is missing ANTHROPIC_API_KEY.' } },
      500
    );
  }

  const body = await request.text();

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
    return json({ error: { message: 'Upstream request failed.' } }, 502);
  }

  // Stream the upstream response straight through, preserving status and the
  // content type (application/json for normal calls, text/event-stream when the
  // request asked for stream: true). No CORS header is set, so browsers can only
  // call this from the same origin (the deployed site).
  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
