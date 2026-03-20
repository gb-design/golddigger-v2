# Gold Digger Website — Astro Migration Design Spec

## Datum: 2026-03-20

## Zusammenfassung

Migration der Gold Digger Proteinriegel-Website von Webflow-Export (statisches HTML/CSS/JS) zu **Astro 5 + Tailwind CSS 3**, deployed auf **Vercel**. One-Pager mit kritischen Audit-Fixes (SEO, Conversion, Performance). Bestehende Inhalte und Brand Identity bleiben erhalten, Code-Qualität und Performance werden radikal verbessert.

---

## 1. Tech Stack

| Technologie | Version | Zweck |
|---|---|---|
| Astro | 5.x | Framework (Static Site Generation) |
| Tailwind CSS | 3.x | Utility-first CSS (v3 fuer stabile Astro-Integration + JS Config) |
| GSAP + ScrollTrigger | 3.x | Selektive Animationen (Hero, Story Scroll) |
| SplitText (GSAP) | 3.x | Wort-basierte Scroll-Animation (Club Plugin, Lizenz erforderlich — Fallback: eigene Wort-Split-Funktion) |
| TypeScript | 5.x | Typsicherheit für Scripts + Daten |
| Vercel Adapter | latest | Deployment |

### Bewusst NICHT im Stack:
- Kein React/Vue/Svelte — nicht nötig für statischen One-Pager
- Kein webflow.js (370KB) — wird komplett ersetzt
- Kein normalize.css — Tailwind Preflight ersetzt das
- Kein Custom Cursor — entfällt (Performance-Entscheidung)
- Kein Lenis Smooth Scroll — native CSS `scroll-behavior: smooth` + `scroll-padding-top: 120px` (fuer sticky Nav Offset bei Anker-Links)

### GSAP SplitText Lizenz-Strategie:
SplitText ist ein GSAP Club Plugin (kostenpflichtig). **Fallback-Strategie:** Falls keine Lizenz vorhanden, wird eine eigene `splitWords()` Funktion implementiert die den Text in `<span class="word">` Elemente aufteilt. Die GSAP-Timeline-Animation bleibt identisch — nur der Split-Mechanismus wird ersetzt.

---

## 2. Projektstruktur

```
homepage-v2/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro          # HTML-Shell, Meta, Fonts, Schema.org
│   ├── pages/
│   │   ├── index.astro               # Homepage (One-Pager)
│   │   ├── datenschutz.astro         # Datenschutz (Content aus references/)
│   │   ├── impressum.astro           # Impressum (Content aus references/)
│   │   ├── 404.astro                 # Custom 404-Seite
│   │   └── api/
│   │       └── newsletter.ts         # Newsletter Serverless Endpoint
│   ├── components/
│   │   ├── Nav.astro                 # Navigation (Desktop + Mobile)
│   │   ├── Hero.astro                # Hero Section
│   │   ├── BrandStory.astro          # Scroll-Text Animation
│   │   ├── ProductDetails.astro      # Zutaten + Naehrwerte
│   │   ├── ProductComparison.astro   # VS-Vergleich
│   │   ├── GoldBanner.astro          # "Du bisst hier" Marquee
│   │   ├── Availability.astro        # Map + Partner-Logos
│   │   ├── Newsletter.astro          # NEU: E-Mail Erfassung
│   │   ├── Gewinnspiel.astro         # Gewinnspiel-Sektion
│   │   ├── FAQ.astro                 # F.A.Crunchy Accordion
│   │   ├── Footer.astro              # Footer
│   │   ├── Divider.astro             # Gold-Leaf Divider
│   │   ├── Marquee.astro             # Wiederverwendbare Marquee-Komponente
│   │   └── PriceTag.astro            # NEU: Preis-Badge (EUR 2,99)
│   ├── scripts/
│   │   ├── gsap-init.ts              # GSAP + ScrollTrigger lazy load
│   │   ├── scroll-text.ts            # Story Scroll Word-Animation
│   │   ├── counter.ts                # Naehrwert-Counter (IntersectionObserver)
│   │   └── accordion.ts              # FAQ Accordion (vanilla JS)
│   ├── data/
│   │   ├── faq.ts                    # FAQ-Daten (fuer Schema.org + Rendering)
│   │   ├── partners.ts               # Partner-Logos + Links
│   │   └── product.ts                # Naehrwerte, Produktinfos, Preis
│   └── styles/
│       └── global.css                # Tailwind directives + Custom Properties
├── public/
│   ├── images/                       # Statische Bilder (aus references/website-old)
│   ├── documents/                    # Lottie JSON
│   └── favicon.png
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── tsconfig.json
```

