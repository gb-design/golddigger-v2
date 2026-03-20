# Gold Digger Astro Migration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Gold Digger protein bar website from Webflow export to Astro 5 + Tailwind CSS 3, deployed on Vercel, with critical audit fixes (SEO, price visibility, email capture, Schema.org).

**Architecture:** Static one-pager built with Astro components. Each page section is an isolated `.astro` component. Data (product info, FAQ, partners) is centralized in TypeScript files under `src/data/`. GSAP is used only for Hero entrance and Brand Story scroll animation; everything else uses CSS animations or vanilla JS. Newsletter endpoint is a Vercel serverless function via Astro hybrid output.

**Tech Stack:** Astro 5, Tailwind CSS 3, GSAP 3 + ScrollTrigger, TypeScript, Vercel

**Spec:** `docs/superpowers/specs/2026-03-20-gold-digger-astro-migration-design.md`

---

## File Structure

### New Files to Create

```
src/
├── layouts/
│   └── BaseLayout.astro              # HTML shell, meta, fonts, Schema.org JSON-LD
├── pages/
│   ├── index.astro                   # Homepage assembles all section components
│   ├── datenschutz.astro             # Privacy policy (content from old site)
│   ├── impressum.astro               # Imprint (content from old site)
│   ├── 404.astro                     # Custom 404 page
│   └── api/
│       └── newsletter.ts             # Newsletter serverless endpoint
├── components/
│   ├── Nav.astro                     # Sticky nav with desktop + mobile
│   ├── Hero.astro                    # Hero section with ticker, product photo, CTA
│   ├── BrandStory.astro              # Scroll-driven text animation + quote
│   ├── ProductDetails.astro          # Ingredients grid + nutrition counters
│   ├── ProductComparison.astro       # Gold Digger VS competitor
│   ├── GoldBanner.astro              # "Du bisst hier" dual marquee
│   ├── Availability.astro            # Map + partner logos
│   ├── Newsletter.astro              # Email capture form
│   ├── Gewinnspiel.astro             # Contest section with steps
│   ├── FAQ.astro                     # F.A.Crunchy accordion
│   ├── Footer.astro                  # Footer with contact + links
│   ├── Divider.astro                 # Decorative gold leaf divider
│   ├── Marquee.astro                 # Reusable CSS-only marquee
│   └── PriceTag.astro                # Price badge component
├── scripts/
│   ├── gsap-init.ts                  # GSAP + ScrollTrigger setup
│   ├── scroll-text.ts                # Brand Story word animation
│   ├── counter.ts                    # Nutrition counter (IntersectionObserver)
│   ├── accordion.ts                  # FAQ toggle with ARIA
│   └── nav.ts                        # Nav scroll state + mobile toggle
├── data/
│   ├── product.ts                    # Product info, price, nutrition, social
│   ├── faq.ts                        # FAQ items for rendering + Schema.org
│   └── partners.ts                   # Partner logos + links + dimensions
└── styles/
    └── global.css                    # Tailwind directives + custom properties

# Root config files
astro.config.mjs
tailwind.config.mjs
tsconfig.json
package.json

# Static assets
public/
├── images/                           # All images from references/website-old/images/
├── documents/                        # Lottie JSON
└── favicon.png
```

---

## Chunk 1: Project Scaffolding + Base Layout

### Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `tailwind.config.mjs`
- Create: `src/styles/global.css`

- [ ] **Step 1: Initialize Astro project**

```bash
cd "/Volumes/GBD_1TB/External/GBD/Kunden/Oliver Feicht/Gold Digger - Proteinriegel/Marketing/Website/homepage-v2"
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

Expected: Astro scaffolds files in current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @astrojs/tailwind tailwindcss@3 @astrojs/vercel
npm install gsap @lottiefiles/lottie-player
npm install -D @types/node
```

Expected: All packages installed, `node_modules/` created.

- [ ] **Step 3: Configure Astro**

Write `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  integrations: [tailwind()],
  site: 'https://golddigger.at',
})
```

- [ ] **Step 4: Configure Tailwind**

