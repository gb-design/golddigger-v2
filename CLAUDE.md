# Gold Digger Website — homepage-v2

## Projekt

Marketing-Website fuer den Gold Digger Proteinriegel (Marke von Feicht & Frank, Oesterreich).
Migration von Webflow-Export zu **Astro 5 + Tailwind CSS 3**, deployed auf **Vercel**.

## Tech Stack

- **Framework:** Astro 5 (Hybrid Output — statisch + Serverless)
- **CSS:** Tailwind CSS 3 mit JS-Config (`tailwind.config.mjs`)
- **Animationen:** GSAP 3 + ScrollTrigger (nur Hero + Brand Story), Rest CSS-only
- **Font:** Mendl Serif Dusk via Adobe Typekit (`https://use.typekit.net/gaq1cqv.css`)
- **Deployment:** Vercel (Hybrid Adapter)
- **Sprache:** TypeScript

## Wichtige Dateien

- `docs/superpowers/specs/2026-03-20-gold-digger-astro-migration-design.md` — Design Spec (vollstaendige Referenz)
- `references/website-old/` — Original Webflow-Export (HTML/CSS/JS/Images)
- `audit-report/gd-audit.md` — Marketing-Audit (32/100)
- `BRAND-VOICE.md` — Brand Voice Guidelines

## Architektur-Entscheidungen

- **One-Pager** mit Anchor-Navigation (vorerst, spaeter erweiterbar)
- **Hybrid Output:** Seiten sind statisch (SSG), nur `/api/newsletter` ist serverseitig
- **GSAP nur fuer 2 Sektionen:** Hero-Entrance + Brand Story Scroll-Text. Alles andere ist CSS oder vanilla JS
- **SplitText Fallback:** Falls keine GSAP Club Lizenz, eigene `splitWords()` Funktion
- **Kein Custom Cursor, kein Lenis** — bewusst entfernt fuer Performance
- **Tailwind 3** (nicht 4) — stabile `@astrojs/tailwind` Integration mit JS-Config

## Design Tokens

- Brand Gold: `#CDAF39`
- Background: `#0a0a0a` (near-black)
- Text: `#FAFAFA` (light)
- Font: `mendl-serif-dusk` (serif)
- Breakpoint Desktop: `1040px` (65em, wie Original)

## Konventionen

- Sprache im Code: Englisch (Dateinamen, Variablen, Kommentare)
- Sprache im Content: Deutsch (Website-Texte, Meta-Tags)
- Komponenten: `.astro` Dateien in `src/components/`
- Daten: Zentralisiert in `src/data/` (product.ts, faq.ts, partners.ts)
- Scripts: Vanilla TS in `src/scripts/`, kein Framework-JS
- Bilder: `public/images/` (AVIF/WebP aus Webflow-Export)

## Referenzen

- Domain: golddigger.at
- Shop: https://www.lackys.at/produkt/gold-digger-proteinriegel-45g/
- Kontakt: kontakt@golddigger.at
- Instagram: /golddiggeraustria
- Facebook: /golddiggeraustria
