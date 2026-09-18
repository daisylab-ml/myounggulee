# DAISY Lab Website Design System

## 1. Atmosphere & Identity

The site is a restrained academic portfolio with a near-black canvas, cool slate typography, and indigo accents. Its signature is a quiet, border-led depth system: content is organized into dark tonal cards with fine translucent outlines rather than heavy shadows.

## 2. Color

| Role | Token / utility | Value | Usage |
|---|---|---:|---|
| Page surface | `night-950` | `#05060a` | Global background |
| Section surface | `night-900` | `#090a10` | Elevated sections |
| Card surface | `night-850` | `#0c0e15` | Cards and list rows |
| Badge surface | `night-800` | `#11131c` | Logos and compact badges |
| Text primary | `white` | `#ffffff` | Headings and primary labels |
| Text secondary | `slate-300` | `#cbd5e1` | Supporting body copy |
| Text muted | `slate-400` | `#94a3b8` | Secondary labels |
| Text tertiary | `slate-500` | `#64748b` | Metadata and subtitles |
| Accent strong | `primary-500` | `#6366f1` | Pills, markers, focus accents |
| Accent medium | `primary-400` | `#818cf8` | Hover borders and overlines |
| Accent soft | `primary-300` | `#a5b4fc` | Dates and compact wordmarks |
| Accessible CTA | `primary-accessible` | `#5559d6` | White-text CTA fill with AA contrast |
| Accessible CTA hover | `primary-accessible-hover` | `#4c50c6` | CTA hover fill with AA contrast |
| Footer muted | `footer-muted` | `#7c8ba1` | Copyright text on `night-950` |
| Border subtle | `white/[0.06]` | 6% white | Cards |
| Border visible | `white/[0.08]` | 8% white | Badges and dividers |
| Code atmosphere primary | `code-indigo` | `rgba(165, 180, 252, 0.72)` | Active typed characters at the hero edges |
| Code atmosphere secondary | `code-slate` | `rgba(100, 116, 139, 0.52)` | Older code rows and syntax punctuation |
| Binary stream | `code-binary` | `rgba(129, 140, 248, 0.44)` | Dense 0/1 curtains, kept quieter than code blocks |
| Code atmosphere cursor | `code-cursor` | `rgba(129, 140, 248, 0.95)` | Persistent staggered typing cursors |

Do not add company-specific colors to compact career logos; use the site palette so the page remains cohesive.

## 3. Typography

- Primary font: `Inter, sans-serif`.
- Page titles: 30–36px, weight 600.
- Section titles: 24px, weight 600.
- Card titles: 16px, weight 600.
- Body and supporting copy: 14–16px.
- Metadata and logo microtype: 9–12px, weight 600–800.
- Korean and English text use the same scale; long names wrap naturally and are never clipped.

## 4. Spacing & Layout

- Base unit: 4px.
- Page gutters: 16px mobile, 24px tablet, 32px desktop.
- Content widths: `max-w-7xl` page shell and `max-w-5xl` focused content.
- Repeated card padding: 16px or 24px depending on density.
- Career rows use a 16px gap between logo and text.
- Breakpoints follow the existing utilities: `sm` 640px, `md` 768px, `lg` 1024px.

## 5. Components

### Section Heading

- Structure: heading with a vertical indigo marker and a subtle bottom divider.
- States: static.
- Accessibility: semantic heading hierarchy.

### Content Card

- Structure: rounded container, subtle border, `night-850` surface, text stack.
- States: default and indigo-tinted hover border.
- Accessibility: sufficient contrast; hover is decorative and does not hide information.

### Career Row

- Structure: monochrome company logo badge, organization/role stack, period pill.
- Logo badge: fixed `h-12 w-24`, `night-800` surface, 8% white border, centered text wordmark, `aria-hidden` because the organization name is repeated beside it.
- Layout: logo and content remain side by side; title and period stack on mobile and align horizontally from `sm` upward.
- Content stress: organization names may wrap; the logo never shrinks.
- States: default and the shared card hover border.

### Period Pill

- Structure: compact rounded label with indigo text, translucent indigo surface, and border.
- States: static.

### Code Atmosphere Layer

- Structure: one decorative, pointer-transparent canvas behind the home hero content; it never replaces live text or controls.
- Layout: code is concentrated in the outer 28% of each side, with a quiet central safe zone for the hero headline and CTAs.
- Content: short research, data, and model-building statements plus restrained vertical binary streams; no Matrix-green palette or fake controls.
- Responsive behavior: column density scales with viewport width; at 900px and below the outer 18% bands carry the atmosphere while the central 64% remains fully quiet.
- Accessibility: `aria-hidden`; the canvas stops animating when the page is hidden and renders a static frame for `prefers-reduced-motion: reduce`.

## 6. Motion & Interaction

- Existing control and career-row color transitions use the compiled utility default of approximately 150ms.
- The home hero carries one signature ambient moment: code rows type at 11–24 characters per second, then drift downward at 8–18 pixels per second in an 8–12 second visual cycle.
- The code atmosphere adapts the beui.dev `shader-background` mechanism: one isolated full-bleed canvas, speed frozen under reduced motion, and no interaction capture.
- Named implementation tokens: `FRAME_RATE=24`, `MAX_DEVICE_PIXEL_RATIO=1.5`, `CODE_EDGE_RATIO=0.32`, `BINARY_EDGE_RATIO=0.29`, and responsive binary spacing of 18px mobile / 20px desktop.
- Canvas animation is capped at 24 frames per second, pauses while the document is hidden, and never animates layout properties.
- Initial canvas activation waits for the page load event and the next idle period (maximum 1.2 seconds) so it never competes with the first contentful paint.
- Logos and other non-interactive content remain static.

## 7. Depth & Surface

Strategy: mixed tonal shift plus subtle borders. Cards use progressively lighter night surfaces and 6–8% white borders. Career cards and logos do not add shadows; depth comes from surface contrast and border hierarchy.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA contrast for text and controls.
- Decorative logos are hidden from assistive technology because adjacent organization text carries the same information.
- No text may clip, overflow horizontally, or produce unreadable Korean line breaks at 375px.
- Interactive elements retain their existing keyboard and focus behavior.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|---|---|---|---|
| Only compiled production assets are present; original React source and Tailwind configuration are unavailable. | `assets/index-717b109f.js`, `assets/index-fc036d29.css` | Pre-existing repository state; changes must reuse already-compiled utility classes. | Replace with source-driven builds when the original project source is restored. |
