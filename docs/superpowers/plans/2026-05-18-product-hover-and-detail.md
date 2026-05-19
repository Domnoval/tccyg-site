# Product Hover Swap + Side-by-Side Detail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Product grid cards show the empty shot at rest and crossfade to a staged scene on hover; the detail modal shows both images on the left with product info on the right.

**Architecture:** Add an optional `imgStaged` field per product. Cards render two stacked CSS background layers that crossfade on hover. The modal becomes a 2-column grid (images left, scrollable info right) that collapses to one column on mobile. All changes degrade gracefully when `imgStaged` (or `img`) is absent. CMS schema + admin editor gain the new field.

**Tech Stack:** Static site, React 18 via in-browser Babel (`text/babel` JSX, no build), plain CSS, Netlify publish of `kurtsshit-clone/`. No test runner exists — verification is behavioral via a local static server + the Playwright MCP browser tools.

---

## Spec

`docs/superpowers/specs/2026-05-18-product-hover-and-detail-design.md`

## File Structure

| File | Responsibility | Change |
|------|----------------|--------|
| `assets/photo-foodog-raw.png`, `assets/photo-foodog-staged.png` | Confirmed Foo Dog image pair | Create (copy) |
| `components/Sections.jsx` | `CATALOG` data, `.pcard` render, `.pmodal` render | Modify |
| `site.css` | `.pcard-img` two-layer crossfade; `.pmodal` 2-column + responsive | Modify |
| `components/cms-loader.jsx` | Default/seed CMS catalog schema | Modify |
| `admin.html` | Catalog editor — `imgStaged` input | Modify |

## Conventions

- **No test runner.** Each task's "test" is a Playwright MCP behavioral check
  against a locally served copy. Start the server once (Task 0) and reuse it.
- Edits show exact before/after. Match existing indentation (2 spaces).
- Commit after each task. Repo: `kurtsshit-clone/` (its own git repo, branch
  `fix-hero-assets`). Use `git -c safe.directory='*'` if a safe.directory
  warning blocks a command.
- `git` identity is already set locally in this repo.

---

### Task 0: Local server + baseline snapshot

**Files:** none (environment setup)

- [ ] **Step 1: Start a static server in the background**

Run (Bash tool, `run_in_background: true`), from `D:/Kurt's shit/kurtsshit-clone`:

```bash
npx --yes serve -l 8080 .
```

Expected: server logs "Accepting connections at http://localhost:8080".
If `npx serve` is unavailable, fall back to: `python -m http.server 8080`.

- [ ] **Step 2: Confirm the products section renders**

Use Playwright MCP:
- `browser_navigate` → `http://localhost:8080/#products`
- `browser_evaluate` with:

```js
() => document.querySelectorAll('.pgrid .pcard').length
```

Expected: a number > 0 (grid cards present). Record it as the baseline count.

- [ ] **Step 3: No commit** (environment only)

---

### Task 1: Add Foo Dog image assets

**Files:**
- Create: `assets/photo-foodog-raw.png` (from `D:\Kurt's shit\kurts products\foodog blank 0.png`)
- Create: `assets/photo-foodog-staged.png` (from `D:\Kurt's shit\foodog staged1.png`)

