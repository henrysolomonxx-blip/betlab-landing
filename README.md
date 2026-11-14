# betlab-landing

The BetLab landing page: a static site with an early-access email form.

- `public/` — the page (`index.html`, `styles.css`, `app.js`, badge art). No build step.
- `functions/api/subscribe.js` — a Cloudflare Pages Function that saves each email
  to a D1 database. It creates its `signups` table on first use.

## Cloudflare Pages settings

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `public` |

After the first deploy, add a D1 binding so the form can save emails:
Pages project → Settings → Bindings → Add → D1 database → variable name **`DB`**,
then redeploy. Until that is done the form answers "Signups are not switched on yet."

## Seeing the list

Cloudflare dashboard → Storage & Databases → D1 → the database → Console:

```sql
SELECT email, source, created_at FROM signups ORDER BY created_at DESC;
```

## Running it locally

```
npx wrangler pages dev public --d1 DB=local
```

This repository is public. Never commit keys, passwords or the email list here.