Write `tailwind.config.mjs`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1040px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          500: '#CDAF39',
          400: '#D4BC5A',
          600: '#B89A2E',
        },
        surface: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1e1e1e',
        },
        text: {
          primary: '#FAFAFA',
          faded: 'rgba(250, 250, 250, 0.5)',
          muted: 'rgba(250, 250, 250, 0.25)',
        },
      },
      fontFamily: {
        serif: ['"mendl-serif-dusk"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 20s) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--marquee-duration, 20s) linear infinite',
        float: 'floatY var(--float-speed, 4s) ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0%)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(var(--float-distance, -10px))' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Write global CSS**

Write `src/styles/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    scroll-padding-top: 120px;
    background-color: #0a0a0a;
    color: #FAFAFA;
    font-family: 'mendl-serif-dusk', Georgia, 'Times New Roman', serif;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background-color: #CDAF39;
    color: #0a0a0a;
  }

  /* Focus styles for accessibility */
  a:focus-visible,
  button:focus-visible,
  [tabindex]:focus-visible,
  input:focus-visible {
    outline: 2px solid #CDAF39;
    outline-offset: 2px;
  }
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Astro dev server starts on `localhost:4321` without errors.

- [ ] **Step 7: Commit**

```bash
git init
echo "node_modules/\ndist/\n.astro/\n.vercel/\n.env" > .gitignore
git add package.json package-lock.json astro.config.mjs tailwind.config.mjs tsconfig.json src/styles/global.css .gitignore
git commit -m "feat: initialize Astro 5 project with Tailwind 3 and Vercel adapter"
```

---

### Task 2: Copy Static Assets

**Files:**
- Create: `public/images/` (copy from `references/website-old/images/`)
- Create: `public/documents/` (copy from `references/website-old/documents/`)
- Create: `public/favicon.png`

- [ ] **Step 1: Copy images**

```bash
cp -r "references/website-old/images/"*.avif public/images/
cp -r "references/website-old/images/"*.png public/images/
cp -r "references/website-old/images/"*.svg public/images/
```

Do NOT copy: `cursor-hand.png`, `cursor-hand-link.png`, `cursor-hand_1.png`, `rich-text-image-placeholder.svg` (not needed).

- [ ] **Step 2: Copy documents**

```bash
cp -r "references/website-old/documents/"* public/documents/
```

- [ ] **Step 3: Verify favicon exists**

```bash
ls -la public/images/favicon.png
```

Expected: File exists.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "feat: add static assets (images, documents, favicon)"
```

---

### Task 3: Data Layer

**Files:**
- Create: `src/data/product.ts`
- Create: `src/data/faq.ts`
- Create: `src/data/partners.ts`

- [ ] **Step 1: Write product data**

Write `src/data/product.ts`:

```ts
export const product = {
  name: 'Gold Digger Proteinriegel',
  tagline: 'Der Proteinriegel, der motiviert',
  description:
    'Gold Digger Proteinriegel: 31% Protein, 1,9g Zucker, handgemacht. Jetzt bei Billa, SPAR und online ab EUR 2,99.',
  price: 2.99,
  currency: 'EUR',
  weight: '45g',
  sku: 'GD-CHOC-BANANA-45',
  brand: {
    name: 'Gold Digger',
    company: 'Feicht & Frank',
    url: 'https://golddigger.at',
  },
  shopUrl: 'https://www.lackys.at/produkt/gold-digger-proteinriegel-45g/',
  nutrition: {
    protein: { value: 31, unit: '%', label: 'High Protein' },
    calories: { value: 187, unit: '', label: 'Kcal pro Portion' },
    sugar: { value: 1.9, unit: 'g', label: 'Zucker' },
  },
  flavors: ['Schokolade', 'Banane'],
  allergens: ['Soja', 'Natrium-Caseinat', 'Molkenproteinkonzentrat'],
  allergenTraces: ['Gluten', 'Nuesse', 'Schwefeldioxid', 'Sesam', 'Erdnuesse'],
  social: {
    instagram: 'https://www.instagram.com/golddiggeraustria/',
    facebook: 'https://www.facebook.com/golddiggeraustria/',
  },
  contact: {
    email: 'kontakt@golddigger.at',
  },
}
```

- [ ] **Step 2: Write FAQ data**

Write `src/data/faq.ts`:

```ts
export const faqItems = [
  {
    question: 'Ist der Gold Digger vegetarisch / vegan?',
    answer:
      'Nein, der Riegel ist nicht vegan. Vegetarisch ist er \u2014 je nach Auspr\u00e4gung \u2014 nicht vollst\u00e4ndig, da der Riegel Milchbestandteile enth\u00e4lt.',
  },
  {
    question: 'Kann ich den Gold Digger als Mahlzeitenersatz verwenden?',
    answer:
      'Der Gold Digger ist ein Snack mit Power, aber kein vollwertiger Mahlzeitenersatz. F\u00fcr eine ausgewogene Ern\u00e4hrung geh\u00f6rt eine richtige Hauptmahlzeit dazu.',
  },
  {
    question: 'Wie viel Zucker enth\u00e4lt der Gold Digger?',
    answer:
      'Bei 45g sind 1,9g Zucker drinnen \u2014 angenehm wenig f\u00fcr viel Geschmack.',
  },
  {
    question: 'Wie viel Protein steckt drin?',
    answer:
      'Pro Riegel bekommst du 31% High Protein. Ideal als Pre- oder Post-Workout-Boost oder f\u00fcr zwischendurch.',
  },
  {
    question: 'Ist echte Banane drin?',
    answer:
      'Echte Banane in Form von knusprigen Bananenchips ist beinhaltet.',
  },
  {
    question: 'Enth\u00e4lt der Riegel Allergene?',
    answer:
      'Soja, Natrium-Caseinat, Molkenproteinkonzentrat. Kann Spuren von Gluten, N\u00fcssen, Schwefeldioxid, Sesam und Erdn\u00fcssen enthalten.',
  },
]
```

- [ ] **Step 3: Write partners data**

Write `src/data/partners.ts`:

```ts
export const partners = [
  { name: 'Lackner Handel', logo: 'lackner-logo.avif', url: 'https://lackner-handel.at/', width: 120, height: 40 },
  { name: "Lacky's", logo: 'lackys-logo.avif', url: 'https://www.lackys.at/', width: 120, height: 40 },
  { name: 'Billa', logo: 'billa-logo.avif', url: 'https://www.billa.at/', width: 120, height: 40 },
  { name: 'Well One', logo: 'well-one.avif', url: 'https://www.well-one.me/', width: 120, height: 40 },
  { name: 'Sparkasse', logo: 'sparkasse-logo.avif', url: 'https://www.sparkasse.at/herzogenburg/privatkunden', width: 120, height: 40 },
  { name: 'Spar', logo: 'spar-logo.avif', url: 'https://www.spar.at/', width: 120, height: 40 },
  { name: 'John Harris', logo: 'harris-logo.avif', url: 'https://www.johnharris.at/', width: 120, height: 40 },
  { name: 'ARBOE', logo: 'arboe-logo.avif', url: 'https://www.arboe.at/', width: 120, height: 40 },
]
```

- [ ] **Step 4: Commit**

```bash
git add src/data/
git commit -m "feat: add centralized data layer (product, FAQ, partners)"
```

---

### Task 4: BaseLayout with SEO + Schema.org

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write BaseLayout**

Write `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css'
import { product } from '../data/product'
import { faqItems } from '../data/faq'

interface Props {
  title: string
  description: string
  ogImage?: string
  includeFaqSchema?: boolean
  includeProductSchema?: boolean
}

const {
  title,
  description,
  ogImage = '/images/gd_riegelFoil.avif',
  includeFaqSchema = false,
  includeProductSchema = false,
} = Astro.props

const canonicalUrl = new URL(Astro.url.pathname, Astro.site)

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: product.brand.name,
  url: product.brand.url,
  logo: `${Astro.site}images/gd_logo_wide.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: product.contact.email,
  },
  sameAs: [product.social.instagram, product.social.facebook],
}

