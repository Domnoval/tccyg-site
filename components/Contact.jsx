// Contact.jsx + Footer.jsx

// ── FORMSPREE SETUP ──────────────────────────────────────────────────────────
// 1. Go to https://formspree.io and create a free account
// 2. Click "New Form", name it "Kurt's Quote Request", set email to Kurt's address
// 3. Copy the form ID (looks like "xabc1234") and paste it below
const FORMSPREE_ID_FALLBACK = 'xvzdlyrp';
// ─────────────────────────────────────────────────────────────────────────────

function Contact() {
  const c = useContact();
  const FORMSPREE_ID = c.formspreeId || FORMSPREE_ID_FALLBACK;
  const eyebrow      = c.eyebrow     || 'Commission';
  const title        = c.title       || 'Start Your Piece.';
  const subtitle     = c.subtitle    || 'Fill in the basics below or call the shop directly. Kurt answers his own phone \u2014 leave a message if he\u2019s out in the yard.';
  const asideTitle   = c.asideTitle  || 'The Shop';
  const asideBody    = c.asideBody   || 'We serve the seven-county Twin Cities metro: Minneapolis, St. Paul, Plymouth, Maple Grove, Eden Prairie, Woodbury, and everywhere in between.';
  const phone        = c.phone       || '612-470-8332';
  const phoneHref    = c.phoneHref   || 'tel:6124708332';
  const hours        = c.hours       || 'Sat 9\u20132 \u00b7 By Appointment';
  const seasonLabel  = c.seasonLabel || 'Season';
  const seasonValue  = c.seasonValue || 'Booking 2026 \u00b7 4 slots left';
  const errorPhone   = c.errorPhone  || phone;

  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error
  const [form, setForm] = React.useState({
    name: '', email: '', phone: '', address: '', type: 'Lit Stone', stoneMessage: '', message: ''
  });
  const [photo, setPhoto] = React.useState(null); // File or null
  const fileRef = React.useRef(null);

  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const handlePhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) { setPhoto(null); return; }
    // 8MB cap — Formspree free is 1MB attachments, Gold is 10MB; 8MB is safe headroom
    if (f.size > 8 * 1024 * 1024) {
      alert('Photo is over 8MB. Please use a smaller file or compress it.');
      e.target.value = '';
      setPhoto(null);
      return;
    }
    setPhoto(f);
  };
  const clearPhoto = () => {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      let res;
      if (photo) {
        // Multipart submission — Formspree attaches file on Gold tier
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('email', form.email);
        fd.append('phone', form.phone || '—');
        fd.append('address', form.address || '—');
        fd.append('type', form.type);
        fd.append('Stone Message', form.stoneMessage || '—');
        fd.append('message', form.message || '—');
        fd.append('Site Photo', photo, photo.name);
        res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd,
        });
      } else {
        res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    form.name,
            email:   form.email,
            phone:   form.phone || '—',
            address: form.address || '—',
            type:    form.type,
            'Stone Message': form.stoneMessage || '—',
            message: form.message || '—',
          }),
        });
      }
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', phone: '', address: '', type: 'Lit Stone', stoneMessage: '', message: '' });
        clearPhoto();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const sending = status === 'sending';

  return (
    <section className="section" id="contact">
      <div className="section-head">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="contact-wrap">
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>Your Name</label>
              <input value={form.name} onChange={handle('name')} required disabled={sending} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={handle('email')} required disabled={sending} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={handle('phone')} placeholder="(612) 470-8332" disabled={sending} />
            </div>
            <div className="field">
              <label>Install Address</label>
              <input value={form.address} onChange={handle('address')} placeholder="Street &amp; city" disabled={sending} />
            </div>
          </div>
          <div className="field">
            <label>What you&rsquo;re looking for</label>
            <select value={form.type} onChange={handle('type')} disabled={sending}>
              <option>Lit Stone</option>
              <option>Illuminated Family Stone</option>
              <option>Illuminated Monolith</option>
              <option>Concrete Planters</option>
              <option>Something Else</option>
            </select>
          </div>
          <div className="field">
            <label>Message on the Stone <span className="field-hint">— optional</span></label>
            <input
              value={form.stoneMessage}
              onChange={handle('stoneMessage')}
              placeholder='e.g. 1371, "The Novaks", or your last name'
              maxLength={32}
              disabled={sending}
            />
            <span className="field-foot">Name, address, or short phrase. We&rsquo;ll confirm the exact wording before we cast.</span>
          </div>
          <div className="field">
            <label>Tell us about the spot</label>
            <textarea
              value={form.message}
              onChange={handle('message')}
              placeholder="Existing landscaping, sun exposure, rough budget, anything we should know."
              disabled={sending}
            />
          </div>
          <div className="field">
            <label>Photo of the Spot <span className="field-hint">— optional</span></label>
            <div className={'photo-upload' + (photo ? ' photo-upload--has-file' : '')}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                disabled={sending}
                id="contact-photo"
                className="photo-upload-input"
              />
              <label htmlFor="contact-photo" className="photo-upload-label">
                {photo ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="photo-upload-name">{photo.name}</span>
                    <span className="photo-upload-size">({(photo.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                    </svg>
                    <span>Tap to add a photo of your front yard or the spot</span>
                  </>
                )}
              </label>
              {photo && (
                <button type="button" className="photo-upload-clear" onClick={clearPhoto} disabled={sending} aria-label="Remove photo">×</button>
              )}
            </div>
            <span className="field-foot">A picture is worth a thousand words. Max 8MB. JPG, PNG, or HEIC.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={sending} style={{ opacity: sending ? 0.6 : 1 }}>
            {sending ? 'Sending…' : 'Send Request'}
          </button>

          {status === 'sent' && (
            <div className="sent" style={{ marginTop: '1rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nature)', display: 'inline-block' }}></span>
              Sent. Kurt will be in touch within two business days.
            </div>
          )}
          {status === 'error' && (
            <div className="sent" style={{ marginTop: '1rem', background: 'rgba(229,72,77,.1)', borderColor: 'rgba(229,72,77,.4)', color: '#E5484D' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5484D', display: 'inline-block' }}></span>
              Something went wrong. Please call the shop at {errorPhone}.
            </div>
          )}
        </form>

        <aside className="contact-aside">
          <h3>{asideTitle}</h3>
          <p>{asideBody}</p>
          <div className="contact-item">
            <span className="dot" />
            <div>
              <span className="lbl">Phone</span>
              <span className="val"><a href={phoneHref}>{phone}</a></span>
            </div>
          </div>
          <div className="contact-item">
            <span className="dot" />
            <div>
              <span className="lbl">Yard Hours</span>
              <span className="val">{hours}</span>
            </div>
          </div>
          <div className="contact-item">
            <span className="dot" style={{ background: 'var(--nature)', boxShadow: '0 0 10px var(--nature)' }} />
            <div>
              <span className="lbl">{seasonLabel}</span>
              <span className="val">{seasonValue}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Footer() {
  const f = useFooter();
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
  };

  const links = (f.links && f.links.length) ? f.links : [
    { id: 'gallery',  label: 'Work' },
    { id: 'products', label: 'What We Make' },
    { id: 'process',  label: 'Process' },
    { id: 'contact',  label: 'Contact' },
  ];
  const sloganA   = f.sloganA   || 'Be Seen.';
  const sloganMid = f.sloganMid || 'Be Found.';
  const sloganB   = f.sloganB   || 'Be Lit.';
  const sloganTag = f.sloganTag || 'Lighting yards coast to coast.';
  const copyright = f.copyright || '\u00a9 2026 Twin City Concrete Yard & Garden \u00b7 Minneapolis, MN';

  return (
    <footer className="footer">
      <div className="footer-slogan">
        {sloganA} <span className="footer-slogan-mid">{sloganMid}</span> {sloganB}
        <span className="footer-slogan-tag">{sloganTag}</span>
      </div>
      <div className="footer-inner">
        <div className="small">{copyright}</div>
        <div className="footer-links">
          {links.map(({ id, label }) => (
            <a key={id} onClick={() => scrollTo(id)}>{label}</a>
          ))}
        </div>
      </div>

    </footer>
  );
}

window.Contact = Contact;
window.Footer = Footer;
