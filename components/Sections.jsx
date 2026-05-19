// Sections.jsx — Gallery, Products, Process, About
//
// Patched: all data now comes from useSiteContent() (defined in
// cms-loader.jsx). Hardcoded arrays kept as fallbacks for safety.

function Gallery({ onOpen }) {
  const g = useGallery();
  const items = (g.items && g.items.length) ? g.items : [
    { id: 'g1', title: 'The 9706 Stone', tag: 'Lit Stone', loc: 'Plymouth, MN',
      img: 'assets/photo-9706-lit.jpg', big: true,
      desc: 'Granite boulder with raised black lettering and warm amber LED backwash. The numerals lift off the stone and the light spills out from behind — visible from the curb at every hour after sunset.' },
    { id: 'g2', title: 'The Novak Stone', tag: 'Lit Stone', loc: 'Maple Grove, MN',
      img: 'assets/kurt-novaks-rock.jpeg',
      desc: 'Slate-finish concrete cast with raised metal lettering. Planted at the base of a legacy red maple as a centerpiece to the entryway garden.' },
    { id: 'g3', title: 'Recent Install', tag: 'More Coming', loc: 'Twin Cities Metro',
      placeholder: true, comingSoon: true,
      desc: 'Photos from a recent install — coming soon.' },
    { id: 'g4', title: 'Recent Install', tag: 'More Coming', loc: 'Twin Cities Metro',
      placeholder: true, comingSoon: true,
      desc: 'Photos from a recent install — coming soon.' },
  ];
  const eyebrow  = g.eyebrow  || 'Portfolio';
  const title    = g.title    || 'Recent Work';
  const subtitle = g.subtitle || 'A slice of what\u2019s been planted in Twin Cities front yards. Each piece is one of one \u2014 no two rocks come out of the yard the same.';
  return (
    <section className="section" id="gallery">
      <div className="section-head">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="gallery">
        {items.map((it) => (
          <div key={it.id} className={'tile ' + (it.big ? 'big ' : '') + (it.placeholder ? 'is-placeholder' : '')} onClick={() => onOpen(it)}>
            {it.img && <div className="tile-img" style={{ backgroundImage: `url(${it.img})` }} />}
            <div className="tile-gradient" />
            {it.placeholder && (
              <div className="tile-coming-soon">
                <span className="tile-coming-soon-dot" />
                Photo Coming Soon
              </div>
            )}
            <div className="tile-meta">
              <span className="tile-tag">{it.tag}</span>
              <div className="tile-title">{it.title}</div>
              <div className="tile-loc">{it.loc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Sale configuration ─────────────────────────────────────────────────────
// FALLBACK SALE_CONFIG — overridden at runtime by Products() setting
// window.__SITE_SALE from useSale(). If the CMS is offline, this is what runs.
const SALE_CONFIG = {
  enabled: true,
  bumpPercent: 30,
  salePercent: 20,
  bannerText: 'Spring 2026 Sale',
  bannerSub: '20% off every piece — through May 31',
};

// Returns the active sale config — live one from CMS if set, else fallback.
function activeSale() {
  return (typeof window !== 'undefined' && window.__SITE_SALE) || SALE_CONFIG;
}

// ─── Price helpers ──────────────────────────────────────────────────────────
function parsePriceStr(str) {
  // Returns { prefix, value } or null if not parseable
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/^(.*?)\$([\d,]+)(.*)$/);
  if (!m) return null;
  return { prefix: m[1] || '', value: parseInt(m[2].replace(/,/g, ''), 10), suffix: m[3] || '' };
}
function fmtPrice(n) {
  return '$' + n.toLocaleString('en-US');
}
function bumpedPrice(n) {
  return Math.round(n * (1 + activeSale().bumpPercent / 100));
}
function salePrice(n) {
  const bumped = bumpedPrice(n);
  return Math.round(bumped * (1 - activeSale().salePercent / 100));
}
// Renders a price string as JSX with strikethrough original + sale price when SALE is on.
function PriceTag({ str, compact = false }) {
  if (!activeSale().enabled) return <span>{str}</span>;
  const parsed = parsePriceStr(str);
  if (!parsed) return <span>{str}</span>; // "Contact for price" etc — don't touch
  const wasPrice = bumpedPrice(parsed.value);
  const nowPrice = salePrice(parsed.value);
  return (
    <span className={'price-tag' + (compact ? ' price-tag--compact' : '')}>
      <span className="price-was">{parsed.prefix}{fmtPrice(wasPrice)}{parsed.suffix}</span>
      <span className="price-now">{parsed.prefix}{fmtPrice(nowPrice)}{parsed.suffix}</span>
    </span>
  );
}

// ─── Product catalog data ────────────────────────────────────────────────────
const CATALOG = [
  {
    id: 'lit-stone',
    name: 'The Lit Stone',
    category: 'Lit Stone',
    featured: true,
    img: 'assets/photo-9706-lit.jpg',
    price: 'From $400',
    tagline: 'Custom back-lit stone — your address, name, or message, lit from within.',
    desc: 'Be seen. Be found. Be lit. Hand-cast stone with raised metal lettering and warm amber LED that glows from behind every character at dusk. Carry your address, family name, or whatever you want to say in stone — built in three sizes, hand-painted, sealed, and ready for a Minnesota winter or anything else. Shipped to all 50 states.',
    sizes: [
      { label: 'Small',  dims: '4 ft wide × 21 in tall', price: 'From $400' },
      { label: 'Medium', dims: '6 ft wide × 32 in tall', price: 'From $600' },
      { label: 'Large',  dims: '8 ft wide × 5 ft tall',  price: 'From $1,200' },
    ],
    specs: [
      { k: 'Sizes',      v: 'Small · Medium · Large' },
      { k: 'Material',   v: 'Fiber-reinforced cement' },
      { k: 'Lettering',  v: 'Raised metal, back-lit LED' },
      { k: 'Lighting',   v: 'Hard-wired or solar' },
      { k: 'Crafted In', v: 'Minneapolis, MN' },
      { k: 'Ships To',   v: 'All 50 states' },
    ],
  },
  {
    id: 'grand-urn',
    name: 'Minneapolis Grand Urn',
    category: 'Planter Urn',
    img: 'assets/photo-pedestal-raw.png',
    tintGray: true,
    price: '$90',
    tagline: 'Flagship planter — tall, commanding, built for entryways.',
    desc: 'A tall, commanding piece that anchors entryways, driveways, and garden beds with timeless elegance. Built to handle Midwestern winters and Southern summers alike.',
    specs: [
      { k: 'Height',         v: '18 inches' },
      { k: 'Outer Diameter', v: '19.5 inches' },
      { k: 'Inner Diameter', v: '13.5 inches' },
      { k: 'Depth',          v: '9.5 inches' },
      { k: 'Drain Hole',     v: 'Yes' },
      { k: 'Weight',         v: '102 lbs' },
      { k: 'Material',       v: 'Handcrafted cement' },
    ],
  },
  {
    id: 'pedestal-urn',
    name: 'Twin Cities Pedestal Urn',
    category: 'Planter Urn',
    img: 'assets/photo-pedestal-staged.png',
    tintGray: true,
    price: '$120',
    tagline: 'Wide, bold — ideal for flanking front steps or a driveway entrance.',
    desc: "With its generous planting depth and broad rim, this urn is ideal for large floral arrangements, dramatic centerpiece plantings, or ornamental topiaries. Place a pair flanking your entrance for a look that's nothing short of grand.",
    specs: [
      { k: 'Height',         v: '14 inches' },
      { k: 'Outer Diameter', v: '25 inches' },
      { k: 'Inner Diameter', v: '18 inches' },
      { k: 'Depth',          v: '9 inches' },
      { k: 'Drain Hole',     v: 'Yes' },
      { k: 'Weight',         v: '174 lbs' },
      { k: 'Material',       v: 'Handcrafted cement' },
    ],
  },
  {
    id: 'boulevard-urn',
    name: 'The Boulevard Urn',
    category: 'Planter Urn',
    img: 'assets/photo-boulevard.png',
    price: 'Contact for price',
    tagline: 'Statement piece with sweeping presence — anchors any outdoor space.',
    desc: "Where artistry meets sheer presence. At approximately 170 lbs of solid hand-cast concrete, The Boulevard Urn is designed to anchor a space, not simply occupy it. Inspired by the grand, tree-lined boulevards of America's most iconic neighborhoods.",
    specs: [
      { k: 'Height',         v: '17 inches' },
      { k: 'Outer Diameter', v: '23 inches' },
      { k: 'Inner Diameter', v: '17 inches' },
      { k: 'Weight',         v: 'Approx. 170 lbs' },
      { k: 'Material',       v: 'Hand-cast concrete' },
      { k: 'Crafted In',     v: 'Minneapolis, MN' },
    ],
  },
  {
    id: 'cherub-urn',
    name: 'Cherub Fountain Urn',
    category: 'Planter Urn',
    img: 'assets/photo-cherub.png',
    tintGray: true,
    price: '$80',
    tagline: 'Classic cherub detail — use as a planter or birdbath.',
    desc: 'Charming, classic, and completely versatile. Featuring a detailed cherub design, this piece works as a decorative planter or flip its purpose entirely and use it as a birdbath to bring life and movement to your garden.',
    specs: [
      { k: 'Height',         v: '16.5 inches' },
      { k: 'Outer Diameter', v: '11 inches' },
      { k: 'Inner Diameter', v: '9 inches' },
      { k: 'Depth',          v: '4.5 inches' },
      { k: 'Weight',         v: '12 lbs' },
      { k: 'Material',       v: 'Cast cement' },
      { k: 'Use',            v: 'Planter or Birdbath' },
    ],
  },
  {
    id: 'courtyard-urn',
    name: 'The Courtyard Urn',
    category: 'Planter Urn',
    img: 'assets/photo-courtyard.png',
    tintGray: true,
    price: '$35',
    tagline: 'Compact and handcrafted — perfect for patios and porches.',
    desc: "Perfect for patios, porches, windowsills, and outdoor tabletops. Don't let the size fool you — this compact planter has real presence. Use it to showcase a single bold plant, a cluster of succulents, or fresh herbs.",
    specs: [
      { k: 'Height',         v: '9.5 inches' },
      { k: 'Outer Diameter', v: '11 inches' },
      { k: 'Inner Diameter', v: '8 inches' },
      { k: 'Depth',          v: '5 inches' },
      { k: 'Weight',         v: '14 lbs' },
      { k: 'Material',       v: 'Handcrafted cement' },
      { k: 'Use',            v: 'Tabletop or Patio' },
    ],
  },
  {
    id: 'terrace-urn',
    name: 'The Terrace Urn',
    category: 'Planter Urn',
    img: null,
    price: '$35',
    tagline: 'Our most compact planter — fits anywhere, looks great everywhere.',
    desc: 'Sleek, simple, and perfectly sized for any surface. A customer favorite for balconies, deck rails, outdoor dining tables, and garden shelves. Group several together for a layered display or let one stand alone as an accent.',
    specs: [
      { k: 'Height',         v: '9 inches' },
      { k: 'Outer Diameter', v: '10 inches' },
      { k: 'Inner Diameter', v: '8 inches' },
      { k: 'Depth',          v: '4 inches' },
      { k: 'Weight',         v: '9 lbs' },
      { k: 'Material',       v: 'Handcrafted cement' },
      { k: 'Use',            v: 'Tabletop or Patio' },
    ],
  },
  {
    id: 'foo-dog',
    name: 'The Imperial Foo Dog',
    category: 'Yard Statue',
    img: 'assets/photo-foodog-raw.png',
    imgStaged: 'assets/photo-foodog-staged.png',
    price: '$50',
    tagline: 'A timeless guardian — traditionally displayed in pairs.',
    desc: 'A symbol of protection, power, and prestige. Rooted in centuries of Asian architectural tradition, our hand-poured cement Foo Dog brings that same sense of strength and ceremony to your front door, driveway, or garden. Each piece is poured individually.',
    specs: [
      { k: 'Height',   v: '12 inches' },
      { k: 'Width',    v: '7 inches' },
      { k: 'Depth',    v: '8 inches' },
      { k: 'Weight',   v: '10 lbs' },
      { k: 'Material', v: 'Hand-poured cement' },
      { k: 'Use',      v: 'Outdoor entryway or yard' },
    ],
  },
  {
    id: 'dynasty-lantern',
    name: 'The Dynasty Lantern',
    category: 'Yard Statue',
    img: 'assets/photo-lantern.png',
    studioShot: true,
    price: '$50',
    tagline: 'Classic Asian stone lantern — pairs with any landscape.',
    desc: 'Steeped in tradition and rich in detail, the Dynasty Lantern brings calm sophistication to any garden, pathway, or outdoor living space. Its substantial weight keeps it grounded through wind and weather, while its sculpted form adds visual interest from every angle.',
    specs: [
      { k: 'Height',   v: '15 inches' },
      { k: 'Width',    v: '7 inches' },
      { k: 'Depth',    v: '7 inches' },
      { k: 'Weight',   v: '20 lbs' },
      { k: 'Material', v: 'Handcrafted cement' },
      { k: 'Use',      v: 'Garden or pathway' },
    ],
  },
  {
    id: 'noble-lion',
    name: 'The Noble Lion',
    category: 'Yard Statue',
    img: 'assets/photo-lion.png',
    studioShot: true,
    price: '$40',
    tagline: 'Regal and richly detailed — our most versatile yard accent.',
    desc: 'A compact statement piece that punches well above its weight. Place it at the base of a planter, along a garden path, on a front step, or as part of a larger decorative vignette. Lightweight enough to reposition easily but solid enough to weather the elements.',
    specs: [
      { k: 'Height',   v: '12 inches' },
      { k: 'Width',    v: '4 inches' },
      { k: 'Depth',    v: '5 inches' },
      { k: 'Weight',   v: '6 lbs' },
      { k: 'Material', v: 'Handcrafted cement' },
      { k: 'Use',      v: 'Outdoor yard or garden' },
    ],
  },
];

function Products() {
  const [filter, setFilter] = React.useState('All');
  const [modal, setModal]   = React.useState(null);
  const [zoom, setZoom]     = React.useState(null); // image src to zoom

  // ── Pull live CMS content (catalog + sale) ─────────────────────────────────
  const cmsCatalog = useCatalog();
  const sale = useSale();
  // Mirror current sale config to window so module-level price helpers see it.
  React.useEffect(() => { window.__SITE_SALE = sale; }, [sale]);

  // Use CMS catalog if it has items, otherwise the hardcoded CATALOG fallback.
  const liveCatalog = (cmsCatalog && cmsCatalog.length) ? cmsCatalog : CATALOG;

  // ESC closes zoom (zoom takes priority), then modal
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (zoom) setZoom(null);
      else if (modal) setModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom, modal]);

  const cats = ['All', 'Lit Stone', 'Planter Urn', 'Yard Statue'];

  const visible  = filter === 'All' ? liveCatalog : liveCatalog.filter(p => p.category === filter);
  const featured = visible.find(p => p.featured);
  const rest     = visible.filter(p => !p.featured);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
  };

  return (
    <section className="section alt" id="products">
      <div className="section-head">
        <span className="section-eyebrow">Catalog</span>
        <h2>Every Piece We Make.</h2>
        <p>Nine products, handcrafted to order in Minneapolis. Browse by category — every piece is built when you order it, no two exactly alike.</p>
        <p className="section-footnote">All dimensions are approximate. Each piece is cast individually, so size, weight, and finish can vary slightly from one to the next.</p>
      </div>

      {sale.enabled && (
        <div className="sale-banner">
          <div className="sale-banner-spark" aria-hidden="true">⚡</div>
          <div className="sale-banner-text">
            <span className="sale-banner-title">{sale.bannerText}</span>
            <span className="sale-banner-sub">{sale.bannerSub}</span>
          </div>
          <div className="sale-banner-pct">−{sale.salePercent}%</div>
        </div>
      )}

      {/* ── Category filters ── */}
      <div className="cat-filters">
        {cats.map(c => (
          <button key={c} className={'cat-btn' + (filter === c ? ' active' : '')} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Featured: Lit Stone ── */}
      {featured && (
        <div className="pcard-featured">
          <div className="pcard-featured-img" style={{ backgroundImage: `url(${featured.img})` }} />
          <div className="pcard-featured-body">
            <span className="tile-tag">{featured.category}</span>
            <h3 className="pcard-featured-name">{featured.name}</h3>
            <p className="pcard-tagline">{featured.tagline}</p>
            <div className="pcard-sizes">
              {featured.sizes.map(s => (
                <div key={s.label} className="pcard-size-row">
                  <span className="pcard-size-label">{s.label}</span>
                  <span className="pcard-size-dims">{s.dims}</span>
                  <span className="pcard-size-price"><PriceTag str={s.price} /></span>
                </div>
              ))}
            </div>
            <div className="pcard-actions">
              <button className="btn btn-primary" onClick={scrollToContact}>Get a Quote</button>
              <button className="btn btn-secondary" onClick={() => setModal(featured)}>View Details</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product grid ── */}
      {rest.length > 0 && (
        <div className="pgrid">
          {rest.map(p => (
            <div key={p.id} className="pcard" onClick={() => setModal(p)}>
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
              <div className="pcard-body">
                <span className="tile-tag">{p.category}</span>
                <h4 className="pcard-name">{p.name}</h4>
                <p className="pcard-tagline">{p.tagline}</p>
                <div className="pcard-foot">
                  <span className="pcard-price"><PriceTag str={p.price} compact /></span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); scrollToContact(); }}
                  >Quote</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Spec modal ── */}
      {modal && (
        <div className="pmodal-backdrop" onClick={() => setModal(null)}>
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
              <span className="section-eyebrow">{modal.category}</span>
              <h3 className="pmodal-name">{modal.name}</h3>
              <p className="pmodal-desc">{modal.desc}</p>

              {modal.sizes && (
                <div className="pmodal-block">
                  <div className="pmodal-block-label">Available Sizes</div>
                  {modal.sizes.map(s => (
                    <div key={s.label} className="pmodal-row pmodal-row--sizes">
                      <span className="pmodal-size-name">{s.label}</span>
                      <span className="pmodal-muted">{s.dims}</span>
                      <span className="pmodal-accent"><PriceTag str={s.price} /></span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pmodal-block">
                <div className="pmodal-block-label">Specifications</div>
                {modal.specs.map(s => (
                  <div key={s.k} className="pmodal-row">
                    <span className="pmodal-muted">{s.k}</span>
                    <span>{s.v}</span>
                  </div>
                ))}
              </div>

              <div className="pmodal-actions">
                <button className="btn btn-primary" onClick={() => { setModal(null); scrollToContact(); }}>Get a Quote</button>
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Zoom lightbox ── */}
      {zoom && (
        <div className="pzoom-backdrop" onClick={() => setZoom(null)}>
          <button className="pzoom-close" aria-label="Close zoom" onClick={() => setZoom(null)}>×</button>
          <img className="pzoom-img" src={zoom} alt="Product detail" onClick={(e) => e.stopPropagation()} />
          <div className="pzoom-hint">Click anywhere or press ESC to close</div>
        </div>
      )}
    </section>
  );
}

function Process() {
  const p = useProcess();
  const steps = (p.steps && p.steps.length) ? p.steps : [
    { n: '01', t: 'Visit & Plan', d: 'Kurt comes to your yard. Measures, looks at the house, talks about light and grade. Sketch on-site.' },
    { n: '02', t: 'Stone & Spec', d: 'Pick your piece from the yard or commission a pour. Choose numerals, font, LED color and scene.' },
    { n: '03', t: 'Cast', d: 'Hand-cast in-studio. Concrete cures for 30 days before finish work begins — paint, stain, seal.' },
    { n: '04', t: 'Install & Wire', d: 'We dig, level, set, and wire to a low-voltage transformer. Photocell included. Landscape restored.' },
  ];
  const eyebrow    = p.eyebrow    || 'Process';
  const titleA     = p.titleA     || 'Four Steps,';
  const titleB     = p.titleB     || 'Four to Six Weeks.';
  const subtitle   = p.subtitle   || 'Most pieces are in the ground within six weeks of the first visit. Larger monoliths and full garden installs take longer; you\u2019ll know by week one.';
  const noteLabel  = p.noteLabel  || 'Booking';
  const noteBody   = p.noteBody   || '50% down to reserve your spot in the queue. Balance due on install day. We accept check, card, and bank transfer.';
  return (
    <section className="section" id="process">
      <div className="section-head">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{titleA}<br/>{titleB}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="process">
        {steps.map((s) => (
          <div className="step" key={s.n}>
            <div className="step-num">{s.n}</div>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </div>
        ))}
      </div>
      <div className="process-note">
        <span className="process-note-label">{noteLabel}</span>
        <span className="process-note-body">{noteBody}</span>
      </div>
    </section>
  );
}

function About() {
  const a = useAbout();
  const img = a.img || 'assets/kurt-novaks-rock.jpeg';
  const eyebrow = a.eyebrow || 'About';
  const title   = a.title   || 'Concrete, Cast By Hand.';
  const paragraphs = (a.paragraphs && a.paragraphs.length) ? a.paragraphs : [
    'Twin City Concrete Yard & Garden is a one-man shop run out of a pole barn in the north metro. Kurt has been pouring, casting, and installing custom landscape stone for almost two decades.',
    'Every piece is made to order. No catalog, no stock rocks, no subcontractors. If it leaves the yard with our name on it, Kurt touched it. That\u2019s the promise, and that\u2019s the limit \u2014 we only take on so many jobs a season.',
    'The LED work grew out of a customer request in 2019: \u201cCan the numbers glow?\u201d They can. Now they\u2019re the signature.',
  ];
  const sigName = a.sigName || 'Kurt Kujawa';
  const sigRole = a.sigRole || 'Owner \u00b7 Sculptor \u00b7 Installer';
  return (
    <section className="section alt" id="about">
      <div className="about-wrap">
        <div className="about-img" style={{ backgroundImage: `url(${img})` }} />
        <div className="about-body">
          <span className="section-eyebrow">{eyebrow}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 3vw + 1rem, 2.75rem)', textTransform: 'uppercase', lineHeight: 1.05, marginBottom: '1.5rem' }}>
            {title}
          </h2>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <div className="about-sig">
            <div>
              <div className="about-sig-name">{sigName}</div>
              <div className="about-sig-role">{sigRole}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  // The "Hard Numbers" section — real stats, real sources, framing does the comedy work.
  // Renamed in spirit but kept the function name so the rest of the app stays wired.
  const hn = useHardNumbers();
  const eyebrow = hn.eyebrow || 'What the Data Says';
  const titleA = hn.titleA || 'The Hard ';
  const titleB = hn.titleB || 'Numbers';
  const titleSuffix = hn.titleSuffix || '.';
  const subtitle = hn.subtitle || 'You don\u2019t need a testimonial to tell you a hard-to-find house is a problem. The data does that already.';
  const tagline = hn.tagline || 'Be Seen. Be Found. Be Lit.';
  const taglineSub = hn.taglineSub || '\u2014 That\u2019s what we do.';
  const items = (hn.items && hn.items.length) ? hn.items : [
    { kind: 'stat',  figure: '28', figurePct: '%',
      body: 'of food delivery drivers admit to <strong>eating customers\u2019 food</strong>. Another <strong>54%</strong> say they\u2019re \u201ctempted by the smell.\u201d The longer they drive looking for your address, the worse those numbers get.',
      cite: 'U.S. Foods Survey \u00b7 2019' },
    { kind: 'quote',
      quote: 'Seconds matter. We need to find the house as quickly as we can.',
      citeStrong: 'Asst. Chief Ben Martinez', citeStrongSep: 'Pharr EMS',
      citeSub: 'on visible house numbers and emergency response times' },
    { kind: 'stat',  figure: '79', figurePct: '%',
      body: 'of delivery drivers admit it now \u2014 up from 28%. Three years, climbing. Make your address <strong>impossible to miss</strong>, and the timer doesn\u2019t start running.',
      cite: 'Circuit Last-Mile Survey \u00b7 2022' },
  ];
  return (
    <section className="section" id="testimonials" style={{ paddingBottom: '4rem' }}>
      <div className="section-head">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{titleA}<span className="amber">{titleB}</span>{titleSuffix}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="hardnums">
        {items.map((it, i) => it.kind === 'quote' ? (
          <div className="hardnum hardnum--quote" key={i}>
            <div className="hardnum-quote-mark" aria-hidden="true">&ldquo;</div>
            <p className="hardnum-quote">{it.quote}</p>
            <div className="hardnum-cite hardnum-cite--strong">
              {it.citeStrong} <span className="hardnum-cite-sep">·</span> {it.citeStrongSep}
            </div>
            <div className="hardnum-cite-sub">{it.citeSub}</div>
          </div>
        ) : (
          <div className="hardnum" key={i}>
            <div className="hardnum-fig">{it.figure}<span className="hardnum-fig-pct">{it.figurePct}</span></div>
            <p className="hardnum-body" dangerouslySetInnerHTML={{ __html: it.body }} />
            <div className="hardnum-cite">{it.cite}</div>
          </div>
        ))}
      </div>

      <div className="hardnums-tag">
        {tagline} <span className="hardnums-tag-sub">{taglineSub}</span>
      </div>
    </section>
  );
}

window.Gallery = Gallery;
window.Products = Products;
window.Process = Process;
window.Testimonials = Testimonials;
window.About = About;