const productSchema = includeProductSchema
  ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: `${Astro.site}images/gd_riegelFoil.avif`,
      brand: { '@type': 'Brand', name: product.brand.name },
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: 'https://schema.org/InStock',
        url: product.shopUrl,
      },
    }
  : null

const faqSchema = includeFaqSchema
  ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }
  : null
---

<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="de_AT" />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/images/favicon.png" />
    <link rel="apple-touch-icon" href="/images/favicon.png" />

    <!-- Fonts -->
    <link rel="stylesheet" href="https://use.typekit.net/gaq1cqv.css" />

    <!-- Schema.org -->
    <script type="application/ld+json" set:html={JSON.stringify(organizationSchema)} />
    {productSchema && (
      <script type="application/ld+json" set:html={JSON.stringify(productSchema)} />
    )}
    {faqSchema && (
      <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
    )}
  </head>
  <body class="bg-surface-900 text-white font-serif">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create minimal index page to test**

Write `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
---

<BaseLayout
  title="Gold Digger \u2014 Der Proteinriegel der motiviert | EUR 2,99"
  description="Gold Digger Proteinriegel: 31% Protein, 1,9g Zucker, handgemacht. Jetzt bei Billa, SPAR und online ab EUR 2,99."
  includeProductSchema
  includeFaqSchema
>
  <main id="main">
    <p class="text-brand-500 text-center py-20 text-2xl">Gold Digger — Coming Soon</p>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `localhost:4321`. Expected: Dark page with gold "Gold Digger — Coming Soon" text, Mendl Serif Dusk font loaded, page source contains Schema.org JSON-LD.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ src/pages/index.astro
git commit -m "feat: add BaseLayout with SEO meta, Schema.org, and Typekit fonts"
```

---

## Chunk 2: Navigation + Reusable Components

### Task 5: Reusable Components (Divider, Marquee, PriceTag)

**Files:**
- Create: `src/components/Divider.astro`
- Create: `src/components/Marquee.astro`
- Create: `src/components/PriceTag.astro`

- [ ] **Step 1: Write Divider component**

Write `src/components/Divider.astro`:

```astro
<div class="max-w-5xl mx-auto px-4">
  <div class="flex items-center gap-4">
    <div class="flex-1 h-px bg-gradient-to-r from-transparent to-brand-500/30"></div>
    <div class="w-8 h-8 flex-shrink-0">
      <img src="/images/leaf-gold.svg" alt="" width="32" height="32" loading="lazy" />
    </div>
    <div class="flex-1 h-px bg-gradient-to-l from-transparent to-brand-500/30"></div>
  </div>
</div>
```

- [ ] **Step 2: Write Marquee component**

Write `src/components/Marquee.astro`:

