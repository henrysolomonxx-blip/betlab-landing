# betlab-landing

The BetLab landing page: a static site with an early-access email form,
deployed as a Cloudflare Worker.

- `public/` — the page (`index.html`, `styles.css`, `app.js`, badge art). No build step.
- `src/worker.js` — handles `POST /api/subscribe` and saves each email to a D1
  database. It creates its `signups` table on first use.
- `wrangler.jsonc` — tells Cloudflare where the page and the Worker are, and to
  bind a D1 database named `betlab-signups` as `DB`. Wrangler creates that
  database on the first deploy.

Cloudflare redeploys automatically on every push to `main` (deploy command:
`npx wrangler deploy`).

## Seeing the list

Cloudflare dashboard → Storage & Databases → D1 → `betlab-signups` → Console:

```sql
SELECT email, source, created_at FROM signups ORDER BY created_at DESC;
```

## Running it locally

```
npx wrangler dev
```

This repository is public. Never commit keys, passwords or the email list here.
