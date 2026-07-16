type JsonRecord = Record<string, any>;

export type NodeLikeRequest = {
  method?: string;
  url?: string;
  body?: any;
  on: (eventName: string, cb: (...args: any[]) => void) => void;
  destroy?: () => void;
};

export type NodeLikeResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

export async function readJsonBody(req: NodeLikeRequest): Promise<JsonRecord> {
  return await new Promise((resolve, reject) => {
    try {
      if (req.body && typeof req.body === 'object') return resolve(req.body);

      let raw = '';
      req.on('data', (chunk: any) => {
        raw += String(chunk ?? '');
        if (raw.length > 100_000) {
          reject(new Error('Request body too large'));
          try { req.destroy?.(); } catch {}
        }
      });

      req.on('end', () => {
        if (!raw.trim()) return resolve({});
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error('Malformed JSON body'));
        }
      });

      req.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

function getEnvForSection(sectionRaw: string | undefined | null) {
  const section = String(sectionRaw || '').trim().toUpperCase() || 'PROJECTS';

  const keyName = `GOOGLE_CSE_KEY_${section}`;
  const cxName = `GOOGLE_CSE_CX_${section}`;

  // Prefer server-only env vars, but fall back to VITE_* for compatibility.
  // (Note: Vercel functions can access process.env at runtime.)
  const apiKey =
    process.env[keyName] ||
    process.env[`VITE_${keyName}`] ||
    process.env[`VITE_GOOGLE_CSE_KEY_${section}`] ||
    '';

  const cx =
    process.env[cxName] ||
    process.env[`VITE_${cxName}`] ||
    process.env[`VITE_GOOGLE_CSE_CX_${section}`] ||
    '';

  return { section, apiKey: String(apiKey || '').trim(), cx: String(cx || '').trim() };
}

export async function handleGoogleCseProxy(req: NodeLikeRequest, res: NodeLikeResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body: JsonRecord;
  try {
    body = (await readJsonBody(req)) || {};
  } catch (e: any) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e?.message || 'Invalid request body' }));
    return;
  }

  const q = String(body.q || '').trim();
  if (!q) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing required field: q' }));
    return;
  }

  const { apiKey, cx, section } = getEnvForSection(body.section);
  if (!apiKey || !cx) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: `Google CSE not configured for section ${section}. Set env vars GOOGLE_CSE_KEY_${section} and GOOGLE_CSE_CX_${section}.`,
      })
    );
    return;
  }

  const num = Math.min(10, Math.max(1, Number(body.num || 10)));
  const start = Math.min(91, Math.max(1, Number(body.start || 1))); // start max 91 (when num=10)
  const dateRestrict = body.dateRestrict ? String(body.dateRestrict).trim() : '';

  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', q);
  url.searchParams.set('num', String(num));
  url.searchParams.set('start', String(start));
  if (dateRestrict) url.searchParams.set('dateRestrict', dateRestrict);

  try {
    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      let details: any = text;
      try { details = JSON.parse(text); } catch {}

      res.statusCode = upstream.status;
      res.end(JSON.stringify({ error: 'Google CSE request failed', status: upstream.status, details }));
      return;
    }

    res.statusCode = 200;
    res.end(text);
  } catch (e: any) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: e?.message || 'Upstream fetch failed' }));
  }
}