```astro
---
interface Props {
  reverse?: boolean
  duration?: string
  class?: string
}

const { reverse = false, duration = '20s', class: className = '' } = Astro.props
---

<div
  class:list={['overflow-hidden', className]}
  style={`--marquee-duration: ${duration}`}
>
  <div class:list={[
    'flex w-max',
    reverse ? 'animate-marquee-reverse' : 'animate-marquee',
  ]}>
    <div class="flex shrink-0">
      <slot />
    </div>
    <div class="flex shrink-0" aria-hidden="true">
      <slot />
    </div>
  </div>
</div>
```

- [ ] **Step 3: Write PriceTag component**

Write `src/components/PriceTag.astro`:

```astro
---
import { product } from '../data/product'

interface Props {
  class?: string
}

const { class: className = '' } = Astro.props
---

<span class:list={[
  'inline-flex items-center gap-1 px-4 py-2 rounded-full',
  'bg-brand-500 text-surface-900 font-bold text-lg',
  className,
]}>
  EUR {product.price.toFixed(2).replace('.', ',')}
</span>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Divider.astro src/components/Marquee.astro src/components/PriceTag.astro
git commit -m "feat: add reusable components (Divider, Marquee, PriceTag)"
```

---

### Task 6: Navigation

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/scripts/nav.ts`

- [ ] **Step 1: Write Nav component**

Write `src/components/Nav.astro` — Desktop + Mobile nav with sticky behavior, transparent-to-solid transition, skip-to-content link, CTA button. Full implementation with:
- Skip-to-content link
- Logo (gd_logo_wide.png)
- Desktop nav links: Produktdetails (#home-details), Verfuegbarkeit (#home-availability), Gewinnspiel (#home-win), FAQ (#home-faq), Kontakt (mailto:kontakt@golddigger.at)
- CTA "Online bestellen" → Lacky's shop (target="_blank" rel="noopener")
- Mobile: hamburger toggle, fullscreen overlay with clip-path animation
- Sentinel div for IntersectionObserver scroll detection

Reference: Spec Section 3.2, old site lines 66-622.

- [ ] **Step 2: Write nav script**

Write `src/scripts/nav.ts`:

```ts
function initNav() {
  // Scroll state: transparent → solid
  const sentinel = document.getElementById('nav-sentinel')
  const header = document.querySelector('[data-nav]') as HTMLElement | null
  if (sentinel && header) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle('is-scrolled', !entry.isIntersecting)
      },
      { threshold: 0 }
    )
    observer.observe(sentinel)
  }

  // Mobile toggle
  const toggle = document.querySelector('[data-nav-toggle]') as HTMLButtonElement | null
  const menu = document.querySelector('[data-nav-menu]') as HTMLElement | null
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open')
      toggle.setAttribute('aria-expanded', String(isOpen))
      document.body.classList.toggle('overflow-hidden', isOpen)
    })

    // Close on anchor click
    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open')
        toggle.setAttribute('aria-expanded', 'false')
        document.body.classList.remove('overflow-hidden')
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', initNav)
```

- [ ] **Step 3: Add Nav to index page**

Update `src/pages/index.astro` to import and render `<Nav />` above `<main>`.

- [ ] **Step 4: Verify in browser**

Open `localhost:4321`. Expected: Sticky nav visible, transparent at top, becomes solid when scrolling. Mobile hamburger works. CTA links to Lacky's.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro src/scripts/nav.ts src/pages/index.astro
git commit -m "feat: add sticky navigation with mobile menu and scroll detection"
```

---

## Chunk 3: Hero + Brand Story (GSAP Sections)

### Task 7: Hero Section

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/scripts/gsap-init.ts`

- [ ] **Step 1: Write GSAP init script**

Write `src/scripts/gsap-init.ts`:

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
```

- [ ] **Step 2: Write Hero component**

