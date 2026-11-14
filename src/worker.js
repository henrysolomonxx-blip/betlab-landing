// The site's Worker. Static files in public/ are served by Cloudflare before
// this runs; this only handles POST /api/subscribe, which saves an
// early-access email in the D1 database bound as `DB`. The table is created on first use, so there is no SQL to run by
// hand. Only the email, which form it came from and the time are stored.

const CREATE = `CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  created_at TEXT NOT NULL
)`;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function reply(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function subscribe(request, env) {
  // Only accept posts from this site's own pages.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return reply({ ok: false, error: 'forbidden' }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return reply({ ok: false, error: 'bad_request' }, 400);
  }
  if (!body || typeof body !== 'object') {
    return reply({ ok: false, error: 'bad_request' }, 400);
  }

  // Hidden field real people never fill in. Bots get a quiet "ok".
  if (body.company) {
    return reply({ ok: true });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) {
    return reply({ ok: false, error: 'invalid_email' }, 400);
  }
  const source = String(body.source || '').slice(0, 40);

  if (!env.DB) {
    return reply({ ok: false, error: 'not_configured' }, 503);
  }

  try {
    await env.DB.batch([
      env.DB.prepare(CREATE),
      env.DB.prepare(
        'INSERT INTO signups (email, source, created_at) VALUES (?1, ?2, ?3) ON CONFLICT(email) DO NOTHING'
      ).bind(email, source, new Date().toISOString()),
    ]);
  } catch (e) {
    return reply({ ok: false, error: 'server_error' }, 500);
  }

  // Same answer whether the address is new or already on the list.
  return reply({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') {
        return reply({ ok: false, error: 'method_not_allowed' }, 405);
      }
      return subscribe(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