- [ ] **Step 1: Copy the two confirmed images into assets/**

Run (Bash), from `D:/Kurt's shit/kurtsshit-clone`:

```bash
cp "../kurts products/foodog blank 0.png" assets/photo-foodog-raw.png
cp "../foodog staged1.png" assets/photo-foodog-staged.png
ls -l assets/photo-foodog-raw.png assets/photo-foodog-staged.png
```

Expected: both files listed with non-zero size.

- [ ] **Step 2: Commit**

```bash
git add assets/photo-foodog-raw.png assets/photo-foodog-staged.png
git commit -m "Add confirmed Foo Dog empty + staged image assets"
```

---

### Task 2: Add `imgStaged` to the product data model

**Files:**
- Modify: `components/Sections.jsx` (the `foo-dog` entry in `CATALOG`, ~lines 240-256)

- [ ] **Step 1: Behavioral check — define expected data**

Use Playwright MCP against the running server (`browser_navigate`
`http://localhost:8080/#products`, then `browser_evaluate`):

```js
() => {
  const c = (window.CATALOG_FOR_TEST || []);
  return 'no test hook';
}
```

There is no data hook; instead assert via the rendered Foo Dog card after
Task 3. For THIS task the verification is structural: after editing, run

```bash
node -e "const s=require('fs').readFileSync('components/Sections.jsx','utf8'); const i=s.indexOf(\"id: 'foo-dog'\"); console.log(s.slice(i, i+600).includes('imgStaged') && s.slice(i,i+600).includes('photo-foodog-raw'));"
```

Expected before edit: `false`.

- [ ] **Step 2: Edit the `foo-dog` catalog entry**

In `components/Sections.jsx`, find:

```js
    id: 'foo-dog',
    name: 'The Imperial Foo Dog',
    category: 'Yard Statue',
    img: null,
    price: '$50',
```

Replace the `img: null,` line with:

```js
    img: 'assets/photo-foodog-raw.png',
    imgStaged: 'assets/photo-foodog-staged.png',
```

(Leave all other catalog entries unchanged — they have no staged shot yet and
must degrade to single-image per the spec. `imgStaged` is simply absent on
them.)

- [ ] **Step 3: Re-run the structural check**

```bash
node -e "const s=require('fs').readFileSync('components/Sections.jsx','utf8'); const i=s.indexOf(\"id: 'foo-dog'\"); console.log(s.slice(i, i+600).includes('imgStaged') && s.slice(i,i+600).includes('photo-foodog-raw'));"
```

Expected: `true`.

- [ ] **Step 4: Commit**

```bash
git add components/Sections.jsx
git commit -m "Add imgStaged field; wire confirmed Foo Dog pair"
```

---

### Task 3: Product card two-layer hover crossfade

**Files:**
- Modify: `components/Sections.jsx` — the `.pcard` image render (~lines 388-402)
- Modify: `site.css` — `.pcard-img` rules (~lines 1144-1149) and the studio hover (~line 869)

- [ ] **Step 1: Replace the card image render**

In `components/Sections.jsx`, find this block inside `rest.map(p => ...)`:

```jsx
              {p.img
                ? <div className={
                    'pcard-img'
                    + (p.tintGray ? ' pcard-img--gray-tint' : '')
                    + (p.studioShot ? ' pcard-img--studio' : '')
                  } style={{ backgroundImage: `url(${p.img})` }} />
                : <div className="pcard-img pcard-img--ph">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity=".4">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>Photo Coming Soon</span>
                  </div>
              }
```

Replace it with:

```jsx
              {p.img
                ? <div className={
                    'pcard-img'
                    + (p.tintGray ? ' pcard-img--gray-tint' : '')
                    + (p.studioShot ? ' pcard-img--studio' : '')
                    + (p.imgStaged ? ' pcard-img--has-swap' : '')
                  }>
                    <div className="pcard-img-layer pcard-img-base"
                         style={{ backgroundImage: `url(${p.img})` }} />
                    {p.imgStaged && (
                      <div className="pcard-img-layer pcard-img-staged"
                           style={{ backgroundImage: `url(${p.imgStaged})` }} />
                    )}
                  </div>
                : <div className="pcard-img pcard-img--ph">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity=".4">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>Photo Coming Soon</span>
                  </div>
              }
```

- [ ] **Step 2: Update `.pcard-img` CSS for layered crossfade**

In `site.css`, find:

```css
.pcard-img {
  height: 200px;
  background-size: cover; background-position: center;
  transition: transform .6s var(--ease-out);
}
.pcard:hover .pcard-img { transform: scale(1.04); }
```

Replace with:

```css
.pcard-img {
  height: 200px;
  position: relative;
  overflow: hidden;
}
.pcard-img-layer {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
}
.pcard-img-staged {
  opacity: 0;
  transition: opacity .4s var(--ease-out);
}
.pcard:hover .pcard-img--has-swap .pcard-img-staged { opacity: 1; }
/* Single-image cards keep a subtle zoom so they still feel alive. */
.pcard:hover .pcard-img:not(.pcard-img--has-swap) .pcard-img-base {
  transform: scale(1.04);
  transition: transform .6s var(--ease-out);
}
```

(Note: the `.pcard-img--gray-tint` / `.pcard-img--studio` selectors elsewhere
in `site.css` still apply — they sit on the same `.pcard-img` element and
filter both child layers.)

- [ ] **Step 3: Fix the studio-shot hover rule**

In `site.css`, find:

```css
.pcard:hover .pcard-img--studio { transform: none; filter: brightness(1.04); }
```

Replace with:

```css
.pcard:hover .pcard-img--studio .pcard-img-base { transform: none; }
.pcard:hover .pcard-img--studio { filter: brightness(1.04); }
```

- [ ] **Step 4: Behavioral verification (Playwright MCP)**

- `browser_navigate` → `http://localhost:8080/#products` (hard reload).
- `browser_evaluate`:

