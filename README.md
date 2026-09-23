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

Everything marked as a placeholder is designed to be replaced without touching the layout:

| Placeholder | Replace with |
| --- | --- |
| `images/logo.svg` (+ `favicon.svg`) | Real logo. If it's a PNG, update the `src` in `index.html` and `404.html` |
| `images/hero.svg` | Main photo (landscape, about 4:3) |
| `images/about.svg` | Workshop or team photo (about 5:4) |
| `images/gallery-1.svg` … `gallery-6.svg` | Project photos (square works best), and update the captions in `index.html` |
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

The form posts to [FormSubmit](https://formsubmit.co) → `sean@the3dprint.live`.
The first time someone submits it, FormSubmit emails a verification link. Click it once to turn on delivery.
The form also accepts an optional file attachment (STL, 3MF, STEP, or an image).
After a submission, visitors come back to `/?quote=sent#quote` and see a confirmation message.

## Ideas for later

- Swap FormSubmit for a Vercel Function + email service (e.g. Resend)
- Analytics: Vercel Web Analytics (one click in the dashboard) + Google Search Console
