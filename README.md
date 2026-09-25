# The 3D Print Live — Website

Static marketing site for [the3dprint.live](https://the3dprint.live): plain HTML/CSS/JS, no build step.
The code lives on GitHub, and Vercel deploys it automatically on every push.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Home page: hero, services, gallery, process, about, testimonials, FAQ, quote form |
| `styles.css` | All styling. Brand colors and fonts are the variables at the top |
| `script.js` | Mobile menu, footer year, "quote sent" confirmation |
| `images/` | Logo and photos (currently **placeholders**, see below) |
| `404.html` | Custom not-found page (Vercel serves it automatically) |
| `favicon.svg` | Site icon |
| `vercel.json` | Security headers, caching, clean URLs |
| `robots.txt`, `sitemap.xml` | SEO basics |

## Swapping in the real logo, photos, and brand

The hero and gallery use real project photos (`images/*.jpg`). To add or swap one, drop a
portrait (3:4) photo into `images/` and add a `<figure>` in the gallery section of `index.html`.

Everything still marked as a placeholder is designed to be replaced without touching the layout:

| Placeholder | Replace with |
| --- | --- |
| `images/logo.svg` (+ `favicon.svg`) | Real logo. If it's a PNG, update the `src` in `index.html` and `404.html` |
| `images/about.svg` | Workshop or team photo (about 5:4) |
| Testimonials section in `index.html` | Real customer reviews |

Brand colors and fonts are the variables in the `:root` block at the top of `styles.css`
(`--brand`, `--ink`, `--font-head`, …). Change them there and the whole site updates.

Tip: export photos as `.jpg` or `.webp` at about 1600px wide max to keep the site fast.

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
# or: npx vercel dev
```

Then open http://localhost:8000.

## Deploy on Vercel (one-time setup)

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New… → Project**, then import `tigger29900/the3dprint-live-site`.
3. Build settings:
   - Framework Preset: **Other**
   - Build Command: *(leave empty)*
   - Output Directory: *(leave empty, so the repo root is used)*
   - Install Command: *(leave empty)*
4. Click **Deploy**. You'll get a `*.vercel.app` URL within seconds.
5. **Settings → Domains**: add `the3dprint.live` (and `www.the3dprint.live`) and follow
   Vercel's DNS instructions at your registrar. HTTPS is issued automatically.

After that:
- Every push to `main` goes to **production**.
- Every other branch or pull request gets its own **preview URL**.

## Quote form

The form posts to [FormSubmit](https://formsubmit.co), which emails `sean@the3dprint.live`.
It sends in the background and shows a success or error message on the page.

**File uploads** (STL, 3MF, STEP, OBJ, images, PDF; up to 100 MB each, multiple allowed) go
directly from the visitor's browser to **Vercel Blob** storage, not through FormSubmit. The
quote email then includes a download link for each file in the `files` field.

- `api/upload.js`: Vercel Function that issues short-lived upload tokens. It only accepts
  requests from the site's own domains, only allows the file types above, stores everything
  under `quotes/` as a download (`application/octet-stream`), and adds a random suffix to
  each file name so links can't be guessed.
- `vendor/vercel-blob-client.js`: the `@vercel/blob` browser upload client, bundled so no
  third-party script is loaded. It's only downloaded when someone attaches a file.
  Regenerate after upgrading `@vercel/blob` with `npm install && npm run vendor:blob`.
- Requires a Blob store connected to the Vercel project (**Storage → Blob**), which sets the
  `BLOB_READ_WRITE_TOKEN` environment variable automatically.
- **Auto-cleanup:** `api/cleanup-uploads.js` runs daily at 09:00 UTC (Vercel Cron, set in
  `vercel.json`) and deletes files under `quotes/` older than **30 days**, so download links
  in older quote emails stop working after that. Only Vercel Cron can trigger it: it
  requires the `CRON_SECRET` environment variable (Production, Sensitive). Runs show up in
  Vercel → project → Settings → Cron Jobs, and in the runtime logs as
  `cleanup-uploads: checked N, deleted M`.

## Ideas for later

- Swap FormSubmit for a Vercel Function + email service (e.g. Resend)
- Analytics: Vercel Web Analytics (one click in the dashboard) + Google Search Console