```js
() => {
  const cards = [...document.querySelectorAll('.pgrid .pcard')];
  const foo = cards.find(c => /Foo Dog/i.test(c.textContent));
  const staged = foo && foo.querySelector('.pcard-img-staged');
  return {
    found: !!foo,
    hasSwapClass: !!foo.querySelector('.pcard-img--has-swap'),
    stagedOpacityAtRest: staged && getComputedStyle(staged).opacity
  };
}
```

Expected: `{ found: true, hasSwapClass: true, stagedOpacityAtRest: "0" }`.

- `browser_hover` the Foo Dog card, then `browser_evaluate`:

```js
() => {
  const foo = [...document.querySelectorAll('.pgrid .pcard')].find(c => /Foo Dog/i.test(c.textContent));
  const staged = foo.querySelector('.pcard-img-staged');
  return getComputedStyle(staged).opacity;
}
```

Expected: `"1"` (staged layer now visible).

- `browser_evaluate` a single-image card (e.g. Boulevard) still shows base:

```js
() => {
  const b = [...document.querySelectorAll('.pgrid .pcard')].find(c => /Boulevard/i.test(c.textContent));
  return { hasBase: !!b.querySelector('.pcard-img-base'),
           hasStaged: !!b.querySelector('.pcard-img-staged') };
}
```

Expected: `{ hasBase: true, hasStaged: false }` (degrades, no swap layer).

- [ ] **Step 5: Commit**

```bash
git add components/Sections.jsx site.css
git commit -m "Product cards: empty->staged crossfade on hover"
```

---

### Task 4: Detail modal — images left, info right

**Files:**
- Modify: `components/Sections.jsx` — the `{modal && (...)}` block (~lines 421-482)
- Modify: `site.css` — `.pmodal`, `.pmodal-img`, add `.pmodal-media` + responsive

- [ ] **Step 1: Replace the modal image region with a media column**

In `components/Sections.jsx`, find the modal's image conditional:

```jsx
          <div className="pmodal" onClick={e => e.stopPropagation()}>
            {modal.img
              ? <div
                  className={
                    'pmodal-img'
                    + (modal.tintGray ? ' pmodal-img--gray-tint' : '')
                    + (modal.studioShot ? ' pmodal-img--studio' : '')
                  }
                  style={{ backgroundImage: `url(${modal.img})` }}
                  onClick={() => setZoom(modal.img)}
                  role="button"
                  aria-label="Zoom photo"
                >
                  <span className="pmodal-img-zoom-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
                    </svg>
                    Click to zoom
                  </span>
                </div>
              : <div className="pmodal-img pmodal-img--ph">
                  <span>Photo Coming Soon</span>
                </div>
            }
            <div className="pmodal-body">
```

Replace the whole `{modal.img ? ... : ...}` expression (keep the surrounding
`.pmodal` div and the `.pmodal-body` div) with a media column that renders one
zoomable tile per available image:

```jsx
            {(() => {
              const shots = [modal.img, modal.imgStaged].filter(Boolean);
              const cls = (modal.tintGray ? ' pmodal-img--gray-tint' : '')
                        + (modal.studioShot ? ' pmodal-img--studio' : '');
              return shots.length
                ? <div className="pmodal-media">
                    {shots.map((src, i) => (
                      <div
                        key={src}
                        className={'pmodal-img' + cls}
                        style={{ backgroundImage: `url(${src})` }}
                        onClick={() => setZoom(src)}
                        role="button"
                        aria-label="Zoom photo"
                      >
                        <span className="pmodal-img-zoom-hint">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
                          </svg>
                          Click to zoom
                        </span>
                      </div>
                    ))}
                  </div>
                : <div className="pmodal-media">
                    <div className="pmodal-img pmodal-img--ph"><span>Photo Coming Soon</span></div>
                  </div>;
            })()}
            <div className="pmodal-body">
```

(The `.pmodal-body` block and everything after it stays exactly as-is.)

- [ ] **Step 2: Make `.pmodal` a 2-column grid + responsive**

In `site.css`, find:

```css
.pmodal {
  max-width: 680px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  background: var(--bg-elevated);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  box-shadow: 0 40px 120px rgba(0,0,0,.8);
}
.pmodal-img {
  height: 260px;
  background-size: cover; background-position: center;
  border-radius: 12px 12px 0 0;
}
.pmodal-img--ph {
  height: 120px;
  background: rgba(30,35,40,.7);
  border-radius: 12px 12px 0 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--fg-dim);
  font-family: var(--font-heading); font-size: .65rem;
  letter-spacing: .2em; text-transform: uppercase;
}
.pmodal-body { padding: 2rem 2.25rem 2.5rem; }
```

