# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: serious DIY guitar pedal enthusiasts who build frequently and juggle multiple active projects at once. They work in home workshops and bench setups, often on mobile or tablet while hands are occupied with soldering and assembly.

Secondary audiences include broader electronics DIY builders and educators who adopt PedalVault for pedal-specific workflows, but design and feature decisions prioritize the enthusiast builder with recurring, multi-project inventory needs.

## Product Purpose

PedalVault is a guitar pedal parts inventory system that turns a chaotic component drawer into an organized workshop tool. It lets builders track what they own, tie parts to pedal projects, and compare project bills of materials (BOMs) against on-hand stock before and during a build.

Success means frictionless workshop flow (knowing what is available when it matters), eliminating duplicate purchases and lost parts, and becoming the go-to free tool for the DIY pedal community.

## Positioning

PedalVault is purpose-built for guitar pedal BOM workflows—not generic inventory software. Its differentiating mechanism combines project-centric BOM comparison, AI-assisted BOM import (via external tools and copy-paste prompts), NFC-friendly part URLs for tap-to-adjust stock, and domain-specific component intelligence (capacitor/resistor type tracking, fuzzy matching, duplicate merging)—all in a zero-signup, local-first PWA that works offline at the bench.

## Operating Context

- **Workshop usage:** Mobile-first, touch-optimized interface for use while building; installable PWA for quick access from phone or tablet.
- **Project workflow:** Create named projects, attach parts, import BOMs from CSV/JSON or pasted AI output, compare requirements against inventory, export project BOMs.
- **Data lifecycle:** Inventory and projects persist in browser local storage; users manually save/load JSON or CSV backups. Footer reminds users to save regularly.
- **Reorder workflow:** Parts can carry purchase URLs (Mouser, Digi-Key, etc.) for one-tap reordering.
- **NFC workflow:** Optional NFC tag IDs on parts; URL parameters (e.g. `?part=<id>&remove=1`) support tap-to-remove from inventory.
- **AI-assisted BOM creation:** Built-in BOM Assistant provides prompt templates for ChatGPT, Claude, Gemini, and similar tools; users paste or upload resulting CSV.
- **Deployment:** Hosted at https://pedalvault.app (Vercel). No backend account system.

## Capabilities and Constraints

**Confirmed capabilities:**

- Part inventory with quantities, types, purchase URLs, and project associations
- Visual low-stock indicators and sort/filter/search
- Quick quantity adjustments (+/−)
- Duplicate detection and merging
- Multi-project management with BOM import/export (JSON, CSV)
- BOM comparison (single project and all projects)
- Quick Paste BOM and BOM Assistant modal
- Offline-capable service worker with update banner
- Responsive layout with dedicated mobile bottom navigation
- Animated Rive logo and SVG wordmark
- About modal with GitHub and support links

**Technical constraints (repository-confirmed):**

- Vanilla JavaScript, HTML, and CSS—no framework, no build step
- Progressive Web App with service worker (`sw.js`)
- Data stored locally in the browser; no cloud sync or user accounts
- Content Security Policy on main HTML entry
- Vercel Analytics (insights script) on production deploy

**User-confirmed constraints:**

- Free to use under Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)
- Offline-capable installable PWA must be preserved

**Open / undecided:**

- Whether cloud sync or accounts will ever be added (currently absent by design; not confirmed as a permanent product decision beyond current implementation)
- Formal accessibility standard target (WCAG level not established)

## Brand Commitments

- **Name:** PedalVault
- **Tagline (in-app):** "Pedal Part Inventory"
- **Author:** Joseph Lindsay ([GitHub](https://github.com/j0sephl))
- **Voice:** Practical, community-oriented, workshop-friendly; celebrates DIY pedal building without corporate tone
- **Pricing stance:** Completely free—no ads, no subscriptions, no data collection (as stated in README and About modal)
- **Support:** Optional "Buy me a coffee" link (https://buymeacoffee.com/j0sephl); GitHub issues for bugs and suggestions
- **License:** CC BY-NC 4.0—viewing and learning encouraged; redistribution or derivative works require permission
- **Assets:** Rive animated logo (`rive-logo.js`), SVG wordmark (`icons/pedalvault.svg`, inline wordmark in `index.html`), full icon set under `icons/`

## Evidence on Hand

- **Live product:** https://pedalvault.app
- **Source README:** `README.md` (feature list, positioning copy, license)
- **About modal:** In-app feature list and credits (`index.html`)
- **Structured data:** Schema.org WebApplication metadata in `index.html`
- **Screenshots referenced in README:** Paths described but image files not present in repository root listing—do not fabricate screenshot assets
- **Testimonials / case studies / press:** None in repository—future marketing must not invent social proof

## Product Principles

1. **Workshop-first:** Every flow should answer "Do I have this part?" faster than opening a drawer or spreadsheet.
2. **Pedal-native, not generic:** Optimize for BOMs, component types, and build projects—not general warehouse inventory.
3. **Local trust:** Respect builder privacy; keep data on-device unless the user explicitly exports it.
4. **Free community tool:** Stay accessible to the DIY pedal community without paywalls or ads.
5. **Offline resilience:** The bench may not have reliable internet; core inventory workflows must work without connectivity.

## Accessibility & Inclusion

No product-specific accessibility standard has been established. The app includes some semantic landmarks, ARIA labels on key elements (logo, navigation), and role attributes on modals/banners. A formal WCAG target remains undecided.