Write `src/components/Hero.astro` with:
- "NEU im Handel" ticker using `<Marquee>` component with diamond SVG separators (#CDAF39)
- Product photo (gd_riegelFoil.avif) with responsive srcset and `sizes="(max-width: 1040px) 100vw, 80vw"`, `loading="eager"`, `fetchpriority="high"`
- H1: "Der Proteinriegel, der motiviert"
- Sub-headline: "Wer das Gold hat, macht die Regeln."
- `<PriceTag />` centered below headline
- Feature badges row: 31% High Protein | 187 kcal | 1,9g Zucker
- CTA button: "Jetzt bestellen — EUR 2,99" → product.shopUrl
- Floating deco elements (bananaChips-hero, choc-hero, nugget-hero) with CSS float animation
- GSAP entrance animation: fade-in + staggered slide-up via inline `<script>`

Reference: Spec Section 3.3, old site lines 2071-2664.

- [ ] **Step 3: Add Hero to index page**

Update `src/pages/index.astro` to import and render `<Hero />` as first section inside `<main>`.

- [ ] **Step 4: Verify in browser**

Expected: Hero section with ticker, product image, headline, price, features, CTA. GSAP entrance animation plays on load. Floating elements animate via CSS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/scripts/gsap-init.ts src/pages/index.astro
git commit -m "feat: add Hero section with ticker, price, features, and GSAP entrance"
```

---

### Task 8: Brand Story Section

**Files:**
- Create: `src/components/BrandStory.astro`
- Create: `src/scripts/scroll-text.ts`

- [ ] **Step 1: Write splitWords utility**

This is the SplitText fallback (no GSAP Club license needed).

Write `src/scripts/scroll-text.ts`:

```ts
import { gsap, ScrollTrigger } from './gsap-init'

function splitWords(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || ''
  element.innerHTML = ''
  const words: HTMLSpanElement[] = []

  // Split by whitespace, preserve line breaks
  const parts = text.split(/(\s+)/)
  parts.forEach((part) => {
    if (/^\s+$/.test(part)) {
      // Whitespace — add as text node
      element.appendChild(document.createTextNode(part))
    } else if (part) {
      const span = document.createElement('span')
      span.className = 'word'
      span.textContent = part
      span.style.setProperty('--progress', '0%')
      element.appendChild(span)
      words.push(span)
    }
  })

  return words
}

export function initScrollText() {
  document.querySelectorAll<HTMLElement>('.story-scroll-text').forEach((el) => {
    if (el.dataset.initialized) return
    el.dataset.initialized = 'true'

    const words = splitWords(el)

    // Highlight "Gold Digger"
    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i].textContent?.trim().toLowerCase()
      const next = words[i + 1].textContent?.trim().toLowerCase()
      if (current === 'gold' && next?.startsWith('digger')) {
        words[i].classList.add('gd-highlight')
        words[i + 1].classList.add('gd-highlight')
      }
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top center)',
        end: 'clamp(bottom center)',
        scrub: 1,
      },
    })

    tl.fromTo(
      words,
      { '--progress': '0%' },
      { '--progress': '100%', stagger: 0.5, ease: 'none' }
    )
  })
}

document.addEventListener('DOMContentLoaded', initScrollText)
```

- [ ] **Step 2: Write BrandStory component**

Write `src/components/BrandStory.astro` with:
- Scroll text: "Aus einer innovativen Idee entstand ein trendiger Proteinriegel, der Funktionalitaet neu interpretiert – der Gold Digger. Hoher Proteingehalt, intelligente Ballaststoffe, klar definiert. Ohne Ueberfluss. Ohne Schnickschnack. Denn wer das Gold hat, macht die Regeln!"
- CSS for `.word` and `.gd-highlight` classes (transparent → white/gold gradient via --progress)
- Quote block with Feicht & Frank badge (FF-Bust_online.avif)
- Quote text + "- Oliver Feicht -" attribution
- Imports scroll-text.ts via `<script>`

Reference: Spec Section 3.4, old site lines 2665-2852.

- [ ] **Step 3: Add BrandStory to index page**

Update `src/pages/index.astro`: render `<Divider />` then `<BrandStory />` after Hero.

- [ ] **Step 4: Verify in browser**

Expected: Scroll through the story section — words progressively light up from transparent to white. "Gold Digger" words appear in gold (#CDAF39). Quote visible below.

- [ ] **Step 5: Commit**

```bash
git add src/components/BrandStory.astro src/scripts/scroll-text.ts src/pages/index.astro
git commit -m "feat: add Brand Story with scroll-driven text animation and quote"
```

---

## Chunk 4: Product Sections

### Task 9: Product Details

**Files:**
- Create: `src/components/ProductDetails.astro`
- Create: `src/scripts/counter.ts`

- [ ] **Step 1: Write counter script**

Write `src/scripts/counter.ts`:

```ts
function initCounters() {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]')

  const startCount = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count || '0')
    let current = 0
    const duration = 3000
    const steps = 60
    const increment = target / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      el.textContent =
        target % 1 === 0 ? String(Math.floor(current)) : current.toFixed(1)
    }, duration / steps)
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCount(entry.target as HTMLElement)
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 }
  )

  counters.forEach((counter) => observer.observe(counter))
}

document.addEventListener('DOMContentLoaded', initCounters)
```

- [ ] **Step 2: Write ProductDetails component**

Write `src/components/ProductDetails.astro` with:
- Section anchor `id="home-details"`
- Two-column header: H2 "Originale Zutaten. Einfach handgemacht." + body text
- Nutrition counter row: 31% | 187 | 1,9 with `data-count` attributes
- Ingredients grid: Kakaomantel (choc-ing.avif), Crispy Balls (balls-ing.avif), Soft Protein Kern (banana-ing.avif)
- Center: Querschnitt image (RiegelQuerschnitt_detail.avif) with "45g pro Portion" badge
- Float animation on ingredient images via CSS

Reference: Spec Section 3.6, old site lines 2862-3090.

- [ ] **Step 3: Add to index page**

Add `<Divider />` + `<ProductDetails />` after BrandStory.

- [ ] **Step 4: Verify counters animate on scroll**

Expected: Numbers count up from 0 when scrolled into view. Fires once.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductDetails.astro src/scripts/counter.ts src/pages/index.astro
git commit -m "feat: add ProductDetails with ingredients grid and animated counters"
```

---

### Task 10: Product Comparison

**Files:**
- Create: `src/components/ProductComparison.astro`

- [ ] **Step 1: Write ProductComparison component**

