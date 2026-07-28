---
name: PedalVault
description: Nord-themed workshop inventory UI for DIY guitar pedal builders
colors:
  bg-dark: "#2E3440"
  bg-light: "#3B4252"
  fg: "#E5E9F0"
  accent: "#5E81AC"
  danger: "#BF616A"
  success: "#A3BE8C"
  warn: "#EBCB8B"
  info: "#88C0D0"
  muted: "#4C566A"
  highlight: "#ECEFF4"
typography:
  body:
    fontFamily: "'JetBrains Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  display:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  none: "0"
  sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  notification-success:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    padding: "15px 25px"
  notification-error:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    padding: "15px 25px"
---

## Overview

PedalVault uses a **Nord Polar Night** palette with monospace typography — a workshop terminal aesthetic tuned for inventory management at the bench. The UI is flat (zero border-radius on panels), high-contrast, and mobile-first. Brand gold (`#EBCB8B`) appears in the wordmark and tagline; functional colors encode stock status (missing, low, sufficient).

**Creative north star:** *The Bench Terminal* — precise, readable, no decoration without purpose.

## Colors

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Page background | `--bg-dark` / `--nord1` | `#2E3440` | Body, inventory rows |
| Surface | `--bg-light` / `--nord2` | `#3B4252` | Container, modals, cards |
| Foreground | `--fg` / `--nord6` | `#E5E9F0` | Primary text |
| Accent | `--accent` / `--nord10` | `#5E81AC` | Buttons, links, focus adjacency |
| Info | `--info` / `--nord8` | `#88C0D0` | Modal headings, labels, focus ring |
| Success | `--success` / `--nord14` | `#A3BE8C` | In-stock status, notification border |
| Warning | `--warn` / `--nord13` | `#EBCB8B` | Low stock, brand tagline |
| Danger | `--danger` / `--nord11` | `#BF616A` | Missing stock, delete actions, error border |
| Muted | `--muted` / `--nord4` | `#4C566A` | Borders, placeholders |

Status indicators use **1px left-border accents** on list items — never thicker than 1px.

## Typography

- **Single family:** JetBrains Mono for all UI text. Monospace signals precision and aligns with the electronics/DIY audience.
- **Hierarchy via weight and color:** Modal titles and labels use `--nord8` at 600 weight; body at 400; tagline uses `--warn`.
- **Wordmark:** Inline SVG in `#ebcb8b` gold — not a web font.
- **Measure:** Inventory list items truncate on desktop with tooltip expansion; mobile wraps freely.

## Layout

- **Desktop:** Two-column flex — left action panel (~1fr), right inventory (~5fr). Max container 1920px.
- **Mobile (≤1024px):** Single column; sidebar actions move to bottom nav + slide-up menus. Safe-area insets on bottom nav.
- **Touch targets:** Minimum 44×44px on all interactive controls (`--touch-target-min`).
- **Modals:** Centered, max-width 500px (600px for wide BOM/About). Full-viewport overlay at 80% opacity.

## Elevation & Depth

Flat design — depth via **tonal layering** (nord1 → nord2 → nord3), not shadows. Modals use `box-shadow: 0 4px 16px` sparingly. No glass/blur effects.

## Shapes

- **Border radius:** 0 on panels, modals, buttons (workshop utilitarian).
- **Exceptions:** 4px on quantity buttons, notifications, type pills.
- **Borders:** 1–2px solid `--nord4` / `--nord3` on inputs, modals, cards.

## Components

### Buttons
- **Primary action** (`.btn-add`, `.add-part-btn`): `--accent` background, `--fg` text.
- **Import** (`.import-btn`): `--nord9` tones.
- **Export** (`.export-btn`): `--nord14` green tones.
- **Cancel** (`.cancel-btn`): `--nord4` muted.
- **Danger** (`.btn-remove`): `--danger`.

### Inventory item
- Row with part name, type pill, project tags, quantity (+/−), action icons (edit/delete/shop).
- Low stock: quantity text turns `--danger` below threshold (10).

### Modals
- `role="dialog"`, `aria-modal="true"`, labelled headings.
- Focus trapped; Escape and backdrop click close.
- Form fields use visible `.field-label` elements.

### Mobile navigation
- Fixed bottom bar: Action, BOM, Data, Projects.
- Slide-up menu sheets per tab.

### Notifications
- Fixed top-right toast; dark background with colored border (success green / error red).
- `role="status"`, `aria-live` polite/assertive.

## Do's and Don'ts

**Do:**
- Use CSS custom properties from `:root` for all new colors.
- Keep monospace for data-dense inventory views.
- Encode status with color + icon, not color alone.
- Respect `prefers-reduced-motion` — skip Rive animation, disable transitions.

**Don't:**
- Add border-radius to main panels or modals.
- Use side-tab borders thicker than 1px.
- Rely on placeholder text as the only label.
- Block pinch-zoom (`user-scalable=no`).
- Introduce gradients on text or decorative glass effects.
