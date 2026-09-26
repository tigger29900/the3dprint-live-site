# 3D Print Live — Website

Static marketing site for [the3dprint.live](https://the3dprint.live): plain HTML/CSS/JS, no build step.
The code lives on GitHub, and Vercel deploys it automatically on every push.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Home page: hero, services, gallery, process, about, testimonials, FAQ, quote form |
| `styles.css` | All styling. Brand colors and fonts are the variables at the top |
| `script.js` | Mobile menu, footer year, "quote sent" confirmation |
| `images/` | Project photos, `images/brand/` logos |
| `404.html` | Custom not-found page (Vercel serves it automatically) |
| `favicon.svg` | Site icon |
| `vercel.json` | Security headers, caching, clean URLs |
| `robots.txt`, `sitemap.xml` | SEO basics |

## Branding

The full brand kit lives in `brand-kit/` (see `brand-kit/README.md` for the rules). It's
kept in the repo for reference but excluded from deployments via `.vercelignore`.

- **Logos** (`images/brand/`): stacked logo only, never a horizontal lockup.
  `logo-stacked-light.svg` in the hero and 404 page, `logo-stacked-dark.svg` in the dark
  footer, `logo-mark.svg` (mark only) in the compact sticky header. Stacked logo min width
  120px; mark min 24px.
- **Favicons:** `favicon.svg` (brand avatar), `favicon-32.png`, `apple-touch-icon.png`.
- **Colors** are CSS variables at the top of `styles.css`: Azure `#0A7CFF` / `#0062D1` (text
  and buttons, passes contrast), Apricot `#FF8A3D`, Ink `#111418`, Light ground `#F4F5F7`.
  Blue means "already built" and apricot means "printing now".
- **Font:** Nunito, self-hosted from `fonts/` (SIL Open Font License, `fonts/OFL.txt`); no
  Google Fonts request.
- **Tagline:** "Building your idea one layer at a time." (website only, never inside the logo)

Real project photos are in `images/*.jpg`; customer testimonials are in the Testimonials section of `index.html`.

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