Replace with:

```css
.pmodal {
  max-width: 960px; width: 100%;
  max-height: 90vh; overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  box-shadow: 0 40px 120px rgba(0,0,0,.8);
  display: grid;
  grid-template-columns: 46% 1fr;
}
.pmodal-media {
  max-height: 90vh; overflow-y: auto;
  display: flex; flex-direction: column; gap: 2px;
  background: var(--bg-elevated);
}
.pmodal-img {
  height: 340px; flex: none;
  background-size: cover; background-position: center;
}
.pmodal-media .pmodal-img:first-child { border-radius: 12px 0 0 0; }
.pmodal-img--ph {
  height: 260px;
  background: rgba(30,35,40,.7);
  display: flex; align-items: center; justify-content: center;
  color: var(--fg-dim);
  font-family: var(--font-heading); font-size: .65rem;
  letter-spacing: .2em; text-transform: uppercase;
}
.pmodal-body {
  padding: 2rem 2.25rem 2.5rem;
  max-height: 90vh; overflow-y: auto;
}
@media (max-width: 760px) {
  .pmodal { grid-template-columns: 1fr; max-height: 92vh; overflow-y: auto; }
  .pmodal-media { max-height: none; overflow: visible; }
  .pmodal-body { max-height: none; overflow: visible; }
  .pmodal-media .pmodal-img:first-child { border-radius: 12px 12px 0 0; }
  .pmodal-img { height: 280px; }
}
```

- [ ] **Step 3: Behavioral verification (Playwright MCP)**

- `browser_navigate` → `http://localhost:8080/#products` (hard reload).
- `browser_click` the Foo Dog card (it has two images).
- `browser_evaluate`:

```js
() => {
  const m = document.querySelector('.pmodal');
  const cols = getComputedStyle(m).gridTemplateColumns.split(' ').length;
  return {
    imgCount: document.querySelectorAll('.pmodal-media .pmodal-img').length,
    twoColumns: cols === 2,
    bodyPresent: !!document.querySelector('.pmodal-body')
  };
}
```

Expected: `{ imgCount: 2, twoColumns: true, bodyPresent: true }`.

- Close (press Escape via `browser_press_key` "Escape"), click a single-image
  product (e.g. Boulevard), `browser_evaluate`:

```js
() => document.querySelectorAll('.pmodal-media .pmodal-img').length
```

Expected: `1` (degrades to one image, still 2-column layout).

- `browser_resize` to width 600, `browser_evaluate`:

```js
() => getComputedStyle(document.querySelector('.pmodal')).gridTemplateColumns.split(' ').length
```

Expected: `1` (single column on mobile). Restore size with `browser_resize`.

- Verify zoom still works: `browser_click` the first `.pmodal-img`, then
  `browser_evaluate` `() => !!document.querySelector('.pzoom-img')` → `true`.
  Close with Escape.

- [ ] **Step 4: Commit**

```bash
git add components/Sections.jsx site.css
git commit -m "Detail modal: 2-column, both images left + info right, responsive"
```

---

### Task 5: CMS schema + admin editor field

**Files:**
- Modify: `components/cms-loader.jsx` — seed/default catalog entries gain `imgStaged`
- Modify: `admin.html` — catalog editor exposes an `imgStaged` input

Context (already inspected): `cms-loader.jsx` holds a default catalog as raw
JSON product objects (~lines 120-288); there is **no field whitelist**, so an
added `imgStaged` key flows through untouched. `admin.html` uses a reusable
`ImageField` component; the product editor wires `img` at ~line 760 and the
new-product template at ~line 723.

- [ ] **Step 1: Wire the Foo Dog entry in the cms-loader default catalog**

In `components/cms-loader.jsx`, find the `foo-dog` product object:

```json
      "id": "foo-dog",
      "name": "The Imperial Foo Dog",
      "category": "Yard Statue",
      "img": null,
      "price": "$50",
```

Replace its `"img": null,` line with:

```json
      "img": "assets/photo-foodog-raw.png",
      "imgStaged": "assets/photo-foodog-staged.png",
```

- [ ] **Step 2: Add `"imgStaged"` to the other catalog product objects**

In the same default catalog array (the product entries spanning ~lines
120-288 — NOT the gallery objects near lines 75/84), for every product object
other than `foo-dog`, add a key immediately after its existing `"img": ...`
line:

```json
      "imgStaged": "",
```

