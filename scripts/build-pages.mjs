// Generates the site's inner pages from one shared layout, keeps the header,
// footer and mobile contact bar in index.html in sync, and rebuilds sitemap.xml.
//
//   npm run build:pages
//
// Output is committed (Vercel serves the files as-is; there is no deploy-time
// build). Edit page content in the PAGES list below, then re-run the script.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.the3dprint.live';
const PHONE = '+19142223475';
const PHONE_DISPLAY = '(914) 222-3475';
const EMAIL = 'sean@the3dprint.live';
const LASTMOD = new Date().toISOString().slice(0, 10);

const AREA_SERVED = [
  { '@type': 'AdministrativeArea', name: 'Westchester County, NY' },
  { '@type': 'AdministrativeArea', name: 'Hudson Valley, NY' },
  { '@type': 'City', name: 'New York, NY' },
  { '@type': 'Country', name: 'United States' },
];
const PROVIDER = { '@type': 'LocalBusiness', name: '3D Print Live', url: `${SITE}/`, telephone: '+1-914-222-3475' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const quoteLink = (type) => `/?type=${encodeURIComponent(type)}#quote`;

// ---------------------------------------------------------------------------
// Testimonials (real customer quotes; keep wording as provided)
// ---------------------------------------------------------------------------
const TESTIMONIALS = {
  fire: {
    quote: "I showcased 3D Print Live's impressive work on the design and setup of our drain strainer at our Board of Fire Commissioners meeting. Their attention to detail truly stands out, and we ordered 15 more.",
    who: 'Local Fire District', service: 'Custom Part Design &amp; Production',
  },
  artist: {
    quote: "I'm an oil painter by trade, not a 3D modeler, and 3D Print Live walked me through the whole process. The piece looks great. Thanks again for a job well done!",
    who: 'Fine Artist', service: 'Sculpture Modeling &amp; Large-Format Print',
  },
  construction: {
    quote: "Thanks again for the great work! 3D Print Live printed our handrail profiles overnight when we needed them fast, and we've kept coming back.",
    who: 'Construction Project Manager', service: 'Rush Architectural Prototypes',
  },
  vehicle: {
    quote: "It was great. I'm glad we were able to get it done, and 3D Print Live is my first call for future projects.",
    who: 'Specialty Vehicle Company', service: '3D Scanning',
  },
};

const testimonial = (t) => `<blockquote class="quote-card">
            <p>&ldquo;${t.quote.replace(/'/g, '&rsquo;')}&rdquo;</p>
            <footer><strong>${t.who}</strong><span>${t.service}</span></footer>
          </blockquote>`;

const checks = (items) => `<ul class="checks">\n${items.map((i) => `            <li>${i}</li>`).join('\n')}\n          </ul>`;

// ---------------------------------------------------------------------------
// Shared chrome
// ---------------------------------------------------------------------------
const SERVICES = [
  { slug: 'replacement-parts', label: 'Replacement Parts' },
  { slug: 'prototyping', label: 'Prototyping' },
  { slug: 'architectural-models', label: 'Architectural Models' },
  { slug: 'custom-gifts-events', label: 'Custom Gifts &amp; Events' },
  { slug: '3d-scanning', label: '3D Scanning' },
];

const HEADER = `<header class="header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="3D Print Live home">
        <img src="/images/brand/logo-mark.svg" alt="3D Print Live" width="40" height="45" />
      </a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span>
      </button>
      <nav id="site-nav" class="nav">
        <a href="/#services">Services</a>
        <a href="/#work">Our Work</a>
        <a href="/#process">How It Works</a>
        <a href="/#about">About</a>
        <a href="/#faq">FAQ</a>
        <a href="/#quote" class="btn btn-primary btn-sm">Get a Quote</a>
      </nav>
    </div>
  </header>`;

const FOOTER = `<footer class="footer">
    <div class="container footer-grid">
      <div>
        <a class="footer-logo" href="/"><img src="/images/brand/logo-stacked-dark.svg" alt="3D Print Live" width="335" height="262" loading="lazy" /></a>
        <p class="footer-area">Serving Westchester, the Hudson Valley &amp; NYC · Shipping nationwide</p>
      </div>
      <nav aria-label="Services">
        <h2 class="footer-title">Services</h2>
        <ul class="footer-links">
${SERVICES.map((s) => `          <li><a href="/services/${s.slug}">${s.label}</a></li>`).join('\n')}
        </ul>
      </nav>
      <nav aria-label="Company">
        <h2 class="footer-title">Company</h2>
        <ul class="footer-links">
          <li><a href="/#work">Our Work</a></li>
          <li><a href="/projects/large-format-sculpture">Sculpture Case Study</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#faq">FAQ</a></li>
        </ul>
      </nav>
      <div>
        <h2 class="footer-title">Contact</h2>
        <ul class="footer-links">
          <li><a href="tel:${PHONE}">${PHONE_DISPLAY}</a></li>
          <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          <li><a href="/#quote">Get a Quote</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© <span id="year"></span> 3D Print Live. All rights reserved.</p>
    </div>
  </footer>

  <nav class="action-bar" aria-label="Quick contact">
    <a href="tel:${PHONE}">Call</a>
    <a href="sms:${PHONE}">Text</a>
    <a class="primary" href="/#quote">Get a Quote</a>
  </nav>`;

function layout(page) {
  const url = `${SITE}${page.path}`;
  const ogImage = `${SITE}${page.ogImage || '/images/brand/social-avatar.jpg'}`;
  const jsonLd = page.jsonLd ? `\n  <script type="application/ld+json">\n${JSON.stringify(page.jsonLd, null, 2)}\n  </script>` : '';
  return `<!doctype html>
<!-- Generated by scripts/build-pages.mjs. Edit content there, then run: npm run build:pages -->
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
${page.noindex ? '  <meta name="robots" content="noindex" />\n' : ''}  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImage}" />
  <meta name="theme-color" content="#111418" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="preload" href="/fonts/nunito-latin-wght.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/styles.css" />${jsonLd}
  <!-- Vercel Web Analytics (cookieless page views) -->
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  <!-- build:header -->
  ${HEADER}
  <!-- /build:header -->

  <main id="main">
${page.body}
  </main>

  <!-- build:footer -->
  ${FOOTER}
  <!-- /build:footer -->

  <script src="/script.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Page building blocks
// ---------------------------------------------------------------------------
function breadcrumb(items) {
  const html = items.map((i) => (i.href ? `<a href="${i.href}">${i.label}</a>` : `<span aria-current="page">${i.label}</span>`)).join(' / ');
  const ld = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.label.replace(/&amp;/g, '&'), ...(i.href ? { item: `${SITE}${i.href}` } : {}) })),
  };
  return { html: `<nav class="breadcrumb" aria-label="Breadcrumb">${html}</nav>`, ld };
}

const WHY = `<div class="aside-card">
            <h3>Why 3D Print Live</h3>
            ${checks(['Typical 48-hour turnaround', 'Large orders welcome', 'Quick communication, easy to work with', 'All common FDM materials, custom requirements welcome', 'Westchester, Hudson Valley &amp; NYC, shipping nationwide'])}
          </div>`;

function servicePage(p) {
  const path = `/services/${p.slug}`;
  const crumbs = breadcrumb([{ label: 'Home', href: '/' }, { label: 'Services', href: '/#services' }, { label: p.name }]);
  const media = p.heroImage
    ? `\n        <figure><img src="${p.heroImage.src}" alt="${esc(p.heroImage.alt)}" width="${p.heroImage.w}" height="${p.heroImage.h}" fetchpriority="high" /></figure>`
    : '';
  const others = SERVICES.filter((s) => s.slug !== p.slug);
  const body = `    <section class="page-hero">
      <div class="container page-hero-grid${media ? '' : ' no-media'}">
        <div>
          ${crumbs.html}
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p class="lead">${p.lead}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="${quoteLink(p.quoteType)}">Get a Free Quote</a>
            <a class="btn btn-outline" href="tel:${PHONE}">Call ${PHONE_DISPLAY}</a>
          </div>
        </div>${media}
      </div>
    </section>

    <section class="section">
      <div class="container content-grid">
        <div class="prose">
${p.sections}
        </div>
        <aside class="aside-stack">
          ${p.testimonial ? testimonial(p.testimonial) : ''}
          ${WHY}
        </aside>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container narrow">
        <header class="section-head">
          <p class="eyebrow">FAQ</p>
          <h2>${p.faqTitle}</h2>
        </header>
${p.faq.map(([q, a]) => `        <details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
      </div>
    </section>

    <section class="cta-band">
      <div class="container">
        <h2>${p.ctaTitle}</h2>
        <p>Send photos, files, or just a description. We usually reply within one business day, often sooner.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${quoteLink(p.quoteType)}">Get a Free Quote</a>
          <a class="btn btn-outline-light" href="sms:${PHONE}">Text us</a>
        </div>
        <div class="related" aria-label="Other services">
${others.map((s) => `          <a href="/services/${s.slug}">${s.label}</a>`).join('\n')}
        </div>
      </div>
    </section>`;
  return {
    path,
    file: `services/${p.slug}.html`,
    title: p.title,
    description: p.description,
    ogImage: p.heroImage && p.heroImage.src,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Service', name: p.name.replace(/&amp;/g, '&'), serviceType: p.serviceType, description: p.description, url: `${SITE}${path}`, provider: PROVIDER, areaServed: AREA_SERVED },
        crumbs.ld,
      ],
    },
    body,
  };
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const PAGES = [
  servicePage({
    slug: 'replacement-parts',
    name: 'Replacement Parts',
    serviceType: '3D printed replacement parts',
    quoteType: 'Replacement part',
    title: '3D Printed Replacement Parts | Westchester, Hudson Valley & NYC | 3D Print Live',
    description: 'Broken or discontinued part? 3D Print Live measures, models, and 3D prints replacement parts for homes, businesses, and municipalities in Westchester, the Hudson Valley, and NYC. 48-hour typical turnaround.',
    eyebrow: 'Replacement parts',
    h1: '3D printed replacement parts, made to fit',
    lead: 'Broken clip, discontinued knob, cracked bracket? We measure, model, and 3D print the part you need, in a material suited to the job. One piece or a full batch, for customers across Westchester, the Hudson Valley, and NYC.',
    heroImage: { src: '/images/wall-bracket.jpg', alt: '3D printed light blue wall-mount bracket with screw holes', w: 1000, h: 1333 },
    sections: `          <h2>Parts we make</h2>
          ${checks(['Knobs, handles, and dials', 'Clips, latches, brackets, and mounts', 'Appliance, equipment, and furniture parts', 'Caps, covers, and end plugs', 'Custom-fit adapters and spacers', 'Fixtures and parts for commercial and municipal equipment'])}
          <h2>How it works</h2>
          <ol>
            <li><strong>Send us what you have:</strong> the broken part, photos with a ruler for scale, measurements, or an existing 3D file.</li>
            <li><strong>We model it:</strong> we recreate the part in CAD, or <a href="/services/3d-scanning">3D scan</a> it when the shape is complex.</li>
            <li><strong>Test fit:</strong> we print it and check the fit, adjusting if needed.</li>
            <li><strong>Get your part:</strong> pick it up locally or have it shipped, one piece or as many as you need.</li>
          </ol>
          <h2>Built for the job</h2>
          <p>We choose the material for how the part is used: PETG or ASA for outdoor and UV exposure, ABS, nylon, or polycarbonate for heat and strength, TPU for flexible parts. Not sure? Tell us what the part does and we'll recommend the right one.</p>`,
    testimonial: TESTIMONIALS.fire,
    faqTitle: 'Replacement part questions',
    faq: [
      ['Do I need a 3D file?', 'No. Most replacement parts start with the original piece, photos, or measurements. We handle the modeling.'],
      ['Can you copy a part that is no longer made?', 'Usually, yes. That is one of the most common requests we get. Send photos and dimensions of the original (even if broken) and we will tell you what is possible.'],
      ['Can you make multiples?', 'Yes. Once the part is modeled and fit-checked, we can print as many as you need. Large orders are welcome.'],
      ['How long does it take?', 'Our typical turnaround is 48 hours. Parts that need more modeling or testing may take a little longer, and we will give you a timeline with your quote.'],
    ],
    ctaTitle: 'Need a part made?',
  }),

  servicePage({
    slug: 'prototyping',
    name: 'Prototyping',
    serviceType: 'Rapid prototyping and 3D printing',
    quoteType: 'Prototype',
    title: 'Rapid Prototyping & 3D Printing | Westchester, Hudson Valley & NYC | 3D Print Live',
    description: 'Rapid prototyping and product development in Westchester, the Hudson Valley, and NYC. CAD design, functional prototypes, enclosures, and pilot runs with a typical 48-hour turnaround.',
    eyebrow: 'Prototyping',
    h1: 'Rapid prototyping and product development',
    lead: 'Go from idea to a part in your hands fast. We help inventors, startups, and engineers design, print, and refine prototypes, with a typical 48-hour turnaround so you can keep iterating.',
    heroImage: { src: '/images/workshop.jpg', alt: 'The 3D Print Live print farm: three Bambu Lab H2D printers with multi-material units', w: 1600, h: 1000 },
    sections: `          <h2>What we prototype</h2>
          ${checks(['Form and fit models to check size and ergonomics', 'Functional prototypes for real-world testing', 'Enclosures and housings for electronics', 'Jigs, fixtures, and tooling aids', 'Pre-production pilot runs', 'Multi-color and multi-material parts'])}
          <h2>How it works</h2>
          <ol>
            <li><strong>Share your idea:</strong> CAD files, a sketch, photos, or a description.</li>
            <li><strong>Design support:</strong> no model yet? We create or repair it in CAD and make it printable.</li>
            <li><strong>Print and test:</strong> your prototype, typically within 48 hours.</li>
            <li><strong>Iterate:</strong> send feedback and we revise quickly until it is right.</li>
            <li><strong>Scale up:</strong> move to a batch or production run when you are ready. Large orders are welcome.</li>
          </ol>
          <h2>Run in parallel</h2>
          <p>Our in-house print farm of Bambu Lab H2D printers with automatic multi-material systems lets us print several versions or parts at once, so testing design options does not slow you down.</p>`,
    testimonial: null,
    faqTitle: 'Prototyping questions',
    faq: [
      ['What file types do you accept?', 'STL, 3MF, STEP, and OBJ are ideal. We can also work from sketches, photos, or measurements.'],
      ['Can you help design the part?', 'Yes. We offer CAD design and file repair, from quick fixes to modeling a part from scratch.'],
      ['Which material should I use for a prototype?', 'PLA is great for form and fit checks. For functional testing, PETG, ABS, ASA, nylon, polycarbonate, or fiber-reinforced blends may be a better fit. We will recommend one based on how you plan to test it.'],
      ['Do you sign NDAs?', 'Ask us in your quote request and we can discuss confidentiality for your project.'],
    ],
    ctaTitle: 'Ready to prototype?',
  }),

  servicePage({
    slug: 'architectural-models',
    name: 'Architectural Models',
    serviceType: 'Architectural model 3D printing',
    quoteType: 'Architectural model',
    title: 'Architectural Models & 3D Printed Building Prototypes | NYC, Westchester & Hudson Valley | 3D Print Live',
    description: '3D printed architectural models, detail mockups, and custom profiles for architects, contractors, and developers in NYC, Westchester, and the Hudson Valley. Rush turnaround available.',
    eyebrow: 'Architectural models',
    h1: 'Architectural models and building prototypes',
    lead: 'Scale models, detail mockups, and custom profiles for architects, contractors, and developers. When a deadline is tight, we can move fast, including overnight prints when a job calls for it.',
    heroImage: null,
    sections: `          <h2>What we make</h2>
          ${checks(['Scale massing and presentation models', 'Site and terrain models', 'Facade, detail, and connection mockups', 'Custom profiles for approval: handrails, trim, and moldings', 'Fixtures and fit-check parts for the job site', 'Client presentation pieces'])}
          <h2>How it works</h2>
          <ol>
            <li><strong>Send your drawings or models:</strong> CAD, BIM exports, STL, or even PDFs and sketches.</li>
            <li><strong>We prepare the print:</strong> scaling, splitting large models, and choosing the right material and finish.</li>
            <li><strong>Print and deliver:</strong> typical turnaround is 48 hours; rush jobs are possible when you need them sooner.</li>
          </ol>
          <h2>Fast when it matters</h2>
          <p>Project schedules do not wait. Our in-house print farm lets us run several parts at once, which is how we have turned around handrail profiles overnight for a construction team on a deadline.</p>`,
    testimonial: TESTIMONIALS.construction,
    faqTitle: 'Architectural model questions',
    faq: [
      ['What files can you work from?', 'STL, 3MF, STEP, and OBJ are best, and we can often work from exports of your CAD or BIM model. Send what you have and we will let you know.'],
      ['Can you print large models?', 'Yes. Large models can be split into sections, printed, and assembled.'],
      ['Can you do rush jobs?', 'Often, yes. Tell us your deadline in the quote request and we will do our best to meet it.'],
      ['Do you work with contractors on site parts too?', 'Yes. Custom profiles, templates, and fit-check parts for the job site are a great fit for 3D printing.'],
    ],
    ctaTitle: 'Have a model or mockup to print?',
  }),

  servicePage({
    slug: 'custom-gifts-events',
    name: 'Custom Gifts &amp; Events',
    serviceType: 'Custom 3D printed gifts and event decor',
    quoteType: 'Gift / event piece',
    title: 'Custom 3D Printed Gifts & Event Pieces | Westchester, Hudson Valley & NYC | 3D Print Live',
    description: 'Personalized 3D printed wedding card boxes, Sweet 16 decor, keepsakes, and branded pieces with names, dates, and monograms. Serving Westchester, the Hudson Valley, and NYC.',
    eyebrow: 'Custom gifts &amp; events',
    h1: 'Custom 3D printed gifts and event pieces',
    lead: 'Personalized pieces for weddings, birthdays, and celebrations, with names, dates, monograms, and colors to match your event. Made one at a time or in quantity.',
    heroImage: { src: '/images/wedding-card-box.jpg', alt: 'White 3D printed wedding card box with a black monogram and names on the front', w: 1400, h: 1050 },
    sections: `          <h2>Ideas we love making</h2>
          ${checks(['Wedding card boxes and guest book alternatives', 'Sweet 16, birthday, and anniversary decor', 'Cake toppers, centerpieces, and table numbers', 'Name signs, monograms, and keepsakes', 'Party favors in quantity', 'Branded pieces for businesses, teams, and events'])}
          <div class="photo-pair">
            <img src="/images/sweet-16-box.jpg" alt="White 3D printed Sweet 16 box with raised gold script lettering" width="1000" height="1333" loading="lazy" />
            <img src="/images/wedding-card-box.jpg" alt="3D printed wedding card box with monogram" width="1400" height="1050" loading="lazy" />
          </div>
          <h2>How it works</h2>
          <ol>
            <li><strong>Tell us about the event:</strong> the date, names or text, colors, and any inspiration photos.</li>
            <li><strong>We design it:</strong> and share the design with you before printing.</li>
            <li><strong>Print and finish:</strong> multi-color printing lets names and designs stand out.</li>
            <li><strong>Pick up or ship:</strong> local pickup or shipping anywhere in the US.</li>
          </ol>`,
    testimonial: null,
    faqTitle: 'Gift and event questions',
    faq: [
      ['How far ahead should I order?', 'Reach out as early as you can, especially for dated events. Many pieces can be ready within days once the design is approved.'],
      ['Can you match my event colors?', 'Yes. We print in a wide range of filament colors, including silk and matte finishes, and can combine several colors in one piece.'],
      ['Can you make multiples, like favors?', 'Yes. Large orders are welcome.'],
      ['Can I send my own design?', 'Absolutely. Send a file, sketch, or inspiration photo and we will take it from there.'],
    ],
    ctaTitle: 'Planning an event?',
  }),

  servicePage({
    slug: '3d-scanning',
    name: '3D Scanning',
    serviceType: '3D scanning and reverse engineering',
    quoteType: '3D scanning',
    title: '3D Scanning & Reverse Engineering | Westchester, Hudson Valley & NYC | 3D Print Live',
    description: '3D scanning services in Westchester, the Hudson Valley, and NYC. Capture existing parts and objects as 3D models for reverse engineering, replacement parts, and custom fits.',
    eyebrow: '3D scanning',
    h1: '3D scanning and reverse engineering',
    lead: 'Capture an existing part or object as an accurate 3D model, then modify it, reproduce it, or design something that fits it perfectly.',
    heroImage: null,
    sections: `          <h2>What 3D scanning is for</h2>
          ${checks(['Reverse engineering parts with complex shapes', 'Reproducing parts that are no longer available', 'Designing custom-fit accessories, mounts, and adapters', 'Capturing objects for modification or archiving', 'Scan-to-print: go straight from scan to a printed part'])}
          <h2>How it works</h2>
          <ol>
            <li><strong>Tell us about the object:</strong> what it is, its approximate size, and what you want to do with the scan.</li>
            <li><strong>We scan it:</strong> and clean up the data into a usable 3D model.</li>
            <li><strong>Use it:</strong> take the model for your own work, or have us modify and 3D print it for you.</li>
          </ol>
          <p>Scanning pairs naturally with our <a href="/services/replacement-parts">replacement parts</a> and <a href="/services/prototyping">prototyping</a> services.</p>`,
    testimonial: TESTIMONIALS.vehicle,
    faqTitle: '3D scanning questions',
    faq: [
      ['What size objects can you scan?', 'Tell us the approximate size and shape of the object in your quote request and we will confirm the best approach.'],
      ['What do I get?', 'A digital 3D model of your object. We can also modify it or print it for you.'],
      ['Do I need to bring the object to you?', 'Local pickup and drop-off can be arranged in Westchester, the Hudson Valley, and NYC. Get in touch and we will work out the details.'],
    ],
    ctaTitle: 'Have something to scan?',
  }),
];

// Case study
{
  const path = '/projects/large-format-sculpture';
  const crumbs = breadcrumb([{ label: 'Home', href: '/' }, { label: 'Our Work', href: '/#work' }, { label: 'Large-Format Sculpture' }]);
  PAGES.push({
    path,
    file: 'projects/large-format-sculpture.html',
    title: 'Case Study: Large-Format 3D Printed Sculpture for a Fine Artist | 3D Print Live',
    description: 'How 3D Print Live helped an oil painter with no 3D modeling experience turn a sculpture idea into a large-format 3D printed statue.',
    ogImage: '/images/statue.jpg',
    jsonLd: { '@context': 'https://schema.org', '@graph': [crumbs.ld] },
    body: `    <section class="page-hero">
      <div class="container page-hero-grid">
        <div>
          ${crumbs.html}
          <p class="eyebrow">Case study</p>
          <h1>A large-format sculpture for a fine artist</h1>
          <p class="lead">An oil painter by trade, not a 3D modeler, came to us with a sculpture idea. We guided them through the whole process and printed it at large scale.</p>
        </div>
        <figure><img src="/images/statue.jpg" alt="Large 3D printed white figure sculpture being assembled in the workshop" width="1000" height="1333" fetchpriority="high" /></figure>
      </div>
    </section>

    <section class="section">
      <div class="container content-grid">
        <div class="prose">
          <h2>The client</h2>
          <p>A fine artist who works in oil paint wanted to bring a figure into three dimensions. They had the artistic vision but no experience with 3D modeling or printing.</p>
          <h2>The challenge</h2>
          <p>Turning an artist's vision into a printable digital sculpture, and producing it at a size larger than a single print.</p>
          <h2>What we did</h2>
          ${checks(['Walked the artist through each step of the process, from model to finished piece', 'Prepared the digital sculpture for printing', 'Printed the figure in sections at large scale', 'Assembled the sections into a single statue'])}
          <h2>The result</h2>
          <p>A large-format statue the artist was happy with, and a process they could follow without needing to learn 3D modeling themselves.</p>
        </div>
        <aside class="aside-stack">
          ${testimonial(TESTIMONIALS.artist)}
          <div class="aside-card">
            <h3>Have an art project?</h3>
            <p>Sculpture, props, cosplay, or display pieces: tell us what you have in mind.</p>
            <a class="btn btn-primary btn-block" href="${quoteLink('Custom one-off')}">Get a Free Quote</a>
          </div>
        </aside>
      </div>
    </section>

    <section class="cta-band">
      <div class="container">
        <h2>Let's build your idea</h2>
        <p>Send photos, files, or just a description. We usually reply within one business day.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${quoteLink('Custom one-off')}">Get a Free Quote</a>
          <a class="btn btn-outline-light" href="/#work">See more work</a>
        </div>
      </div>
    </section>`,
  });
}

// Thank-you page (conversion page: counted in Web Analytics, not indexed)
PAGES.push({
  path: '/thank-you',
  file: 'thank-you.html',
  noindex: true,
  sitemap: false,
  title: 'Thanks for your request | 3D Print Live',
  description: 'Your quote request was sent to 3D Print Live.',
  body: `    <section class="page-hero">
      <div class="container page-hero-grid no-media">
        <div>
          <p class="eyebrow">Request received</p>
          <h1>Thanks! Your quote request is in.</h1>
          <p class="lead">We'll review your project and get back to you with options and pricing, usually within one business day (often sooner). A confirmation email is on its way to you.</p>
          ${checks(['Have more files? Email them to <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>', 'In a hurry? Call or text <a href="tel:' + PHONE + '">' + PHONE_DISPLAY + '</a>'])}
          <div class="cta-row">
            <a class="btn btn-primary" href="/">Back to Home</a>
            <a class="btn btn-outline" href="/#work">See Our Work</a>
          </div>
        </div>
      </div>
    </section>`,
});

// ---------------------------------------------------------------------------
// Write pages, sync index.html chrome, sitemap
// ---------------------------------------------------------------------------
for (const page of PAGES) {
  const out = join(ROOT, page.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, layout(page));
}

function replaceBlock(html, name, content) {
  const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!re.test(html)) throw new Error(`index.html is missing the build:${name} markers`);
  return html.replace(re, `$1\n  ${content}\n  $2`);
}
const indexPath = join(ROOT, 'index.html');
let index = readFileSync(indexPath, 'utf8');
index = replaceBlock(index, 'header', HEADER);
index = replaceBlock(index, 'footer', FOOTER);
writeFileSync(indexPath, index);

const urls = [{ path: '/', priority: '1.0' }, ...PAGES.filter((p) => p.sitemap !== false).map((p) => ({ path: p.path, priority: p.path.startsWith('/services/') ? '0.8' : '0.6' }))];
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE}${u.path}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);

console.log(`Built ${PAGES.length} pages, synced index.html header/footer, wrote sitemap.xml (${urls.length} URLs).`);
