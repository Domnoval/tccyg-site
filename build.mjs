// Builds the public site into dist/ from content/content.json.
//
//   node build.mjs
//
// Why a build step: the six pages are plain HTML with the copy already in
// them, so they load fast and search engines read them without running any
// script. Kurt's editor at /admin still commits to content/content.json;
// Vercel runs this file on every commit and the pages pick up his changes.
//
// Page wording that has no field in the editor yet lives in this file.

import { readFile, writeFile, mkdir, rm, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist');
const ORIGIN = 'https://twincityconcreteyardandgarden.com';
const GTM = 'GTM-T9L7DRPP';
const GA4 = 'G-69KXJ3DNHB';
const HERO_IMG = 'assets/photo-9706-lit-hero.jpg';

const c = JSON.parse(await readFile(path.join(ROOT, 'content/content.json'), 'utf8'));

// ── helpers ───────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (s) => String(s ?? '').replace(/\s+—\s+(\S)/g, (_, ch) => '. ' + ch.toUpperCase()).replace(/\s+/g, ' ').trim();
const sentence = (s) => { const t = clean(s); return t && !/[.!?]$/.test(t) ? t + '.' : t; };

const ROUTES = {
  home: '/', lit: '/lit-stones', catalog: '/planters-statuary',
  about: '/about', start: '/start', thanks: '/thank-you',
};
const phone = c.contact.phone;
const tel = c.contact.phoneHref || 'tel:' + phone.replace(/\D/g, '');
const hours = c.contact.hours;
const brandTop = c.brand.wordmarkTop;
const brandBot = c.brand.wordmarkBot;
const siteName = c.meta.siteName;

const litStone = c.catalog.find((p) => p.category === 'Lit Stone') || c.catalog.find((p) => p.featured);
const pieces = c.catalog.filter((p) => p !== litStone);
const moneyOf = (s) => (String(s).match(/\$[\d,]+/) || [''])[0];
const nums = pieces.map((p) => parseInt(moneyOf(p.price).replace(/[$,]/g, ''), 10)).filter(Boolean);
const priceSpan = nums.length ? `$${Math.min(...nums)} to $${Math.max(...nums)}` : '';
const litFrom = moneyOf(litStone?.price) || '';

// ── images: every photo is resized to WebP at build time ───────────────────
const images = new Map();
async function prep(src) {
  if (!src || images.has(src)) return;
  const file = path.join(ROOT, src);
  if (!existsSync(file)) { images.set(src, null); return; }
  const input = sharp(file, { failOn: 'none' }).rotate();
  const meta = await input.metadata();
  const flip = (meta.orientation || 1) >= 5;
  const w0 = flip ? meta.height : meta.width;
  const h0 = flip ? meta.width : meta.height;
  const id = createHash('sha1').update(src).digest('hex').slice(0, 10);
  const widths = [640, 1280].filter((w, i) => i === 0 || w0 > 640);
  const out = [];
  for (const w of widths) {
    const tw = Math.min(w, w0);
    const name = `img/${id}-${tw}.webp`;
    await sharp(file, { failOn: 'none' }).rotate().resize({ width: tw }).webp({ quality: 78 }).toFile(path.join(OUT, name));
    out.push({ w: tw, url: '/' + name });
  }
  images.set(src, { w: w0, h: h0, out });
}
function img(src, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const m = images.get(src);
  if (!m) return '';
  const big = m.out[m.out.length - 1];
  const set = m.out.map((o) => `${o.url} ${o.w}w`).join(', ');
  return `<img src="${big.url}" srcset="${set}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''}${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}

// ── shared chrome ─────────────────────────────────────────────────────────
function head({ title, desc, route, noindex = false, ld = '' }) {
  const url = ORIGIN + route;
  return `<!doctype html>
<html lang="en">
<head>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4}');</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${url}">`}
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;600&family=JetBrains+Mono:wght@500&display=swap">
<link rel="stylesheet" href="/site.css?v=${STAMP}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${ld}</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<a class="skip" href="#main">Skip to content</a>
`;
}

function header(current) {
  const link = (key, label) => `<a href="${ROUTES[key]}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="site-header night">
<a class="brand" href="/">${esc(brandTop)} <span>/</span> ${esc(brandBot)}</a>
<nav class="site-nav" aria-label="Main">
${link('lit', 'Lit Stones')}
${link('catalog', 'Planters &amp; Statuary')}
${link('about', 'Process')}
<a class="tel" href="${tel}">${esc(phone)}</a>
</nav>
</header>
`;
}

function footer() {
  return `<footer class="site-footer night">
<div class="wrap">
<div>${esc(c.footer.copyright)}<br><a href="${tel}">${esc(phone)}</a> · ${esc(hours)}</div>
<nav aria-label="Footer">
<a href="${ROUTES.lit}">Lit Stones</a>
<a href="${ROUTES.catalog}">Planters &amp; Statuary</a>
<a href="${ROUTES.about}">About &amp; Process</a>
<a href="${ROUTES.start}">Start Your Project</a>
</nav>
</div>
</footer>
<script src="/site.js?v=${STAMP}" defer></script>
</body>
</html>
`;
}

function closing(headline, body) {
  return `<section class="close night">
<div class="wrap">
<div class="display d-xxl" style="font-size:clamp(60px,9vw,136px)">${headline}</div>
<div class="side">
<p>${body}</p>
<a class="btn btn-amber" href="${ROUTES.start}">Start your project</a>
<a class="textlink amber" href="${tel}">or call ${esc(phone)} · ${esc(hours)}</a>
</div>
</div>
</section>
`;
}

const steps = c.process.steps || [];
function stepList(short) {
  return `<ol class="steps">
${steps.map((s) => `<li><b>${esc(s.n)}</b><h3>${esc(s.t)}</h3><p>${esc(short ? clean(s.d).split('. ')[0].replace(/\.$/, '') + '.' : clean(s.d))}</p></li>`).join('\n')}
</ol>`;
}

const work = (c.gallery.items || []).filter((g) => g.img && !g.placeholder && !g.comingSoon);
const capOf = (g) => [g.title || g.tag, g.loc].filter(Boolean).join(' · ');
const altOf = (g) => clean(g.desc) || capOf(g) || 'A finished lit address stone';

// ── pages ─────────────────────────────────────────────────────────────────
function pageHome() {
  const ld = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': ORIGIN + '/#business',
    name: siteName, url: ORIGIN + '/', telephone: '+1-' + phone,
    description: 'Hand-cast concrete address rocks with warm LED lighting, urns, planters, lanterns and yard statuary, made in Minneapolis, Minnesota.',
    image: ORIGIN + '/assets/og-image.jpg', logo: ORIGIN + '/assets/logo-icon.png',
    priceRange: nums.length ? `$${Math.min(...nums)}-$1200` : '$$', slogan: 'Be Seen. Be Found. Be Lit.',
    address: { '@type': 'PostalAddress', addressLocality: 'Minneapolis', addressRegion: 'MN', addressCountry: 'US' },
    areaServed: [{ '@type': 'City', name: 'Minneapolis' }, { '@type': 'City', name: 'Saint Paul' }],
  })}</script>\n`;
  const first = work[0];
  return head({
    title: `${siteName} | Lit Address Stones, Minneapolis`,
    desc: 'Hand-cast concrete address stones with warm backlit lettering, plus urns, planters, lanterns and statuary. Made in Minneapolis. Free quotes.',
    route: ROUTES.home, ld,
  }) + header('home') + `<main id="main">
<section class="hero night">
<div class="hero-copy">
<div class="eyebrow">Hand-cast in Minneapolis</div>
<h1 class="display d-xl">By day,<br>a stone.<br><span class="lit">By night,<br>your address.</span></h1>
<p class="lede">A concrete landscape rock with your house number mounted on the face and lit from behind. Built for Minnesota winters. Meant to outlast the mailbox.</p>
<div class="cta-row">
<a class="btn btn-amber" href="${ROUTES.start}">Get a free quote</a>
<a class="textlink" href="${ROUTES.lit}">See sizes and prices</a>
</div>
</div>
<div class="hero-media">
<div class="hero-photo" data-sun-photo>
${img(HERO_IMG, 'A concrete address stone with its house number glowing amber from behind', { sizes: '(min-width: 900px) 56vw, 100vw', eager: true })}
<div class="hero-tag">${esc(first ? capOf(first) : 'Lit Stone')} · <span data-sun-clock>9:50 pm</span></div>
</div>
<div class="sun">
<label for="sun">Drag the sun down</label>
<span>Noon</span>
<input id="sun" type="range" min="0" max="100" value="82">
<span>Midnight</span>
</div>
</div>
</section>

<section class="figures">
<div class="wrap">
<div class="figure"><b>${esc(litFrom)}</b><span>where a Lit Stone starts</span></div>
<div class="figure"><b>4–6</b><span>weeks from first visit to lit</span></div>
<div class="figure"><b>24</b><span>hours until Kurt replies</span></div>
</div>
</section>

<section class="wrap section">
<div class="eyebrow" style="padding-bottom:20px">What comes out of the yard</div>
<div class="index">
<a href="${ROUTES.lit}"><span class="n">01</span><span class="t display d-lg">Lit Stones</span><span class="d">Your address, name or message, lit from within. Three sizes, from ${esc(litFrom)}.</span>${img(first?.img || HERO_IMG, '', { sizes: '150px' })}</a>
<a href="${ROUTES.catalog}"><span class="n">02</span><span class="t display d-lg">Planters &amp; Statuary</span><span class="d">Urns, lanterns, lions and foo dogs. Cast to order, ${esc(priceSpan)}.</span>${img(pieces.find((p) => p.photo)?.photo, '', { sizes: '150px' })}</a>
<a href="${ROUTES.about}"><span class="n">03</span><span class="t display d-lg">How Kurt works</span><span class="d">Four steps: visit, spec, cast, install. Local and privately owned.</span>${img(c.about.img, '', { sizes: '150px' })}</a>
</div>
</section>

<section class="wrap" style="padding-bottom:80px">
<div class="stack">
<h2 class="display d-lg">Already in the ground.</h2>
<div class="work">
${work.map((g, i) => `<figure>${img(g.img, altOf(g), { sizes: i === 0 ? '(min-width: 900px) 55vw, 100vw' : '(min-width: 900px) 36vw, 100vw' })}<figcaption class="cap">${esc(capOf(g))}</figcaption></figure>`).join('\n')}
</div>
</div>
</section>
</main>
` + closing('Be seen.<br>Be found.<br><span class="lit">Be lit.</span>', 'The quote is free and there is no obligation. Tell Kurt about the spot and he replies within 24 hours.') + footer();
}

