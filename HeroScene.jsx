// HeroScene.jsx — the actual animated hero composition
const { useState, useEffect, useRef, useMemo } = React;

const PHOTOS = {
  'hero-bg':    { src: 'assets/hero-bg.png',         label: 'Sigil Rock' },
  'slab':       { src: 'assets/photo-slab-garden.jpg', label: 'Slab Garden' },
  'landscape':  { src: 'assets/photo-landscape.jpg',   label: 'Landscape' },
  'river':      { src: 'assets/photo-river-rock.png',  label: 'River Rock' },
  'industrial': { src: 'assets/photo-industrial.png',  label: 'Industrial' },
  'rock-1371':  { src: 'assets/photo-rock-1371-clean.png',   label: 'Rock 1371' },
  'rock-1371-orig':  { src: 'assets/photo-rock-1371.jpg',   label: 'Rock 1371 (orig)' },
};

function Embers({ count = 24 }) {
  const embers = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    bottom: -5 - Math.random() * 30,
    delay: Math.random() * 12,
    duration: 10 + Math.random() * 14,
    drift: (Math.random() - 0.5) * 120,
    size: 1 + Math.random() * 2.5,
    opacity: 0.4 + Math.random() * 0.6,
  })), [count]);
  return (
    <div className="embers" aria-hidden="true">
      {embers.map((e, i) => (
        <span key={i} className="ember" style={{
          left: `${e.left}%`,
          bottom: `${e.bottom}%`,
          width: `${e.size}px`,
          height: `${e.size}px`,
          animationDelay: `${e.delay}s`,
          animationDuration: `${e.duration}s`,
          '--drift': `${e.drift}px`,
          opacity: e.opacity,
        }} />
      ))}
    </div>
  );
}

function Backdrop({ photoKey, parallax }) {
  const photo = PHOTOS[photoKey] || PHOTOS['hero-bg'];
  return (
    <div className="backdrop-stack">
      <img
        className="backdrop-img"
        src={photo.src}
        alt=""
        style={{
          transform: `scale(1.05) translate3d(${parallax.x * -18}px, ${parallax.y * -12}px, 0)`,
        }}
      />
      <div className="backdrop-amber-fog" />
      <div className="backdrop-vignette" />
    </div>
  );
}

function Header({ nav, wordmark }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="TCCYG home">
        <TccygMark size={36} />
        <span className="wordmark-text">
          <span className="wordmark-primary">{wordmark.primary}</span>
          <span className="wordmark-secondary">{wordmark.secondary}</span>
        </span>
      </a>
      <nav className="site-nav">
        {nav.map((item, i) => (
          <a key={i} href={item.href || '#'} className={item.cta ? 'nav-cta' : ''}>{item.label}</a>
        ))}
      </nav>
    </header>
  );
}

function FocalNumber({ text, show }) {
  if (!show) return null;
  return (
    <div className="focal-stage">
      <div className="focal-number" style={{ position: 'relative' }}>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          {text}
          <span className="glow-layer">{text}</span>
        </span>
      </div>
      <div className="focal-caption">Installation № {text}</div>
    </div>
  );
}

function HeroContent({ eyebrow, titleLine1, titleLine2, subtitle, ctaPrimary, ctaSecondary }) {
  return (
    <div className="hero-content">
      <div className="hero-inner">
        <div className="hero-eyebrow">{eyebrow}</div>
        <h1 className="hero-title">
          <span className="line l1">{titleLine1}</span>
          <span className="line l2">{titleLine2}</span>
        </h1>
        <p className="hero-sub">{subtitle}</p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#">
            {ctaPrimary}
            <span className="arrow">→</span>
          </a>
          <a className="btn btn-secondary" href="#">{ctaSecondary}</a>
        </div>
      </div>
    </div>
  );
}

function ScrollCue() {
  return (
    <div className="scroll-cue">
      <span className="scroll-cue-label">Scroll</span>
      <span className="scroll-cue-line" />
    </div>
  );
}

function StatusPill({ text }) {
  return (
    <div className="status-pill">
      <span className="status-dot" />
      <span>{text}</span>
    </div>
  );
}

