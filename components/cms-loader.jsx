// ══════════════════════════════════════════════════════════════════════
//  components/cms-loader.jsx
//
//  Provides a SiteContentProvider + useSiteContent hook so every section
//  of the site can read its content from Supabase. Renders immediately
//  with the embedded FALLBACK_CONTENT (= the current hardcoded site copy
//  at deploy time) — then quietly upgrades to the live DB version when
//  the fetch resolves. If Supabase is unreachable, the site still works.
//
//  Plug your Supabase URL + anon key into the two constants below. The
//  CDN script tag for @supabase/supabase-js must load BEFORE this file.
// ══════════════════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://edfekbdijevkglfuvjlb.supabase.co';
const SUPABASE_ANON = 'sb_publishable_dKG7AR8ENFdsEDA3BkObSg_3MdEJ34E';

// ──────────────────────────────────────────────────────────────────────
//  FALLBACK_CONTENT — frozen snapshot of the site copy at this deploy.
//  When the CMS is offline or the row is missing, this is what renders.
//  Kurt's edits in the admin overwrite this in the database — the version
//  here only updates when we redeploy. Keep them roughly in sync.
// ──────────────────────────────────────────────────────────────────────
const FALLBACK_CONTENT = /* SEED_INJECT_START */
{
  "schemaVersion": 1,
  "meta": {
    "siteName": "Twin City Concrete Yard & Garden",
    "tagline": "Handcrafted Landscape Stone, Minneapolis",
    "ogDescription": "Custom concrete landscape rocks with mounted house numbers and backlit amber LED. Hand-sculpted in Minneapolis."
  },
  "brand": {
    "wordmarkTop": "Twin City Concrete",
    "wordmarkBot": "Yard & Garden",
    "logoSrc": "assets/logo-icon.png"
  },
  "nav": {
    "links": [
      { "id": "gallery",  "label": "Work" },
      { "id": "products", "label": "What We Make" },
      { "id": "process",  "label": "Process" },
      { "id": "about",    "label": "About" }
    ],
    "ctaLabel": "Get a Quote"
  },
  "hero": {
    "eyebrow": "Be Seen. Be Found. Be Lit.",
    "headlinePreset": "address",
    "headlinePresets": {
      "address": { "a": "Your Address.",  "b": "Set in Stone." },
      "raw":     { "a": "Raw Stone.",     "b": "Refined Light." },
      "light":   { "a": "Light Up",       "b": "Your Landing." }
    },
    "subtitle": "Custom concrete landscape rocks with mounted house numbers and backlit amber LED. Hand-sculpted in Minneapolis — built for Minnesota winters, meant to outlast the mailbox.",
    "ctaPrimary":   { "label": "Start Your Piece", "target": "contact" },
    "ctaSecondary": { "label": "See The Work",     "target": "gallery" },
    "beamSize": 450,
    "beamWarmth": "cool",
    "hintText": "Move to illuminate",
    "kickers": [
      { "num": "6yr",  "lbl": "In Business" },
      { "num": "50+",  "lbl": "Pieces Cast" },
      { "num": "100%", "lbl": "Hand-Cast Cement" }
    ]
  },
  "gallery": {
    "eyebrow": "Portfolio",
    "title": "Recent Work",
    "subtitle": "A slice of what's been planted in Twin Cities front yards. Each piece is one of one — no two rocks come out of the yard the same.",
    "items": [
      {
        "id": "g1",
        "title": "The 9706 Stone",
        "tag": "Lit Stone",
        "loc": "Plymouth, MN",
        "img": "assets/photo-9706-lit.jpg",
        "big": true,
        "desc": "Granite boulder with raised black lettering and warm amber LED backwash. The numerals lift off the stone and the light spills out from behind — visible from the curb at every hour after sunset."
      },
      {
        "id": "g2",
        "title": "The Novak Stone",
        "tag": "Lit Stone",
        "loc": "Maple Grove, MN",
        "img": "assets/kurt-novaks-rock.jpeg",
        "desc": "Slate-finish concrete cast with raised metal lettering. Planted at the base of a legacy red maple as a centerpiece to the entryway garden."
      },
      {
        "id": "g3",
        "title": "Recent Install",
        "tag": "More Coming",
        "loc": "Twin Cities Metro",
        "placeholder": true,
        "comingSoon": true,
        "desc": "Photos from a recent install — coming soon."
      },
      {
        "id": "g4",
        "title": "Recent Install",
        "tag": "More Coming",
        "loc": "Twin Cities Metro",
        "placeholder": true,
        "comingSoon": true,
        "desc": "Photos from a recent install — coming soon."
      }
    ]
  },
  "sale": {
    "enabled": true,
    "bumpPercent": 30,
    "salePercent": 20,
    "bannerText": "Spring 2026 Sale",
    "bannerSub": "20% off every piece — through May 31"
  },
  "catalog": [
    {
      "id": "lit-stone",
      "name": "The Lit Stone",
      "category": "Lit Stone",
      "featured": true,
      "img": "assets/photo-9706-lit.jpg",
      "imgStaged": "",
      "price": "From $400",
      "tagline": "Custom back-lit stone — your address, name, or message, lit from within.",
      "desc": "Be seen. Be found. Be lit. Hand-cast stone with raised metal lettering and warm amber LED that glows from behind every character at dusk. Carry your address, family name, or whatever you want to say in stone — built in three sizes, hand-painted, sealed, and ready for a Minnesota winter or anything else. Shipped to all 50 states.",
      "sizes": [
        { "label": "Small",  "dims": "4 ft wide × 21 in tall", "price": "From $400" },
        { "label": "Medium", "dims": "6 ft wide × 32 in tall", "price": "From $600" },
        { "label": "Large",  "dims": "8 ft wide × 5 ft tall",  "price": "From $1,200" }
      ],
      "specs": [
        { "k": "Sizes",      "v": "Small · Medium · Large" },
        { "k": "Material",   "v": "Fiber-reinforced cement" },
        { "k": "Lettering",  "v": "Raised metal, back-lit LED" },
        { "k": "Lighting",   "v": "Hard-wired or solar" },
        { "k": "Crafted In", "v": "Minneapolis, MN" },
        { "k": "Ships To",   "v": "All 50 states" }
      ]
    },
    {
      "id": "grand-urn",
      "name": "Minneapolis Grand Urn",
      "category": "Planter Urn",
      "img": "assets/photo-pedestal-raw.png",
      "imgStaged": "",
      "tintGray": true,
      "price": "$90",
      "tagline": "Flagship planter — tall, commanding, built for entryways.",
      "desc": "A tall, commanding piece that anchors entryways, driveways, and garden beds with timeless elegance. Built to handle Midwestern winters and Southern summers alike.",
      "specs": [
        { "k": "Height",         "v": "18 inches" },
        { "k": "Outer Diameter", "v": "19.5 inches" },
        { "k": "Inner Diameter", "v": "13.5 inches" },
        { "k": "Depth",          "v": "9.5 inches" },
        { "k": "Drain Hole",     "v": "Yes" },
        { "k": "Weight",         "v": "102 lbs" },
        { "k": "Material",       "v": "Handcrafted cement" }
      ]
    },
    {
      "id": "pedestal-urn",
      "name": "Twin Cities Pedestal Urn",
      "category": "Planter Urn",
      "img": "assets/photo-pedestal-staged.png",
      "imgStaged": "",
      "tintGray": true,
      "price": "$120",
      "tagline": "Wide, bold — ideal for flanking front steps or a driveway entrance.",
      "desc": "With its generous planting depth and broad rim, this urn is ideal for large floral arrangements, dramatic centerpiece plantings, or ornamental topiaries. Place a pair flanking your entrance for a look that's nothing short of grand.",
      "specs": [
        { "k": "Height",         "v": "14 inches" },
        { "k": "Outer Diameter", "v": "25 inches" },
        { "k": "Inner Diameter", "v": "18 inches" },
        { "k": "Depth",          "v": "9 inches" },
        { "k": "Drain Hole",     "v": "Yes" },
        { "k": "Weight",         "v": "174 lbs" },
        { "k": "Material",       "v": "Handcrafted cement" }
      ]
    },
    {
      "id": "boulevard-urn",
      "name": "The Boulevard Urn",
      "category": "Planter Urn",
      "img": "assets/photo-boulevard.png",
      "imgStaged": "",
      "price": "Contact for price",
      "tagline": "Statement piece with sweeping presence — anchors any outdoor space.",
      "desc": "Where artistry meets sheer presence. At approximately 170 lbs of solid hand-cast concrete, The Boulevard Urn is designed to anchor a space, not simply occupy it. Inspired by the grand, tree-lined boulevards of America's most iconic neighborhoods.",
      "specs": [
        { "k": "Height",         "v": "17 inches" },
        { "k": "Outer Diameter", "v": "23 inches" },
        { "k": "Inner Diameter", "v": "17 inches" },
        { "k": "Weight",         "v": "Approx. 170 lbs" },
        { "k": "Material",       "v": "Hand-cast concrete" },
        { "k": "Crafted In",     "v": "Minneapolis, MN" }
      ]
    },
    {
      "id": "cherub-urn",
      "name": "Cherub Fountain Urn",
      "category": "Planter Urn",
      "img": "assets/photo-cherub.png",
      "imgStaged": "",
      "tintGray": true,
      "price": "$80",
      "tagline": "Classic cherub detail — use as a planter or birdbath.",
      "desc": "Charming, classic, and completely versatile. Featuring a detailed cherub design, this piece works as a decorative planter or flip its purpose entirely and use it as a birdbath to bring life and movement to your garden.",
      "specs": [
        { "k": "Height",         "v": "16.5 inches" },
        { "k": "Outer Diameter", "v": "11 inches" },
        { "k": "Inner Diameter", "v": "9 inches" },
        { "k": "Depth",          "v": "4.5 inches" },
        { "k": "Weight",         "v": "12 lbs" },
        { "k": "Material",       "v": "Cast cement" },
        { "k": "Use",            "v": "Planter or Birdbath" }
      ]
    },
    {
      "id": "courtyard-urn",
      "name": "The Courtyard Urn",
      "category": "Planter Urn",
      "img": "assets/photo-courtyard.png",
      "imgStaged": "",
      "tintGray": true,
      "price": "$35",
      "tagline": "Compact and handcrafted — perfect for patios and porches.",
      "desc": "Perfect for patios, porches, windowsills, and outdoor tabletops. Don't let the size fool you — this compact planter has real presence. Use it to showcase a single bold plant, a cluster of succulents, or fresh herbs.",
      "specs": [
        { "k": "Height",         "v": "9.5 inches" },
        { "k": "Outer Diameter", "v": "11 inches" },
        { "k": "Inner Diameter", "v": "8 inches" },
        { "k": "Depth",          "v": "5 inches" },
        { "k": "Weight",         "v": "14 lbs" },
        { "k": "Material",       "v": "Handcrafted cement" },
        { "k": "Use",            "v": "Tabletop or Patio" }
      ]
    },
    {
      "id": "terrace-urn",
      "name": "The Terrace Urn",
      "category": "Planter Urn",
      "img": null,
      "imgStaged": "",
      "price": "$35",
      "tagline": "Our most compact planter — fits anywhere, looks great everywhere.",
      "desc": "Sleek, simple, and perfectly sized for any surface. A customer favorite for balconies, deck rails, outdoor dining tables, and garden shelves. Group several together for a layered display or let one stand alone as an accent.",
      "specs": [
        { "k": "Height",         "v": "9 inches" },
        { "k": "Outer Diameter", "v": "10 inches" },
        { "k": "Inner Diameter", "v": "8 inches" },
        { "k": "Depth",          "v": "4 inches" },
        { "k": "Weight",         "v": "9 lbs" },
        { "k": "Material",       "v": "Handcrafted cement" },
        { "k": "Use",            "v": "Tabletop or Patio" }
      ]
    },
    {
      "id": "foo-dog",
      "name": "The Imperial Foo Dog",
      "category": "Yard Statue",
      "img": "assets/photo-foodog-raw.png",
      "imgStaged": "assets/photo-foodog-staged.png",
      "price": "$50",
      "tagline": "A timeless guardian — traditionally displayed in pairs.",
      "desc": "A symbol of protection, power, and prestige. Rooted in centuries of Asian architectural tradition, our hand-poured cement Foo Dog brings that same sense of strength and ceremony to your front door, driveway, or garden. Each piece is poured individually.",
      "specs": [
        { "k": "Height",   "v": "12 inches" },
        { "k": "Width",    "v": "7 inches" },
        { "k": "Depth",    "v": "8 inches" },
        { "k": "Weight",   "v": "10 lbs" },
        { "k": "Material", "v": "Hand-poured cement" },
        { "k": "Use",      "v": "Outdoor entryway or yard" }
      ]
    },
    {
      "id": "dynasty-lantern",
      "name": "The Dynasty Lantern",
      "category": "Yard Statue",
      "img": "assets/photo-lantern.png",
      "imgStaged": "assets/photo-lantern-staged.png",
      "studioShot": true,
      "price": "$50",
      "tagline": "Classic Asian stone lantern — pairs with any landscape.",
      "desc": "Steeped in tradition and rich in detail, the Dynasty Lantern brings calm sophistication to any garden, pathway, or outdoor living space. Its substantial weight keeps it grounded through wind and weather, while its sculpted form adds visual interest from every angle.",
      "specs": [
        { "k": "Height",   "v": "15 inches" },
        { "k": "Width",    "v": "7 inches" },
        { "k": "Depth",    "v": "7 inches" },
        { "k": "Weight",   "v": "20 lbs" },
        { "k": "Material", "v": "Handcrafted cement" },
        { "k": "Use",      "v": "Garden or pathway" }
      ]
    },
    {
      "id": "noble-lion",
      "name": "The Noble Lion",
      "category": "Yard Statue",
      "img": "assets/photo-lion.png",
      "imgStaged": "assets/photo-lion-staged.png",
      "studioShot": true,
      "price": "$40",
      "tagline": "Regal and richly detailed — our most versatile yard accent.",
      "desc": "A compact statement piece that punches well above its weight. Place it at the base of a planter, along a garden path, on a front step, or as part of a larger decorative vignette. Lightweight enough to reposition easily but solid enough to weather the elements.",
      "specs": [
        { "k": "Height",   "v": "12 inches" },
        { "k": "Width",    "v": "4 inches" },
        { "k": "Depth",    "v": "5 inches" },
        { "k": "Weight",   "v": "6 lbs" },
        { "k": "Material", "v": "Handcrafted cement" },
        { "k": "Use",      "v": "Outdoor yard or garden" }
      ]
    }
  ],
  "process": {
    "eyebrow": "Process",
    "titleA": "Four Steps,",
    "titleB": "Four to Six Weeks.",
    "subtitle": "Most pieces are in the ground within six weeks of the first visit. Larger monoliths and full garden installs take longer; you'll know by week one.",
    "steps": [
      { "n": "01", "t": "Visit & Plan",   "d": "Kurt comes to your yard. Measures, looks at the house, talks about light and grade. Sketch on-site." },
      { "n": "02", "t": "Stone & Spec",   "d": "Pick your piece from the yard or commission a pour. Choose numerals, font, LED color and scene." },
      { "n": "03", "t": "Cast",           "d": "Hand-cast in-studio. Concrete cures for 30 days before finish work begins — paint, stain, seal." },
      { "n": "04", "t": "Install & Wire", "d": "We dig, level, set, and wire to a low-voltage transformer. Photocell included. Landscape restored." }
    ],
    "noteLabel": "Booking",
    "noteBody": "50% down to reserve your spot in the queue. Balance due on install day. We accept check, card, and bank transfer."
  },
  "about": {
    "img": "assets/kurt-novaks-rock.jpeg",
    "eyebrow": "About",
    "title": "Concrete, Cast By Hand.",
    "paragraphs": [
      "Twin City Concrete Yard & Garden is a one-man shop run out of a pole barn in the north metro. Kurt has been pouring, casting, and installing custom landscape stone for almost two decades.",
      "Every piece is made to order. No catalog, no stock rocks, no subcontractors. If it leaves the yard with our name on it, Kurt touched it. That's the promise, and that's the limit — we only take on so many jobs a season.",
      "The LED work grew out of a customer request in 2019: \"Can the numbers glow?\" They can. Now they're the signature."
    ],
    "sigName": "Kurt Kujawa",
    "sigRole": "Owner · Sculptor · Installer"
  },
  "hardNumbers": {
    "eyebrow": "What the Data Says",
    "titleA": "The Hard ",
    "titleB": "Numbers",
    "titleSuffix": ".",
    "subtitle": "You don't need a testimonial to tell you a hard-to-find house is a problem. The data does that already.",
    "items": [
      {
        "kind": "stat",
        "figure": "28",
        "figurePct": "%",
        "body": "of food delivery drivers admit to <strong>eating customers' food</strong>. Another <strong>54%</strong> say they're \"tempted by the smell.\" The longer they drive looking for your address, the worse those numbers get.",
        "cite": "U.S. Foods Survey · 2019"
      },
      {
        "kind": "quote",
        "quote": "Seconds matter. We need to find the house as quickly as we can.",
        "citeStrong": "Asst. Chief Ben Martinez",
        "citeStrongSep": "Pharr EMS",
        "citeSub": "on visible house numbers and emergency response times"
      },
      {
        "kind": "stat",
        "figure": "79",
        "figurePct": "%",
        "body": "of delivery drivers admit it now — up from 28%. Three years, climbing. Make your address <strong>impossible to miss</strong>, and the timer doesn't start running.",
        "cite": "Circuit Last-Mile Survey · 2022"
      }
    ],
    "tagline": "Be Seen. Be Found. Be Lit.",
    "taglineSub": "— That's what we do."
  },
  "contact": {
    "eyebrow": "Commission",
    "title": "Start Your Piece.",
    "subtitle": "Fill in the basics below or call the shop directly. Kurt answers his own phone — leave a message if he's out in the yard.",
    "asideTitle": "The Shop",
    "asideBody": "We serve the seven-county Twin Cities metro: Minneapolis, St. Paul, Plymouth, Maple Grove, Eden Prairie, Woodbury, and everywhere in between.",
    "phone": "612-470-8332",
    "phoneHref": "tel:6124708332",
    "hours": "Sat 9–2 · By Appointment",
    "seasonLabel": "Season",
    "seasonValue": "Booking 2026 · 4 slots left",
    "formspreeId": "xvzdlyrp",
    "errorPhone": "612-470-8332"
  },
  "footer": {
    "sloganA": "Be Seen.",
    "sloganMid": "Be Found.",
    "sloganB": "Be Lit.",
    "sloganTag": "Lighting yards coast to coast.",
    "copyright": "© 2026 Twin City Concrete Yard & Garden · Minneapolis, MN",
    "links": [
      { "id": "gallery",  "label": "Work" },
      { "id": "products", "label": "What We Make" },
      { "id": "process",  "label": "Process" },
      { "id": "contact",  "label": "Contact" }
    ]
  }
}
/* SEED_INJECT_END */;