function pageLit() {
  const spec = Object.fromEntries((litStone.specs || []).map((s) => [s.k.trim(), s.v]));
  const blurbs = { Small: 'Fits a front bed or the foot of a walkway.', Medium: 'The one most front yards call for.', Large: 'A landmark for a long driveway or a corner lot.' };
  const feet = (dims, word) => {
    const m = String(dims).match(new RegExp('([\\d.]+)\\s*(ft|in)\\s*' + word));
    return m ? (m[2] === 'in' ? parseFloat(m[1]) / 12 : parseFloat(m[1])) : 0;
  };
  const sizes = (litStone.sizes || []).map((s) => ({
    label: s.label, price: s.price, dims: s.dims, blurb: blurbs[s.label] || '',
    w: Math.round(feet(s.dims, 'wide') * 28) || 140, h: Math.round(feet(s.dims, 'tall') * 28) || 60,
  }));
  const start = Math.min(1, sizes.length - 1);
  const s0 = sizes[start];
  const faqs = [
    ['Do I need an electrician?', `No. Kurt wires the stone to a low-voltage transformer himself, and a photocell is included, so it comes on at dusk and off at dawn without you touching it.${spec.Lighting ? ` Lighting is ${spec.Lighting.toLowerCase()}.` : ''}`],
    ['Will it survive a Minnesota winter?', `That is what it is built for. ${spec.Material ? spec.Material + ', cured' : 'The concrete cures'} a full 30 days before it is painted, stained and sealed.${spec.Lettering ? ` Lettering is ${spec.Lettering.toLowerCase()}.` : ''}`],
    ['How long until it is in my yard?', clean(c.process.subtitle).replace(/; /g, '. ').replace(/\. y/, '. Y')],
    ['Do you come out to me?', 'Yes. ' + clean(c.contact.asideBody)],
    ['How does payment work?', 'The quote is free. ' + clean(c.process.noteBody).replace(/^50% down to reserve/, '50% down reserves')],
  ];
  return head({
    title: `Lit Address Stones from ${litFrom} | ${siteName}`,
    desc: `Hand-cast concrete address stones with your house number lit from behind. Three sizes from ${litFrom}, installed in the Twin Cities in four to six weeks. Free quote.`,
    route: ROUTES.lit,
  }) + header('lit') + `<main id="main">
<section class="hero night">
<div class="hero-copy">
<div class="eyebrow">The Lit Stone · from ${esc(litFrom)}</div>
<h1 class="display d-xl">Nobody<br>drives past<br><span class="lit">this.</span></h1>
<p class="lede">A hand-cast concrete stone with your address, name or message on the face, lit from behind in warm amber. Readable from the curb at every hour after sunset.</p>
<div class="cta-row">
<a class="btn btn-amber" href="${ROUTES.start}?kind=Lit%20Stone">Get a free quote</a>
<a class="textlink" href="${tel}">or call ${esc(phone)}</a>
</div>
</div>
<div class="hero-media">
<div class="hero-photo" style="--bright:0.72;--night-a:0.9;--glow:0.2">
${img(HERO_IMG, 'An address stone with its house number backlit in amber', { sizes: '(min-width: 900px) 56vw, 100vw', eager: true })}
</div>
</div>
</section>

<section class="night-2" data-sizer='${esc(JSON.stringify(sizes))}'>
<div class="wrap sizer">
<div class="sizer-copy">
<div class="eyebrow sage">Size it against your front door</div>
<h2 class="display d-lg">How big is <span data-size-name>${esc(s0.label.toLowerCase())}</span>?</h2>
<div class="pills" role="group" aria-label="Choose a size">
${sizes.map((s, i) => `<button class="pill" type="button" data-size aria-pressed="${i === start}">${esc(s.label)}</button>`).join('\n')}
</div>
<div class="price-row"><div class="price-big" data-size-price>${esc(s0.price)}</div><span data-size-dims>${esc(s0.dims)}</span></div>
<p class="lede"><span data-size-blurb>${esc(s0.blurb)}</span> Dimensions are approximate, since every stone is cast one at a time. Not sure? Kurt sizes it to your yard at the first visit.</p>
</div>
<div class="scale">
<div class="scale-stage" role="img" data-size-stage aria-label="A ${esc(s0.label.toLowerCase())} stone, ${esc(s0.dims)}, drawn to scale beside a standard front door">
<div class="door"><i></i></div>
<div class="stone" data-stone style="width:${s0.w}px;height:${s0.h}px;font-size:${Math.round(s0.h * 0.5)}px">137</div>
</div>
<div class="scale-labels" aria-hidden="true"><span>Front door</span><span><span data-size-name>${esc(s0.label.toLowerCase())}</span> stone</span></div>
</div>
</div>
</section>

<section class="wrap section" style="padding-bottom:40px">
<h2 class="display d-lg" style="margin-bottom:28px">Cast, lit, set and wired.</h2>
<div class="rows">
<div><h3>Your wording</h3><p>Address, family name or a short phrase. Kurt confirms it with you before anything is cast.</p></div>
<div><h3>Your choices</h3><p>Numerals, font, LED color and scene.</p></div>
<div><h3>A full install</h3><p>Dug, leveled, set and wired to a low-voltage transformer. Photocell included, landscape restored.</p></div>
<div><h3>Built for winter</h3><p>Concrete cures a full 30 days before it is painted, stained and sealed.</p></div>
</div>
</section>

<section class="wrap section-tight">
<div class="stack">
<div class="eyebrow">Four steps · four to six weeks</div>
${stepList(true)}
<a class="textlink" href="${ROUTES.about}">More about Kurt and the process</a>
</div>
</section>

${work.length ? `<section class="wrap section-tight">
<div class="stack">
<h2 class="display d-lg">Already in the ground.</h2>
<div class="work">
${work.map((g, i) => `<figure>${img(g.img, altOf(g), { sizes: i === 0 ? '(min-width: 900px) 55vw, 100vw' : '(min-width: 900px) 36vw, 100vw' })}<figcaption class="cap">${esc(capOf(g))}</figcaption></figure>`).join('\n')}
</div>
</div>
</section>` : ''}

<section class="wrap section faq">
<h2 class="display d-lg">Before<br>you ask.</h2>
<div class="faq-list">
${faqs.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
</div>
</section>
</main>
` + closing('Ready to<br><span class="lit">be found?</span>', 'Tell Kurt about the spot. A photo of your front yard helps. He replies within 24 hours.') + footer();
}