Write `src/components/ProductComparison.astro` with:
- H3: "Ein Stueck Motivation gegen Hunger"
- Sub: "Besserer Snack. Bessere Zutaten. Besseres Gefuehl."
- Side-by-side: Gold Digger 45g (gd_Riegel_topView-1.avif) VS Herkoemmlicher Riegel 30g (RiegelMitbewerb-1.avif)
- Stats: 31% vs 17%, Handgemacht vs Massenprodukt, 100% Motivation vs Max. Langeweile
- Diamond SVG divider line between stats

Reference: Spec Section 3.7, old site lines 3094-3290.

- [ ] **Step 2: Add to index page**

Render `<ProductComparison />` after ProductDetails.

- [ ] **Step 3: Verify layout**

Expected: Two products side by side with "VS." between them. Responsive: stacks on mobile.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProductComparison.astro src/pages/index.astro
git commit -m "feat: add product comparison section (Gold Digger vs competitor)"
```

---

### Task 11: Gold Banner

**Files:**
- Create: `src/components/GoldBanner.astro`

- [ ] **Step 1: Write GoldBanner component**

Write `src/components/GoldBanner.astro` with:
- H2: "Du bisst hier ..."
- Two CSS-only marquee tracks using `<Marquee>`:
  - Track 1 (reverse): "GOLD" repeated, scrolls left
  - Track 2: "richtig!" repeated, scrolls right
- Riegel explosion image (riegel-explosion_transparent-1.avif) overlaid in the center

Reference: Spec Section 3.8, old site lines 3291-3444.

- [ ] **Step 2: Add to index page**

Render `<GoldBanner />` after ProductComparison.

- [ ] **Step 3: Commit**

```bash
git add src/components/GoldBanner.astro src/pages/index.astro
git commit -m "feat: add Gold Banner with dual CSS marquee"
```

---

## Chunk 5: Availability, Newsletter, Gewinnspiel

### Task 12: Availability

**Files:**
- Create: `src/components/Availability.astro`

- [ ] **Step 1: Write Availability component**

Write `src/components/Availability.astro` with:
- Section anchor `id="home-availability"`
- H2: "Jetzt zugreifen, solange das Gold heiss ist"
- Text with availability date (ab 10.12.25) and online link
- PriceTag component
- Google Maps iframe (`loading="lazy"`, src from old site: `https://www.google.com/maps/d/embed?mid=1P8H1DhgYwWx7EFCR8wg481RJGkNbHLA&ehbc=2E312F`)
- Partner logos marquee using `<Marquee>` + partners data

Reference: Spec Section 3.9, old site lines 3445-3720.

- [ ] **Step 2: Add to index page**

Render `<Availability />` after GoldBanner.

- [ ] **Step 3: Commit**

```bash
git add src/components/Availability.astro src/pages/index.astro
git commit -m "feat: add Availability section with map and partner logos"
```

---

### Task 13: Newsletter

**Files:**
- Create: `src/components/Newsletter.astro`
- Create: `src/pages/api/newsletter.ts`

- [ ] **Step 1: Write Newsletter component**

Write `src/components/Newsletter.astro` with:
- Headline: "Bleib am Goldkurs"
- Sub: "News, Drops & exklusive Aktionen direkt in dein Postfach."
- Form: email input, honeypot hidden field, DSGVO checkbox (links to /datenschutz), submit button "Jetzt Gold sichern"
- Client-side: fetch POST to `/api/newsletter`, inline success/error message
- Styled with brand colors on dark background

Reference: Spec Section 3.10 + Section 17.

- [ ] **Step 2: Write newsletter API endpoint**

Write `src/pages/api/newsletter.ts`:

```ts
export const prerender = false

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { email, honeypot } = body

    // Honeypot check
    if (honeypot) {
      return new Response(JSON.stringify({ success: true, message: 'Danke!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Bitte gib eine gueltige E-Mail-Adresse ein.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Forward to newsletter service if configured
    const endpoint = import.meta.env.NEWSLETTER_ENDPOINT
    if (endpoint) {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Gold gesichert! Check dein Postfach.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Etwas ist schiefgelaufen. Versuch es spaeter nochmal.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

- [ ] **Step 3: Add to index page**

Render `<Newsletter />` after Availability, then `<Divider />`.

- [ ] **Step 4: Test form submission**

Submit form in browser. Expected: success message appears inline. API returns JSON.

- [ ] **Step 5: Commit**

```bash
git add src/components/Newsletter.astro src/pages/api/newsletter.ts src/pages/index.astro
git commit -m "feat: add Newsletter section with serverless API endpoint"
```

---

### Task 14: Gewinnspiel

**Files:**
- Create: `src/components/Gewinnspiel.astro`

- [ ] **Step 1: Write Gewinnspiel component**

Write `src/components/Gewinnspiel.astro` with:
- Section anchor `id="home-win"`
- H3: "Du liebst Motivation, guten Geschmack und ein bisschen Glanz im Alltag?"
- Sub text about the contest
- EUR 100 ticket SVG (inline from old site lines 3773-3810)
- Lottie animation: `<lottie-player src="/documents/lottieflow-cta-03-cdaf39-easey.json" background="transparent" speed="1.25" loop autoplay />` — lazy loaded
- "So bissst du dabei:" 4 step cards (Kaufen, Code finden, Eingeben, Gewinnen)
- Drive Company partner (fahrschule_schweden.avif + link)

Reference: Spec Section 3.11, old site lines 3730-4096.

Lazy-load lottie-player:
```html
<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        import('@lottiefiles/lottie-player')
        observer.disconnect()
      }
    })
  }, { rootMargin: '200px' })
  const el = document.querySelector('.win-lottie')
  if (el) observer.observe(el)