// ──────────────────────────────────────────────────────────────────────
//  Supabase client — only initialize if SDK + keys are present.
//  If either is missing, the site silently runs on fallback content.
// ──────────────────────────────────────────────────────────────────────
const _sbReady =
  typeof window.supabase !== 'undefined' &&
  SUPABASE_URL && !SUPABASE_URL.startsWith('__') &&
  SUPABASE_ANON && !SUPABASE_ANON.startsWith('__');

const sbClient = _sbReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false }, // public anon read — no session needed on the site
    })
  : null;

// ──────────────────────────────────────────────────────────────────────
//  React context + provider + hook
// ──────────────────────────────────────────────────────────────────────
const SiteContentContext = React.createContext(FALLBACK_CONTENT);

function SiteContentProvider({ children }) {
  const [content, setContent] = React.useState(FALLBACK_CONTENT);

  React.useEffect(() => {
    if (!sbClient) {
      console.info('[cms-loader] Supabase not configured — running on fallback content.');
      return;
    }
    let cancelled = false;
    sbClient.from('site_content').select('content').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn('[cms-loader] fetch failed, using fallback:', error.message);
          return;
        }
        if (data && data.content) {
          setContent(data.content);
        }
      })
      .catch(err => {
        if (!cancelled) console.warn('[cms-loader] fetch threw, using fallback:', err);
      });
    return () => { cancelled = true; };
  }, []);

  return React.createElement(SiteContentContext.Provider, { value: content }, children);
}

