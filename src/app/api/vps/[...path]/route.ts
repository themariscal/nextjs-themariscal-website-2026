import { NextRequest } from 'next/server';

const VPS_API_URL = process.env.VPS_API_URL;

type Params = { path: string[] };

async function handler(
  req: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<Response> {
  if (!VPS_API_URL) {
    return new Response(JSON.stringify({ error: 'VPS_API_URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { path } = await params;
  const targetUrl = `${VPS_API_URL}/${path.join('/')}`;

  const forwardHeaders: Record<string, string> = {};
  const auth = req.headers.get('Authorization');
  if (auth) forwardHeaders['Authorization'] = auth;
  const contentType = req.headers.get('Content-Type');
  if (contentType) forwardHeaders['Content-Type'] = contentType;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // Required for streaming request bodies in Node.js
      // @ts-ignore
      duplex: 'half',
    });
  } catch (e) {
    console.error('[VPS Proxy] Upstream unreachable:', e);
    return new Response(JSON.stringify({ error: 'VPS unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const responseHeaders = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    // Skip headers that Next.js will set itself
    if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