---

## 3. Sektionen-Design

### 3.1 BaseLayout

**Verantwortung:** HTML-Shell die von allen Seiten geteilt wird.

- `<!DOCTYPE html>` mit `lang="de"` (Audit-Fix: war "en")
- `<head>`: charset, viewport, Typekit CSS (`https://use.typekit.net/gaq1cqv.css`), Tailwind, favicon, Open Graph, Twitter Cards
- Schema.org JSON-LD: Organization, Product, FAQPage (generiert aus `data/`)
- Canonical URL
- Props: `title`, `description`, `ogImage`

### 3.2 Navigation (`Nav.astro`)

**Desktop:**
- Logo (gd_logo_wide.png) links
- Nav-Links mittig: Produktdetails, Verfuegbarkeit, Gewinnspiel, FAQ, Kontakt (mailto:kontakt@golddigger.at)
- CTA-Button "Online bestellen" rechts → `https://www.lackys.at/produkt/gold-digger-proteinriegel-45g/` (`target="_blank" rel="noopener"`)
- Sticky, transparent bei top → solide bei Scroll (CSS `backdrop-filter` + Klasse via IntersectionObserver auf Sentinel-Element direkt nach `<header>`, ca. 100px vom Seitenstart)

**Mobile:**
- Logo + Hamburger-Button
- Fullscreen-Overlay mit `clip-path` CSS-Animation (beibehalten aus Original)
- Gleiche Links + CTA

**Kein GSAP noetig** — reines CSS + minimales JS fuer Toggle.

### 3.3 Hero (`Hero.astro`)

