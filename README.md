# The 3D Print Live - Cloudflare Pages Site

This version is optimized for speed + conversion and includes a live quote form.

## Deploy on Cloudflare Pages

1. Create a GitHub repo and push this `business-site` folder.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Select your repo.
4. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
5. Add custom domain: `the3dprint.live`
6. Enable automatic deploys on new commits.

## Included optimization

- Fast static site (HTML/CSS/JS only)
- SEO basics: canonical, meta tags, schema
- `robots.txt` + `sitemap.xml`
- Security/perf headers via `_headers`
- Mobile-first layout
- Conversion-focused CTA and quote form

## Quote form setup

Form currently posts to FormSubmit:
- Endpoint: `https://formsubmit.co/sean@the3dprint.live`

After first submit, FormSubmit may email a verification link. Approve it once to activate submissions.

## Optional next upgrades

- Add logo and real project photos
- Add testimonials/case studies
- Replace FormSubmit with Cloudflare Functions + email webhook
- Add analytics (Plausible/GA4 + Search Console)
