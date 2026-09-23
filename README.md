# The 3D Print Live — Website

Static marketing site for [the3dprint.live](https://the3dprint.live): plain HTML/CSS/JS, no build step.
The code lives on GitHub, and Vercel deploys it automatically on every push.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Home page: services, process, use cases, quote form |
| `styles.css` | All styling (mobile-first, dark theme) |
| `script.js` | Footer year + "quote sent" confirmation |
| `404.html` | Custom not-found page (Vercel serves it automatically) |
| `favicon.svg` | Site icon |
| `vercel.json` | Security headers, caching, clean URLs |
| `robots.txt`, `sitemap.xml` | SEO basics |

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
After a submission, visitors come back to `/?quote=sent#contact` and see a confirmation message.

## Ideas for later

- Logo and real project photos / gallery
- Testimonials and case studies
- Swap FormSubmit for a Vercel Function + email service (e.g. Resend)
- Analytics: Vercel Web Analytics (one click in the dashboard) + Google Search Console