Empty string = "no staged shot yet" → render rules treat it as single-image.
Keep JSON valid (the new line ends with a comma; `"img"` already has its
comma). Verify with:

```bash
node -e "JSON.parse(require('fs').readFileSync('components/cms-loader.jsx','utf8').match(/\[[\s\S]*\]/)[0]); console.log('catalog JSON OK')" 2>/dev/null || echo "manual check: ensure the edited region is valid JSON"
```

(If the catalog isn't a standalone JSON literal, instead just re-load the site
in Step 5 — a JSON syntax error there surfaces as a console error / no cards.)

- [ ] **Step 3: Add an `imgStaged` ImageField to the admin product editor**

In `admin.html`, find the new-product template (~line 723):

```js
    tagline: '', desc: '', img: null, specs: []
```

Change it to:

```js
    tagline: '', desc: '', img: null, imgStaged: null, specs: []
```

Then find the product editor's image control (~line 760):

```jsx
          <ImageField label="Product photo" value={p.img} onChange={v => updateItem(i, { ...p, img: v })}
```

Immediately after that `<ImageField ... />` element (after its closing `/>`),
add a sibling:

```jsx
          <ImageField label="Staged photo (hover/detail)" value={p.imgStaged} onChange={v => updateItem(i, { ...p, imgStaged: v })} help="Shown on card hover and beside the empty shot in the detail view. Leave blank if none yet." />
```

- [ ] **Step 4: Verify the admin page loads and shows the new field**

- `browser_navigate` → `http://localhost:8080/admin.html`
- Navigate the admin UI to a product's editor (open the catalog/products
  section so a product's `ImageField`s render).
- `browser_evaluate`:

```js
() => document.body.innerText.includes('Staged photo (hover/detail)')
```

Expected: `true` (the new staged-photo field renders in the product editor).
- Confirm no console errors: `browser_console_messages` shows 0 errors.

- [ ] **Step 5: Verify CMS-driven catalog still renders the site**

- `browser_navigate` → `http://localhost:8080/#products`
- `browser_evaluate` `() => document.querySelectorAll('.pgrid .pcard').length`
  Expected: same baseline count from Task 0 (CMS path didn't break rendering).

- [ ] **Step 6: Commit**

```bash
git add components/cms-loader.jsx admin.html
git commit -m "CMS + admin: imgStaged field for product staged shots"
```

---

### Task 6: Full degradation sweep + final verification

**Files:** none (verification only)

- [ ] **Step 1: Exercise every render rule via Playwright MCP**

`browser_navigate` → `http://localhost:8080/#products` (hard reload), then
`browser_evaluate`:

```js
() => {
  const cards = [...document.querySelectorAll('.pgrid .pcard')];
  return cards.map(c => {
    const name = (c.querySelector('.pcard-name')||{}).textContent || '';
    return {
      name: name.trim(),
      base: !!c.querySelector('.pcard-img-base'),
      staged: !!c.querySelector('.pcard-img-staged'),
      placeholder: !!c.querySelector('.pcard-img--ph')
    };
  });
}
```

Expected: Foo Dog has `base:true, staged:true`. Every other card has either
`base:true, staged:false` (single image) or `placeholder:true` (no image).
No card has `staged:true` without `base:true`. No console errors
(`browser_console_messages`).

- [ ] **Step 2: Confirm spec acceptance criteria**

Manually confirm against the spec's Testing section:
- card hover crossfade (Foo Dog) ✔ from Task 3
- modal 2-col desktop / 1-col mobile, right column scrolls, per-image zoom ✔
  from Task 4
- single-image and no-image products render on both card and modal ✔ Step 1
- CMS edit path intact ✔ Task 5

- [ ] **Step 3: Stop the background server**

Stop the Task 0 background server (kill the background Bash job).

- [ ] **Step 4: Final commit (if any uncommitted verification artifacts)**

```bash
git status --short
# if .playwright-mcp/ or screenshots are untracked, leave them (not part of the feature)
git log --oneline -7
```

Expected: the 5 feature commits (Tasks 1-5) present on `fix-hero-assets`.

---

## Notes / Deferred

- **Per-product empty-vs-staged mapping + generating missing staged shots**
  (Boulevard, Cherub, Courtyard, Lantern, Noble Lion, Grand/Pedestal) is
  intentionally deferred per the user. Once Kurt confirms which existing photo
  is the empty one per product, each gets: copy/keep empty as `img`, generate
  staged in the `foodog staged1.png` style, set `imgStaged`, set CMS
  `imgStaged`. No code changes needed — only data + assets.
- The featured Lit Stone card keeps its own layout (out of scope per spec).