</script>
```

- [ ] **Step 2: Add to index page**

Render `<Gewinnspiel />` after Newsletter + Divider.

- [ ] **Step 3: Commit**

```bash
git add src/components/Gewinnspiel.astro src/pages/index.astro
git commit -m "feat: add Gewinnspiel section with steps and lazy-loaded Lottie"
```

---

## Chunk 6: FAQ + Footer + Sub-Pages

### Task 15: FAQ

**Files:**
- Create: `src/components/FAQ.astro`
- Create: `src/scripts/accordion.ts`

- [ ] **Step 1: Write accordion script**

Write `src/scripts/accordion.ts`:

```ts
function initAccordion() {
  document.querySelectorAll<HTMLElement>('.accordion-wrap').forEach((wrap) => {
    if (wrap.dataset.initialized) return
    wrap.dataset.initialized = 'true'

    const items = wrap.querySelectorAll<HTMLElement>('.accordion-item')

    items.forEach((item, index) => {
      const button = item.querySelector<HTMLButtonElement>('.accordion-toggle')
      const content = item.querySelector<HTMLElement>('.accordion-content')
      if (!button || !content) return

      // ARIA setup
      const buttonId = `faq-btn-${index}`
      const contentId = `faq-content-${index}`
      button.id = buttonId
      button.setAttribute('aria-controls', contentId)
      content.id = contentId
      content.setAttribute('aria-labelledby', buttonId)

      // Default: first item open
      if (index === 0) {
        item.classList.add('is-active')
        button.setAttribute('aria-expanded', 'true')
        content.style.gridTemplateRows = '1fr'
      } else {
        button.setAttribute('aria-expanded', 'false')
        content.style.gridTemplateRows = '0fr'
      }

      button.addEventListener('click', () => {
        const isActive = item.classList.contains('is-active')

        // Close all
        items.forEach((otherItem) => {
          const otherBtn = otherItem.querySelector<HTMLButtonElement>('.accordion-toggle')
          const otherContent = otherItem.querySelector<HTMLElement>('.accordion-content')
          if (otherBtn && otherContent) {
            otherItem.classList.remove('is-active')
            otherBtn.setAttribute('aria-expanded', 'false')
            otherContent.style.gridTemplateRows = '0fr'
          }
        })

        // Toggle current
        if (!isActive) {
          item.classList.add('is-active')
          button.setAttribute('aria-expanded', 'true')
          content.style.gridTemplateRows = '1fr'
        }
      })
    })
  })
}

document.addEventListener('DOMContentLoaded', initAccordion)
```

- [ ] **Step 2: Write FAQ component**

Write `src/components/FAQ.astro` with:
- Section anchor `id="home-faq"`
- Sticky-left layout: H2 "F.A.Crunchy" + intro text on left, accordion on right
- Renders items from `faqItems` data
- Each item: `<h3>` with toggle button, content wrapper with `grid-template-rows` transition
- CSS: `.accordion-content { display: grid; transition: grid-template-rows 0.3s ease; } .accordion-content > div { overflow: hidden; }`

Reference: Spec Section 3.12, old site lines 4097-4614.

- [ ] **Step 3: Add to index page**

Render `<FAQ />` after Gewinnspiel.

- [ ] **Step 4: Verify accordion works**

Expected: First item open by default. Clicking another opens it and closes the previous. ARIA attributes update correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/FAQ.astro src/scripts/accordion.ts src/pages/index.astro
git commit -m "feat: add FAQ section with accessible accordion"
```

---

### Task 16: Footer

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write Footer component**

Write `src/components/Footer.astro` with:
- Feicht & Frank badge (FF-Bust_online.avif)
- H2: "Hungrig auf mehr?"
- Contact: kontakt@golddigger.at
- Social links: Instagram + Facebook (from product.social)
- Sub-links: Datenschutz (/datenschutz), Impressum (/impressum)
- Copyright: `© ${new Date().getFullYear()} Gold Digger. Alle Rechte vorbehalten.`

Reference: Spec Section 3.13, old site lines 4620-4745.

- [ ] **Step 2: Add to index page**

Render `<Footer />` after main closing tag, before BaseLayout closing.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add Footer with contact, social links, and legal links"
```

---

### Task 17: Datenschutz, Impressum, 404 Pages

**Files:**
- Create: `src/pages/datenschutz.astro`
- Create: `src/pages/impressum.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: Write Datenschutz page**