function pageCatalog() {
  const label = { 'Planter Urn': 'Planters & Urns', 'Yard Statue': 'Statuary' };
  const cats = [...new Set(pieces.map((p) => p.category))];
  return head({
    title: `Concrete Planters, Urns & Garden Statuary | ${siteName}`,
    desc: `Hand-cast concrete urns, planters, lanterns, lions and foo dogs, made to order in Minneapolis. ${priceSpan}.`,
    route: ROUTES.catalog,
  }) + header('catalog') + `<main id="main">
<section class="wrap catalog-head">
<div class="eyebrow">Catalog · cast to order · ${esc(priceSpan)}</div>
<h1 class="display d-xl">Planters<br>&amp; Statuary.</h1>
<p class="lede">Urns, planters, lanterns and guardians, handcrafted in Minneapolis. Every piece is built when you order it, so no two are exactly alike.</p>
<p class="muted" style="font-size:16px;max-width:620px">Prices are per piece. Dimensions are approximate. Ask Kurt about pickup and delivery when you get in touch.</p>
<div class="pills" role="group" aria-label="Filter by category">
<button class="pill" type="button" data-filter="all" aria-pressed="true">Everything</button>
${cats.map((k) => `<button class="pill" type="button" data-filter="${esc(k)}" aria-pressed="false">${esc(label[k] || k)}</button>`).join('\n')}
</div>
</section>

<section class="wrap grid">
${pieces.map((p) => {
    const specs = (p.specs || []).filter((s) => s.k && s.v);
    const more = clean(p.desc) || specs.length;
    return `<article class="piece" data-cat="${esc(p.category)}" id="${esc(p.id)}">
${p.photo ? img(p.photo, `${p.name}, hand-cast concrete`, { sizes: '(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw' }) : '<div class="nophoto">Photo coming soon</div>'}
<div class="piece-head"><div><div class="eyebrow">${esc(p.category)}</div><h2>${esc(p.name)}</h2></div><div class="piece-price">${esc(p.price)}</div></div>
<p>${esc(sentence(p.tagline))}</p>
${more ? `<details><summary>Details and dimensions</summary>${clean(p.desc) ? `<p>${esc(clean(p.desc))}</p>` : ''}${specs.length ? `<table class="specs">${specs.map((s) => `<tr><th scope="row">${esc(s.k.trim())}</th><td>${esc(s.v)}</td></tr>`).join('')}</table>` : ''}</details>` : ''}
<a class="textlink" style="font-size:16px;padding:10px 0" href="${ROUTES.start}?about=${encodeURIComponent(p.name)}&amp;kind=${encodeURIComponent(p.category === 'Yard Statue' ? 'Statuary' : 'Concrete Planters')}">Ask about this piece</a>
</article>`;
  }).join('\n')}
</section>

<section class="close night">
<div class="wrap">
<div class="display" style="font-size:clamp(52px,7.5vw,112px);line-height:0.86">Want your address<br><span class="lit">on a stone?</span></div>
<div class="side">
<p>The Lit Stone has its own page, with sizes you can see to scale.</p>
<a class="btn btn-amber" href="${ROUTES.lit}">See the Lit Stones</a>
</div>
</div>
</section>
</main>
` + footer();
}