function useSiteContent() {
  return React.useContext(SiteContentContext);
}

// Convenience accessors — components that only need one section
function useHero()        { return useSiteContent().hero        || {}; }
function useNav()         { return useSiteContent().nav         || { links: [], ctaLabel: 'Get a Quote' }; }
function useGallery()     { return useSiteContent().gallery     || { items: [] }; }
function useSale()        { return useSiteContent().sale        || { enabled: false }; }
function useCatalog()     { return useSiteContent().catalog     || []; }
function useProcess()     { return useSiteContent().process     || { steps: [] }; }
function useAbout()       { return useSiteContent().about       || { paragraphs: [] }; }
function useHardNumbers() { return useSiteContent().hardNumbers || { items: [] }; }
function useContact()     { return useSiteContent().contact     || {}; }
function useFooter()      { return useSiteContent().footer      || { links: [] }; }
function useBrand()       { return useSiteContent().brand       || {}; }

// Expose as window globals so subsequent <script type="text/babel"> tags
// (Header.jsx, Sections.jsx, Contact.jsx, the inline App script) can use them.
Object.assign(window, {
  SiteContentProvider,
  SiteContentContext,
  useSiteContent,
  useHero, useNav, useGallery, useSale, useCatalog,
  useProcess, useAbout, useHardNumbers, useContact, useFooter, useBrand,
  FALLBACK_CONTENT,
});