Write `src/pages/datenschutz.astro`:
- Uses `<BaseLayout>` with title "Datenschutz — Gold Digger"
- Includes `<Nav />` and `<Footer />`
- Back-to-home link at top
- Content extracted from `references/website-old/datenschutz.html` (the text content, not the Webflow markup)
- Styled as prose content with Tailwind typography

- [ ] **Step 2: Write Impressum page**

Write `src/pages/impressum.astro`:
- Same structure as Datenschutz
- Title: "Impressum — Gold Digger"
- Content from `references/website-old/impressum.html`

- [ ] **Step 3: Write 404 page**

Write `src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import Nav from '../components/Nav.astro'
import Footer from '../components/Footer.astro'
---

<BaseLayout
  title="Seite nicht gefunden — Gold Digger"
  description="Diese Seite existiert nicht."
>
  <Nav />
  <main id="main" class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <img src="/images/gd_logo_wide.png" alt="Gold Digger Logo" width="200" class="mb-8 opacity-50" />
    <h1 class="text-4xl lg:text-5xl font-bold mb-4">Hier ist kein Gold vergraben.</h1>
    <p class="text-white/50 text-lg mb-8">Die Seite die du suchst existiert leider nicht.</p>
    <a
      href="/"
      class="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-surface-900 font-bold rounded-full hover:bg-brand-400 transition-colors"
    >
      Zurueck zur Startseite
    </a>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/datenschutz.astro src/pages/impressum.astro src/pages/404.astro
git commit -m "feat: add Datenschutz, Impressum, and 404 pages"
```

---

## Chunk 7: Final Assembly + Build Verification

### Task 18: Assemble Complete Index Page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Finalize index.astro**

Ensure `src/pages/index.astro` renders all sections in correct order:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import Nav from '../components/Nav.astro'
import Hero from '../components/Hero.astro'
import BrandStory from '../components/BrandStory.astro'
import Divider from '../components/Divider.astro'
import ProductDetails from '../components/ProductDetails.astro'
import ProductComparison from '../components/ProductComparison.astro'
import GoldBanner from '../components/GoldBanner.astro'
import Availability from '../components/Availability.astro'
import Newsletter from '../components/Newsletter.astro'
import Gewinnspiel from '../components/Gewinnspiel.astro'
import FAQ from '../components/FAQ.astro'
import Footer from '../components/Footer.astro'
---

<BaseLayout
  title="Gold Digger — Der Proteinriegel der motiviert | EUR 2,99"
  description="Gold Digger Proteinriegel: 31% Protein, 1,9g Zucker, handgemacht. Jetzt bei Billa, SPAR und online ab EUR 2,99."
  includeProductSchema
  includeFaqSchema
>
  <Nav />
  <main id="main">
    <Hero />
    <BrandStory />
    <Divider />
    <ProductDetails />
    <ProductComparison />
    <GoldBanner />
    <Availability />
    <Newsletter />
    <Divider />
    <Gewinnspiel />
    <FAQ />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Verify full page in browser**

```bash
npm run dev
```

Walk through entire page top to bottom:
- Nav sticky + transparent/solid toggle
- Hero: ticker, image, headline, price, features, CTA
- Brand Story: scroll text animates
- Divider renders
- Product Details: counters animate on scroll
- Product Comparison: side-by-side layout
- Gold Banner: dual marquee
- Availability: map + partner logos
- Newsletter: form submits
- Gewinnspiel: steps visible, Lottie loads
- FAQ: accordion works
- Footer: links work, Datenschutz/Impressum navigate

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble complete homepage with all sections"
```

---

### Task 19: Production Build + Lighthouse Check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds. Output in `dist/`.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Open `localhost:4321`. Verify all sections render correctly.

- [ ] **Step 3: Run Lighthouse audit**

In Chrome DevTools → Lighthouse → run audit for Performance, Accessibility, Best Practices, SEO.

Target: 95+ on all categories.

If below target, identify and fix issues (likely: image sizes, font loading, CLS from partner logos).

- [ ] **Step 4: Verify Schema.org**

View page source. Confirm JSON-LD blocks for Organization, Product, and FAQPage are present and valid.

Test with Google Rich Results Test if available.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: production build verified, Lighthouse optimized"
```

---

### Task 20: Vercel Deployment

- [ ] **Step 1: Verify Vercel config**

Ensure `astro.config.mjs` has `adapter: vercel()` and `output: 'hybrid'`.

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel
```

Follow prompts. Or connect GitHub repo to Vercel dashboard.

- [ ] **Step 3: Verify deployment**

Open the Vercel preview URL. Walk through entire site. Test newsletter form submission. Test 404 page by visiting a non-existent path.

- [ ] **Step 4: Configure custom domain**

In Vercel dashboard: Settings → Domains → add `golddigger.at`. Follow DNS instructions.

- [ ] **Step 5: Final commit with deployment notes**

```bash
git add -A
git commit -m "chore: verify Vercel deployment configuration"
```