function pageAbout() {
  const paras = (c.about.paragraphs || []).map((p) => String(p).trim()).filter(Boolean);
  const kick = (c.hero.kickers || []).map((k) => `${k.num} ${k.lbl}`).join(' · ');
  return head({
    title: `About Kurt & How It Works | ${siteName}`,
    desc: 'A local, privately owned Minneapolis shop. Four steps from the first yard visit to a wired, lit stone, in four to six weeks.',
    route: ROUTES.about,
  }) + header('about') + `<main id="main">
<section class="wrap about-hero">
<div class="copy">
<div class="eyebrow">${esc(kick)}</div>
<h1 class="display d-xl">Concrete,<br>cast by<br>hand.</h1>
${paras.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<div class="sig"><b>${esc(c.about.sigName)}</b><span class="cap">${esc(c.about.sigRole)}</span></div>
</div>
${img(c.about.img, 'A finished stone planted in a Twin Cities front yard', { sizes: '(min-width: 900px) 42vw, 100vw', eager: true })}
</section>

<section class="night">
<div class="wrap section stack-lg">
<div class="process-head">
<h2 class="display d-md">Four steps.<br><span class="lit" style="text-shadow:none">Four to six weeks.</span></h2>
<p>${esc(clean(c.process.subtitle).replace(/; /g, '. ').replace(/\. y/, '. Y'))}</p>
</div>
${stepList(false)}
</div>
</section>

<section class="wrap section">
<div class="rows">
<div><h3>Booking</h3><p>The quote is free. ${esc(clean(c.process.noteBody).replace(/^50% down to reserve/, '50% down reserves'))}</p></div>
<div><h3>Service area</h3><p>${esc(clean(c.contact.asideBody))}</p></div>
<div><h3>Hours</h3><p>${esc(hours)}. Kurt answers his own phone at <a href="${tel}"><strong>${esc(phone)}</strong></a> and replies to requests within 24 hours.</p></div>
</div>
<a class="btn btn-ink" style="margin-top:36px" href="${ROUTES.start}">Start your project</a>
</section>
</main>
` + footer();
}