**Layout:**
- "NEU im Handel" Ticker — CSS-only `@keyframes translateX` Marquee mit Diamant-SVG Trennern (#CDAF39)
- Produktfoto: `gd_riegelFoil.avif` — Astro `<Image>` mit responsive srcset (500w, 800w, 1080w, 2700w), `sizes="(max-width: 1040px) 100vw, 80vw"`, `loading="eager"`, `fetchpriority="high"`
- **NEU — Audit-Fix Headline:** "Der Proteinriegel, der motiviert" (statt "Check ihn dir, or disapPear!")
  - Unter-Headline: "Wer das Gold hat, macht die Regeln."
- **NEU — PriceTag:** "EUR 2,99" Badge prominent unterhalb der Headline (zentriert)
- Feature-Badges Row: `31% High Protein` | `187 kcal` | `1,9g Zucker`
- Schwebende Deko-Elemente (Schoko-Stuecke, Banane, Nuggets) mit CSS `@keyframes` float-Animation
- CTA-Button: "Jetzt bestellen — EUR 2,99" → Lacky's Shop

**GSAP:** Nur fuer Hero-Entrance (fade-in + staggered slide-up bei Seitenaufruf).

### 3.4 Brand Story (`BrandStory.astro`)

**Dies ist die Kern-Animation der Seite — GSAP beibehalten.**

- Scroll-driven Text: "Aus einer innovativen Idee entstand ein trendiger Proteinriegel, der Funktionalitaet neu interpretiert – der Gold Digger. Hoher Proteingehalt, intelligente Ballaststoffe, klar definiert. Ohne Ueberfluss. Ohne Schnickschnack. Denn wer das Gold hat, macht die Regeln!"
- GSAP SplitText teilt in Woerter → jedes Wort faerbt sich von transparent zu weiss bei Scroll
- "Gold Digger" Woerter werden in Brand-Gold (#CDAF39) + Bold hervorgehoben
- ScrollTrigger: `start: "clamp(top center)"`, `end: "clamp(bottom center)"`, `scrub: 1`

**Zitat-Block darunter:**
- Feicht & Frank Badge (FF-Bust_online.avif)
- Zitat: "Lassen Sie sich motivieren und stellen Sie Ihr Lebensgefuehl so ein, wie mein Vorbild Frank Stronach aus Kanada, der mich seit jeher durch sein unternehmerisches Denken beflügelte."
- Attribution: "- Oliver Feicht -"

### 3.5 Divider (`Divider.astro`)

- Wiederverwendbare Komponente: Linie — Gold-Leaf SVG — Linie
- Verwendet zwischen Brand Story/Produktdetails und Verfuegbarkeit/Gewinnspiel

### 3.6 Produktdetails (`ProductDetails.astro`, `#home-details`)

**Oberer Teil:**
- Zwei-Spalten: H2 "Originale Zutaten. Einfach handgemacht." | Body-Text
- Naehrwert-Counter-Row: 31% | 187 kcal | 1,9g
  - IntersectionObserver (`threshold: 0.4`) triggert einmalig
  - Zaehlt von 0 zum Zielwert ueber 3 Sekunden (60 Frames)
  - Ganzzahlen (31, 187) als `Math.floor()`, Dezimal (1.9) als `toFixed(1)`

**Zutaten-Grid (3 Spalten + zentrales Bild):**
1. Knackiger Kakaomantel (choc-ing.avif) — "Aussen zartschmelzend, innen charaktervoll..."
2. Riegel-Querschnitt Bild zentral (RiegelQuerschnitt_detail.avif) mit "45g pro Portion" Tag
3. Crispy Balls (balls-ing.avif) — "Feine Knusperkugeln..."
4. Soft Protein Kern (banana-ing.avif) — "Die helle, weiche Proteinfuellung..."

Zutatenbilder mit CSS float-Animation (beibehalten).

### 3.7 Produktvergleich (`ProductComparison.astro`)

- H3: "Ein Stueck Motivation gegen Hunger"
- Sub: "Besserer Snack. Bessere Zutaten. Besseres Gefuehl."
- Side-by-side Vergleich:
  - **Gold Digger 45g:** 31% High Protein | Handgemacht | 100% Motivation (gd_Riegel_topView-1.avif)
  - **VS.**
  - **Herkoemmlicher Riegel 30g:** 17% Protein | Massenprodukt | Max. Langeweile (RiegelMitbewerb-1.avif)
- Dekorative Diamant-SVG Trennlinie

### 3.8 Gold Banner (`GoldBanner.astro`)

- H2: "Du bisst hier ..."
- CSS-only Marquee mit zwei Tracks:
  - Track 1 (reversed): "GOLD GOLD GOLD..." scrollt nach links
  - Track 2: "richtig! richtig!..." scrollt nach rechts
- Riegel-Explosion Bild (riegel-explosion_transparent-1.avif) ueberlagert

### 3.9 Verfuegbarkeit (`Availability.astro`, `#home-availability`)

- H2: "Jetzt zugreifen, solange das Gold heiss ist"
- Text: "Der Gold Digger ist ab 10.12.25 im Handel und online erhaeltlich..."
- **NEU — Audit-Fix:** Preis (EUR 2,99) hier nochmals sichtbar
- Google Maps Embed (iframe, lazy loaded)
- Partner-Logos Marquee (wiederverwendet `Marquee.astro`):
  - Lackner Handel, Lacky's, Billa, Well One, Sparkasse, Spar, John Harris, ARBOE

### 3.10 Newsletter (`Newsletter.astro`) — NEU

**Audit-Fix #3: E-Mail-Erfassung**

- Headline: "Bleib am Goldkurs"
- Sub-Text: "News, Drops & exklusive Aktionen direkt in dein Postfach."
- Formular: E-Mail Input + Submit-Button "Jetzt Gold sichern"
- Erfolgs-/Fehlermeldung inline
- Backend: Konfigurierbar via Environment-Variable (`NEWSLETTER_ENDPOINT`) — unterstuetzt Vercel Serverless Function, Mailchimp, ConvertKit
- Position: zwischen Verfuegbarkeit und Gewinnspiel
- Minimal, passt zum Brand-Design (Gold-Akzente auf dunklem Hintergrund)

### 3.11 Gewinnspiel (`Gewinnspiel.astro`, `#home-win`)

- H3: "Du liebst Motivation, guten Geschmack und ein bisschen Glanz im Alltag?"
- Sub: "Mach bei unserem Gewinnspiel mit..."
- EUR 100,- Gutschein-Ticket (SVG inline beibehalten)
- Lottie CTA-Animation (lottieflow-cta-03-cdaf39-easey.json) — via `@lottiefiles/lottie-player` Web Component, lazy-loaded (Sektion ist weit unten auf der Seite)
- "So bissst du dabei:" — 4 Schritt-Karten
- Drive Company Partner-Logo + Link

### 3.12 FAQ (`FAQ.astro`, `#home-faq`)

- Sticky-Left Layout: H2 "F.A.Crunchy" + Intro-Text links | Accordion rechts
- 6 FAQ-Items aus `data/faq.ts`:
  1. Ist der Gold Digger vegetarisch / vegan?
  2. Kann ich den Gold Digger als Mahlzeitenersatz verwenden?
  3. Wie viel Zucker enthaelt der Gold Digger?
  4. Wie viel Protein steckt drin?
  5. Ist echte Banane drin?
  6. Enthaelt der Riegel Allergene?
- Accordion: CSS `grid-template-rows: 0fr → 1fr` Transition, vanilla JS Toggle
- ARIA-Attribute: `aria-expanded`, `aria-controls`, `aria-labelledby` auf Button/Content
- Erstes Item default offen
- **Audit-Fix:** FAQPage Schema.org JSON-LD automatisch generiert aus `data/faq.ts`

### 3.13 Footer (`Footer.astro`)

- Feicht & Frank Badge
- H2: "Hungrig auf mehr?"
- Kontakt: kontakt@golddigger.at
- Social Links: Instagram (`/golddiggeraustria`), Facebook (`/golddiggeraustria`)
- Links: Datenschutz, Impressum
- Copyright mit aktuellem Jahr (dynamisch)

---

## 4. SEO & Schema.org (Audit-Fixes)

### Meta Tags (BaseLayout):
```html
<title>Gold Digger — Der Proteinriegel der motiviert | EUR 2,99</title>
<meta name="description" content="Gold Digger Proteinriegel: 31% Protein, 1,9g Zucker, handgemacht. Jetzt bei Billa, SPAR und online ab EUR 2,99." />
<meta property="og:title" content="Gold Digger — Der Proteinriegel der motiviert" />
<meta property="og:description" content="31% High Protein, knackige Schoko-Banane. Ab EUR 2,99 im Handel." />
<meta property="og:type" content="website" />
<meta property="og:locale" content="de_AT" />
<link rel="canonical" href="https://golddigger.at/" />
```

### Schema.org JSON-LD:
- **Product:** Name, Beschreibung, Bild, Preis (EUR 2,99), Verfuegbarkeit, Brand, Naehrwerte
- **FAQPage:** Automatisch aus `data/faq.ts` generiert
- **Organization:** Gold Digger / Feicht & Frank, Logo, Kontakt, Social Links

---

## 5. Design Tokens (Tailwind Config)

```js
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#CDAF39',    // Gold — Primary Brand Color
          400: '#D4BC5A',    // Gold Light
          600: '#B89A2E',    // Gold Dark
        },
        surface: {
          900: '#0a0a0a',    // Page Background (near-black)
          800: '#141414',    // Card/Section Background
          700: '#1e1e1e',    // Elevated Surface
        },
        text: {
          primary: '#FAFAFA',   // Light-100
          faded: 'rgba(250, 250, 250, 0.5)',  // Light-100 50%
          muted: 'rgba(250, 250, 250, 0.25)', // Light-100 25%
        },
      },
      fontFamily: {
        serif: ['"mendl-serif-dusk"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      animation: {
        'marquee': 'marquee var(--marquee-duration, 20s) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--marquee-duration, 20s) linear infinite',
        'float': 'floatY var(--float-speed, 4s) ease-in-out infinite',
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
}
```

---

## 6. Daten-Layer

### `data/product.ts`
```ts
export const product = {
  name: 'Gold Digger Proteinriegel',
  tagline: 'Der Proteinriegel, der motiviert',
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
}
```

### `data/faq.ts`
```ts
export const faqItems = [
  {
    question: 'Ist der Gold Digger vegetarisch / vegan?',
    answer: 'Nein, der Riegel ist nicht vegan. Vegetarisch ist er — je nach Auspraegung — nicht vollstaendig, da der Riegel Milchbestandteile enthaelt.',
  },
  {
    question: 'Kann ich den Gold Digger als Mahlzeitenersatz verwenden?',
    answer: 'Der Gold Digger ist ein Snack mit Power, aber kein vollwertiger Mahlzeitenersatz. Fuer eine ausgewogene Ernaehrung gehoert eine richtige Hauptmahlzeit dazu.',
  },
  {
    question: 'Wie viel Zucker enthaelt der Gold Digger?',
    answer: 'Bei 45g sind 1,9g Zucker drinnen — angenehm wenig fuer viel Geschmack.',
  },
  {
    question: 'Wie viel Protein steckt drin?',
    answer: 'Pro Riegel bekommst du 31% High Protein. Ideal als Pre- oder Post-Workout-Boost oder fuer zwischendurch.',
  },
  {
    question: 'Ist echte Banane drin?',
    answer: 'Echte Banane in Form von knusprigen Bananenchips ist beinhaltet.',
  },
  {
    question: 'Enthaelt der Riegel Allergene?',
    answer: 'Soja, Natrium-Caseinat, Molkenproteinkonzentrat. Kann Spuren von Gluten, Nuessen, Schwefeldioxid, Sesam und Erdnuessen enthalten.',
  },
]
```

### `data/partners.ts`
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
Hinweis: `width`/`height` sind Platzhalter-Werte fuer CLS-Vermeidung. Exakte Werte werden bei der Image-Migration ermittelt.

---

## 7. Animations-Strategie

| Element | Methode | Grund |
|---|---|---|
| Marquee Ticker ("NEU im Handel") | CSS `@keyframes` | Kein JS noetig, performant |
| Hero Entrance | GSAP (fade-in, stagger) | Smooth orchestrierte Entrance |
| Schwebende Deko-Elemente | CSS `@keyframes floatY` | Endlos-Loop, kein JS noetig |
| Brand Story Scroll-Text | GSAP + ScrollTrigger + SplitText | Kern-Feature, benoetigt scrub |
| Naehrwert-Counter | IntersectionObserver + vanilla JS | Einfach, kein GSAP noetig |
| "Du bisst hier" Marquee | CSS `@keyframes` | Kein JS noetig |
| Partner-Logo Marquee | CSS `@keyframes` | Kein JS noetig |
| FAQ Accordion | CSS `grid-template-rows` + vanilla JS | Smooth Transition ohne Library |
| Nav Scroll-State | IntersectionObserver | Sentinel-Element statt ScrollTrigger |
| Lottie CTA | `@lottiefiles/lottie-player` | Bestehende Animation beibehalten |

**GSAP wird nur fuer 2 Sektionen geladen:** Hero + Brand Story. Alles andere ist CSS oder vanilla JS.

---

## 8. Performance-Budget

| Metrik | Aktuell (Webflow) | Ziel (Astro) |
|---|---|---|
| HTML | ~5.000 Zeilen | ~800 Zeilen |
| CSS | 280KB (3 Dateien) | ~15-20KB (Tailwind purged) |
| JS | 370KB webflow.js + GSAP | ~45KB (GSAP only, tree-shaken) |
| Lighthouse Performance | ~60-70 | 95+ |
| Lighthouse SEO | ~50-60 | 95+ |
| First Contentful Paint | ~3s+ | < 1.2s |
| Largest Contentful Paint | ~5s+ | < 2.5s |
| Total Page Weight | ~1.5MB+ | < 500KB (ohne Bilder) |

---

## 9. Vercel Deployment

```js
// astro.config.mjs
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

- `output: 'hybrid'` — Seiten sind standardmaessig statisch (SSG), aber einzelne Endpoints (Newsletter API) koennen serverseitig laufen
- Alle `.astro` Seiten werden statisch gerendert (default)
- Newsletter-Endpoint: Vercel Serverless Function unter `src/pages/api/newsletter.ts` (server-rendered)
- Build: `astro build` → statische Dateien + Serverless Functions
- Custom Domain: `golddigger.at` in Vercel konfigurieren

---

## 10. Offene Entscheidungen

1. **Newsletter-Backend:** Mailchimp, ConvertKit, oder eigene Vercel Function? → Wird als konfigurierbare Umgebungsvariable implementiert, konkreter Service spaeter.
2. **Hero-Headline:** Exakter Wortlaut muss vom Kunden (Oliver Feicht) freigegeben werden. Default-Vorschlag: "Der Proteinriegel, der motiviert"
3. **Google Maps API Key:** Bestehender Embed-Link wird uebernommen. Falls Custom Styling gewuenscht, benoetigt eigener API Key.
4. **Gewinnspiel-Status:** Ist das Gewinnspiel noch aktiv? Falls nicht, Sektion entfernen oder als "abgelaufen" markieren.

---

## 11. Was NICHT im Scope ist

- E-Commerce / eigener Checkout (spaetere Phase)
- Blog / Content Hub (spaetere Phase)
- Mehrere Geschmacksrichtungen / Produktseiten
- CMS-Integration (Contentful, Sanity, etc.)
- Custom Cursor (bewusst entfernt)
- Lenis Smooth Scroll (native CSS reicht)
- A/B Testing Framework
- Analytics-Integration (kann spaeter via Vercel Analytics ergaenzt werden — empfohlen als Phase-1 Follow-up)

---

## 12. Responsive Breakpoints

Abgeleitet vom Original-Design (65em Breakpoint):

| Breakpoint | Wert | Verhalten |
|---|---|---|
| `sm` | 640px | Kleine Anpassungen |
| `md` | 768px | Tablet-Layout |
| `lg` | 1040px (65em) | Desktop-Nav, Zwei-Spalten-Layouts |
| `xl` | 1280px | Groessere Abstaende |
| `2xl` | 1536px | Max-Width Container |

Der Hauptbreakpoint `lg` wird auf **1040px** (65em) gesetzt statt Tailwind-Default (1024px), um dem Original-Design zu entsprechen.

---

## 13. Accessibility

- Skip-to-content Link (`<a href="#main">Zum Inhalt springen</a>`) — beibehalten aus Original
- Semantisches HTML: `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`
- `aria-label` auf Navigation, Logo-Link ("Startseite")
- FAQ Accordion: `aria-expanded`, `aria-controls`, `aria-labelledby`
- Bilder: Sinnvolle `alt`-Texte (aus Original uebernommen)
- Fokus-Styles: Sichtbarer Outline auf interaktiven Elementen
- Farbkontrast: Gold (#CDAF39) auf Schwarz erreicht WCAG AA fuer grosse Texte (Headings). Fuer Body-Text wird Weiss (#FAFAFA) auf Schwarz verwendet (Kontrast > 18:1).
- Tastatur-Navigation: Alle interaktiven Elemente erreichbar via Tab

---

## 14. Datenschutz & Impressum Seiten

- Content wird 1:1 aus `references/website-old/datenschutz.html` und `impressum.html` migriert
- Verwenden das gleiche `BaseLayout.astro` mit eigenem `title` und `description`
- Reiner Text-Content, keine Animationen
- Zurueck-zur-Startseite Link oben

---

## 15. 404-Seite

- `src/pages/404.astro`
- Verwendet BaseLayout
- Kurzer Text im Brand-Voice: "Hier ist kein Gold vergraben."
- CTA: "Zurueck zur Startseite"
- Gold Digger Logo

---

## 16. Image-Asset-Migration

Alle Bilder werden aus `references/website-old/images/` nach `public/images/` kopiert. Die Bilder liegen bereits im AVIF-Format vor (vom Webflow-Export). Responsive Varianten (`-p-500`, `-p-800`, etc.) werden beibehalten.

**Kern-Assets:**
- `gd_logo_wide.png` / `-p-500.png` — Logo
- `gd_riegelFoil.avif` + responsive — Hero Produktfoto
- `RiegelQuerschnitt_detail.avif` + responsive — Querschnitt
- `choc-ing.avif`, `balls-ing.avif`, `banana-ing.avif` — Zutatenbilder
- `gd_Riegel_topView-1.avif` — Riegel Top View (Vergleich)
- `RiegelMitbewerb-1.avif` — Konkurrenz-Riegel (Vergleich)
- `riegel-explosion_transparent-1.avif` — Banner Bild
- `FF-Bust_online.avif` — Feicht & Frank Badge
- `leaf-gold.svg`, `dots.svg` — Deko-Elemente
- `favicon.png` — Favicon
- Partner-Logos: `lackner-logo.avif`, `lackys-logo.avif`, `billa-logo.avif`, `well-one.avif`, `sparkasse-logo.avif`, `spar-logo.avif`, `harris-logo.avif`, `arboe-logo.avif`
- Deko: `deco-el-1.avif`, `deco-el-2.avif`, `diamond-grid-pattern_2k.png`
- Gewinnspiel: `fahrschule_schweden.avif` (Drive Company)
- Hero Flavors: `bananaChips-hero.avif`, `choc-hero.avif`, `nugget-hero.avif`

Nicht migriert: `cursor-hand.png`, `cursor-hand-link.png` (Custom Cursor entfaellt), `rich-text-image-placeholder.svg` (Webflow-spezifisch).

---

## 17. Newsletter Endpoint Details

### Client-Side:
```ts
// Form submit via fetch()
const response = await fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
})
```

### Server-Side (`src/pages/api/newsletter.ts`):
```ts
// Astro API Route (server-rendered via Vercel)
export const prerender = false

export async function POST({ request }) {
  const { email } = await request.json()
  // Validierung: E-Mail Format
  // Honeypot: hidden field check
  // Forward zu NEWSLETTER_ENDPOINT env var
  // Return JSON { success: true/false, message: string }
}
```

### DSGVO-Konformitaet:
- Checkbox "Ich stimme der Datenschutzerklaerung zu" (Pflichtfeld, Link zu /datenschutz)
- Double Opt-In wird vom Newsletter-Service gehandhabt (Mailchimp/ConvertKit)
- Kein Tracking ohne Einwilligung
- Honeypot-Feld statt Captcha (bessere UX)
