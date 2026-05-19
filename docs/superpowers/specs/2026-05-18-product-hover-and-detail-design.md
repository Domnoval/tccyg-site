# Product Hover Swap + Side-by-Side Detail View — Design

**Date:** 2026-05-18
**Site:** twincityconcreteyardandgarden.com
**Source of truth:** `kurtsshit-clone/` (Netlify-published folder)
**Files touched:** `components/Sections.jsx`, `site.css`, `components/cms-loader.jsx`, `admin.html`, `assets/`

## Problem

1. Product grid cards show one static photo (hover only zooms 1.04). The site
   previously had a hover image swap; we want it back.
2. The detail/click modal gives the photo only a thin 260px banner across the
   top ("top third" of the card); everything else is stacked text below it.
3. Most products have only one photo; the empty/staged pair pattern (seen in
   the pedestal and Foo Dog assets) should apply to every product.

## Goals

- **Card:** show the **empty/bare** shot at rest; crossfade to the **staged
  scene** shot on hover. Empty is always the default.
- **Detail view:** images on the **left** (both empty + staged, stacked,
  large), product info (name, tagline, desc, sizes, specs, actions) on the
  **right**. Photos get ~half the real estate, not a top strip.
- Every product ends up with both an empty and a staged image. Missing staged
  shots are generated in the established style (clean cement subject composited
  into a soft, misty garden/zen scene — matching `foodog staged1.png`).
- Nothing breaks at any intermediate state (single-image or no-image products
  still render).

## Non-goals

- The featured Lit Stone card keeps its own existing two-column layout; the
  hover-swap/detail changes target the **product grid cards + their modal**.
  (Revisit only if requested.)
- No redesign of filters, sale banner, quote flow, or zoom lightbox behavior.

## Data model

Per product (in `CATALOG`, the CMS catalog schema in `cms-loader.jsx`, and the
`admin.html` editor):

| Field       | Meaning                              | Required |
|-------------|--------------------------------------|----------|
| `img`       | Empty / bare studio shot (default)   | optional |
| `imgStaged` | Staged scene shot (hover + detail)   | optional |

**Render rules (graceful degradation):**

- `img` + `imgStaged` → card hover-swaps; detail shows both stacked.
- `img` only → card static (today's behavior); detail shows the one image.
- `imgStaged` only → treat it as the single image (static), same as above.
- neither → "Photo Coming Soon" placeholder (unchanged).

Backward compatible: existing `img` values keep working untouched.

## Component design

### Product card (`.pcard` / `.pcard-img`)

Replace the single background-image div with two stacked background layers
inside a positioned `.pcard-img`:

- Base layer: `img` (empty), `opacity:1`.
- Top layer: `imgStaged` (staged), absolutely positioned, `opacity:0`,
  `transition: opacity .4s`.
- `.pcard:hover` top layer → `opacity:1` (crossfade). Replaces the current
  `transform: scale(1.04)` zoom.
- Existing `pcard-img--gray-tint` / `pcard-img--studio` filter modifiers still
  apply (to both layers).
- No `imgStaged` → render single layer exactly as today.

Approach: keep CSS `background-image` (matches current code and preserves the
tint/studio filters) rather than switching to `<img>` tags — smaller, lower
risk.

### Detail modal (`.pmodal`)

- Widen `.pmodal` from `max-width:680px` to `~960px`.
- `.pmodal` becomes a 2-column grid: **left** image column (~46%), **right**
  scrollable info column. Single `max-height:90vh` scroll on the right.
- Left column: both photos stacked vertically (empty on top, staged below),
  each large; click-to-zoom preserved per image. One image only → show just
  that one. None → existing placeholder.
- Right column: eyebrow/category, name, tagline, desc, sizes block, specs
  block, actions — unchanged content, just relocated.
- Responsive: below ~760px collapse to single column, images first then info
  (mobile not broken).
- `pmodal-img--gray-tint` / `--studio` modifiers preserved.

## Asset plan

Catalog (10 entries). Status and action — **to confirm with Kurt before
generating anything**:

| Product            | Current `img`                | Empty have? | Staged action            |
|--------------------|------------------------------|-------------|--------------------------|
| Lit Stone (feat.)  | photo-9706-lit.jpg           | n/a         | out of scope (own layout)|
| Minneapolis Grand Urn | photo-pedestal-raw.png    | ✅ empty    | confirm vs pedestal-staged / generate |
| Twin Cities Pedestal Urn | photo-pedestal-staged.png | ❌      | needs empty (or reuse raw) — confirm |
| The Boulevard Urn  | photo-boulevard.png          | ❓ confirm  | generate the missing one |
| Cherub Fountain Urn| photo-cherub.png             | ❓ confirm  | generate the missing one |
| The Courtyard Urn  | photo-courtyard.png          | ❓ confirm  | generate the missing one |
| The Terrace Urn    | null                         | ❌ none     | needs both               |
| The Imperial Foo Dog | null                       | ✅ provided | ✅ provided               |
| The Dynasty Lantern| photo-lantern.png            | ❓ confirm  | generate the missing one |
| The Noble Lion     | photo-lion.png               | ❓ confirm  | generate the missing one |

Confirmed user-supplied Foo Dog assets:
- Empty: `D:\Kurt's shit\kurts products\foodog blank 0.png` → copy to
  `assets/photo-foodog-raw.png`
- Staged: `D:\Kurt's shit\foodog staged1.png` → copy to
  `assets/photo-foodog-staged.png`

Generated-shot style reference: `foodog staged1.png` — cement subject, soft
misty garden/zen backdrop, reflective foreground, muted desaturated palette.

**Open item for spec review:** for each ❓ product, Kurt confirms whether the
existing photo is the empty or the staged one, so generation targets the
correct missing half. Asset generation is a separate track from the
code/CSS/CMS changes and can land incrementally thanks to the degradation
rules.

## Risks

- Generated staged shots may not match real product proportions — review each
  before publishing; degradation rules mean an un-generated product just stays
  single-image, no breakage.
- Grand Urn vs Pedestal Urn currently share the pedestal raw/staged photos as
  two separate products — needs Kurt's call on correct mapping.

## Testing

- Each render rule (both / img-only / staged-only / none) renders correctly on
  card and modal.
- Hover crossfade works; touch devices fall back gracefully (no stuck state).
- Modal 2-column on desktop, single-column stacked on mobile; right column
  scrolls, zoom still works per image.
- CMS edit of `img`/`imgStaged` flows through to card and modal.