function pageStart() {
  const kinds = ['Lit Stone', 'Illuminated Family Stone', 'Illuminated Monolith', 'Concrete Planters', 'Statuary', 'Something Else'];
  return head({
    title: `Start Your Project: Free Quote | ${siteName}`,
    desc: 'Tell Kurt about the spot and get a free quote. Only your name and phone number are required. He replies within 24 hours.',
    route: ROUTES.start,
  }) + header('start') + `<main id="main">
<section class="wrap start">
<div class="start-main">
<div class="stack" style="gap:18px">
<div class="eyebrow">Free quote · one minute · no commitment</div>
<h1 class="display d-xl">Start your<br>project.</h1>
<p class="lede">Only your name and phone number are required. Kurt reads every request himself and replies within 24 hours.</p>
</div>
<form class="form" id="quote-form" action="https://formspree.io/f/${esc(c.contact.formspreeId)}" method="post" enctype="multipart/form-data" data-thanks="${ROUTES.thanks}" data-phone="${esc(c.contact.errorPhone || phone)}">
<div class="form-row">
<div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
<div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required></div>
</div>
<div class="field"><label for="f-type">What you are looking for</label><select id="f-type" name="type">${kinds.map((k) => `<option>${esc(k)}</option>`).join('')}</select></div>
<div class="form-row">
<div class="field"><label for="f-email">Email <small>(optional)</small></label><input id="f-email" name="email" type="email" autocomplete="email"></div>
<div class="field"><label for="f-address">Address or city <small>(optional)</small></label><input id="f-address" name="address" type="text" autocomplete="street-address"></div>
</div>
<div class="field"><label for="f-stone">Message on the stone <small>(optional)</small></label><input id="f-stone" name="stoneMessage" type="text" aria-describedby="f-stone-help"><div class="help" id="f-stone-help">Name, address or a short phrase. The exact wording gets confirmed before casting.</div></div>
<div class="field"><label for="f-message">Tell us about the spot <small>(optional)</small></label><textarea id="f-message" name="message" rows="4"></textarea></div>
<div class="field drop"><label for="f-photo">Photo of the spot <small>(optional)</small></label><input id="f-photo" name="photo" type="file" accept="image/*" aria-describedby="f-photo-help"><div class="help" id="f-photo-help">A picture of your front yard saves a lot of back and forth. JPG, PNG or HEIC, up to 8MB.</div></div>
<div class="cta-row"><button class="btn btn-ink btn-lg" type="submit">Send request</button><div class="form-status" id="form-status" role="status" aria-live="polite"></div></div>
</form>
</div>
<aside class="aside night">
<div class="stack" style="gap:8px">
<div class="eyebrow sage">Rather talk?</div>
<a class="tel-big" href="${tel}">${esc(phone)}</a>
<p>Kurt answers his own phone. Leave a message if he is out in the yard. ${esc(hours)}.</p>
</div>
<div class="next">
<div class="eyebrow sage">What happens next</div>
<ol class="stack" style="gap:18px">
<li><b>01</b><span><strong>Kurt replies</strong> within 24 hours.</span></li>
<li><b>02</b><span><strong>A yard visit.</strong> He measures, looks at the light and sketches on site.</span></li>
<li><b>03</b><span><strong>A firm quote.</strong> 50% down reserves your spot. Balance on install day.</span></li>
</ol>
</div>
<div class="mono">Serving the seven-county Twin Cities metro</div>
</aside>
</section>
</main>
` + footer();
}