function SideIndex({ label, value }) {
  return (
    <div className="side-index">
      <span className="side-index-label">{label}</span>
      <span className="side-index-value">{value}</span>
    </div>
  );
}

function HeroScene({ cfg, variant = 'classic', showChrome = true }) {
  const rootRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [lightsOn, setLightsOn] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Zone where "1371" sits on the hero image (matches .rock-glow-boost)
    // Only applies to the rock-1371 photo; other photos light up on full hover.
    const isRock = cfg.photo === 'rock-1371';
    const ZONE = { left: 0.30, top: 0.42, right: 0.72, bottom: 0.64 };
    const inZone = (nx, ny) => nx >= ZONE.left && nx <= ZONE.right && ny >= ZONE.top && ny <= ZONE.bottom;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const x = (nx - 0.5) * 2;
      const y = (ny - 0.5) * 2;
      setParallax({ x, y });
      const lantern = el.querySelector('.cursor-lantern');
      if (lantern) lantern.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
      if (isRock) setLightsOn(inZone(nx, ny));
    };
    const onEnter = () => { if (!isRock) setLightsOn(true); };
    const onLeave = () => { setParallax({ x: 0, y: 0 }); setLightsOn(false); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [cfg.photo]);

  const showFocal = cfg.showNumber !== false && cfg.focalText;

  // Variant layouts
  const isCenter = variant === 'centered';
  const isMinimal = variant === 'minimal';

  return (
    <div className={`hero-root variant-${variant}${lightsOn ? ' lights-on' : ''}`} ref={rootRef}>
      <Backdrop photoKey={cfg.photo || 'hero-bg'} parallax={parallax} />
      <div className="dusk-dim" />
      {cfg.photo === 'rock-1371' && <div className="rock-halo" />}
      {cfg.photo === 'rock-1371' && <div className="rock-glow-boost" />}
      <div className="cursor-lantern" />
      {cfg.embers !== false && <Embers count={variant === 'minimal' ? 14 : 26} />}

      {showChrome && <Header nav={cfg.nav} wordmark={cfg.wordmark} />}

      {isCenter ? (
        <div className="hero-content" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div className="hero-inner" style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <div className="hero-eyebrow" style={{ margin: '0 auto 1.5rem' }}>{cfg.eyebrow}</div>
            <h1 className="hero-title" style={{ textAlign: 'center' }}>
              <span className="line l1">{cfg.titleLine1}</span>
              <span className="line l2">{cfg.titleLine2}</span>
            </h1>
            <p className="hero-sub" style={{ margin: '0 auto 2rem', textAlign: 'center' }}>{cfg.subtitle}</p>
            <div className="hero-ctas" style={{ justifyContent: 'center' }}>
              <a className="btn btn-primary" href="#">
                {cfg.ctaPrimary}<span className="arrow">→</span>
              </a>
              <a className="btn btn-secondary" href="#">{cfg.ctaSecondary}</a>
            </div>
          </div>
        </div>
      ) : isMinimal ? (
        <div className="hero-content">
          <div className="hero-inner" style={{ maxWidth: 520 }}>
            <div className="hero-eyebrow">{cfg.eyebrow}</div>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.4rem, 5.2vw, 5rem)' }}>
              <span className="line l1">{cfg.titleLine1}</span>
              <span className="line l2" style={{ color: 'var(--fg)', textShadow: 'var(--shadow-text)' }}>{cfg.titleLine2}</span>
            </h1>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#">{cfg.ctaPrimary}<span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      ) : (
        <HeroContent {...cfg} />
      )}

      {!isCenter && showFocal && <FocalNumber text={cfg.focalText} show />}
      {showChrome && <ScrollCue />}
      {showChrome && !isMinimal && <StatusPill text={cfg.statusText} />}
      {showChrome && !isCenter && <SideIndex label={cfg.sideLabel} value={cfg.sideValue} />}
    </div>
  );
}

window.HeroScene = HeroScene;
window.PHOTOS = PHOTOS;
