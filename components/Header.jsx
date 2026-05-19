// Header.jsx
function Header({ currentSection, onNavigate }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const nav   = useNav();
  const brand = useBrand();
  const links = nav.links && nav.links.length ? nav.links : [
    { id: 'gallery',  label: 'Work' },
    { id: 'products', label: 'What We Make' },
    { id: 'process',  label: 'Process' },
    { id: 'about',    label: 'About' },
  ];
  const ctaLabel = nav.ctaLabel || 'Get a Quote';
  const wmTop = brand.wordmarkTop || 'Twin City Concrete';
  const wmBot = brand.wordmarkBot || 'Yard & Garden';
  const logoSrc = brand.logoSrc || 'assets/logo-icon.png';

  const go = (id) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  // Close menu on scroll
  React.useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true, once: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <a className="brand-mark" onClick={() => go('hero')} aria-label="Home">
          <img src={logoSrc} alt="" />
          <div className="brand-wordmark">
            <span className="top">{wmTop}</span>
            <span className="bot">{wmBot}</span>
          </div>
        </a>
        <nav className="nav">
          {links.map(({ id, label }) => (
            <a key={id} className={currentSection === id ? 'active' : ''} onClick={() => go(id)}>{label}</a>
          ))}
          <a className="btn btn-primary btn-sm" onClick={() => go('contact')}>{ctaLabel}</a>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className={'hamburger' + (menuOpen ? ' is-open' : '')}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={'mobile-menu' + (menuOpen ? ' is-open' : '')} aria-hidden={!menuOpen}>
        <nav className="mobile-nav">
          {links.map(({ id, label }) => (
            <a
              key={id}
              className={currentSection === id ? 'active' : ''}
              onClick={() => go(id)}
            >
              {label}
            </a>
          ))}
          <a className="btn btn-primary mobile-cta" onClick={() => go('contact')}>{ctaLabel}</a>
        </nav>
      </div>

      {/* Backdrop */}
      {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

window.Header = Header;