function pageThanks() {
  return head({
    title: `Thank You | ${siteName}`,
    desc: 'Your request reached the shop. Kurt replies within 24 hours.',
    route: ROUTES.thanks, noindex: true,
  }) + `<div class="night">` + header('thanks') + `<main id="main">
<section class="wrap ty-hero">
<div class="eyebrow sage">Request received</div>
<h1 class="display d-xxl">Thank you.<br><span class="lit">Kurt has it.</span></h1>
<p class="lede">Your request went straight to the shop. Nothing is charged and nothing is booked yet. If you did not attach a photo of the spot, have one handy for when he calls.</p>
</section>
<section class="wrap" style="padding-bottom:72px">
<ol class="steps">
<li><b>01</b><h3>Kurt reaches out</h3><p>By phone or email, within 24 hours.</p></li>
<li><b>02</b><h3>A visit to your yard</h3><p>He measures, looks at the light and grade, and sketches on site.</p></li>
<li><b>03</b><h3>A firm quote</h3><p>50% down reserves your spot in the queue. Balance due on install day.</p></li>
</ol>
</section>
<section class="ty-foot day">
<div class="wrap">
<div><div style="font-size:17px;font-weight:600">Need him sooner? ${esc(hours)}.</div><a class="tel-big" href="${tel}">${esc(phone)}</a></div>
<div class="cta-row"><a class="btn btn-line" href="${ROUTES.catalog}">Browse planters</a><a class="btn btn-ink" href="/">Back to home</a></div>
</div>
</section>
</main>
</div>
` + footer();
}

// ── build ─────────────────────────────────────────────────────────────────
const STAMP = Date.now().toString(36);
await rm(OUT, { recursive: true, force: true });
await mkdir(path.join(OUT, 'img'), { recursive: true });

const wanted = new Set([HERO_IMG, c.about.img, ...work.map((g) => g.img), ...pieces.flatMap((p) => [p.img, p.imgStaged])].filter(Boolean));
await Promise.all([...wanted].map(prep));
// A piece shows its main photo, unless that is a small cutout and a staged shot exists.
for (const p of pieces) {
  const main = images.get(p.img);
  const staged = images.get(p.imgStaged);
  p.photo = staged && (!main || main.w < 600) ? p.imgStaged : (main ? p.img : null);
}

const pages = {
  'index.html': pageHome(), 'lit-stones.html': pageLit(), 'planters-statuary.html': pageCatalog(),
  'about.html': pageAbout(), 'start.html': pageStart(), 'thank-you.html': pageThanks(),
};
for (const [name, html] of Object.entries(pages)) await writeFile(path.join(OUT, name), html);

await cp(path.join(ROOT, 'src/site.css'), path.join(OUT, 'site.css'));
await cp(path.join(ROOT, 'src/site.js'), path.join(OUT, 'site.js'));
// The editor, its content file and the original photos keep their public paths.
for (const dir of ['admin', 'content']) await cp(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
await mkdir(path.join(OUT, 'assets'), { recursive: true });
await cp(path.join(ROOT, 'assets/cms'), path.join(OUT, 'assets/cms'), { recursive: true });
for (const f of ['favicon.png', 'apple-touch-icon.png', 'og-image.jpg', 'logo-icon.png']) {
  if (existsSync(path.join(ROOT, 'assets', f))) await cp(path.join(ROOT, 'assets', f), path.join(OUT, 'assets', f));
}

const today = new Date().toISOString().slice(0, 10);
const listed = [ROUTES.home, ROUTES.lit, ROUTES.catalog, ROUTES.about, ROUTES.start];
await writeFile(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((r) => `<url><loc>${ORIGIN}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /thank-you\nSitemap: ${ORIGIN}/sitemap.xml\n`);

let bytes = 0;
for (const m of images.values()) if (m) for (const o of m.out) bytes += (await stat(path.join(OUT, o.url))).size;
console.log(`Built ${Object.keys(pages).length} pages, ${[...images.values()].filter(Boolean).length} photos (${Math.round(bytes / 1024)} KB) into dist/`);
