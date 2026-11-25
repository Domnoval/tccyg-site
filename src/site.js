// Twin City Concrete Yard & Garden — page behavior.
// Every page works with this file missing; it only adds the interactive parts.
(function () {
  'use strict';

  // ── Home: drag the sun down ────────────────────────────────────────────
  var sun = document.getElementById('sun');
  var photo = document.querySelector('[data-sun-photo]');
  var clock = document.querySelector('[data-sun-clock]');
  function setSun(v) {
    var t = v / 100;
    photo.style.setProperty('--bright', (1.12 - t * 0.5).toFixed(2));
    photo.style.setProperty('--night-a', (t * t).toFixed(2));
    photo.style.setProperty('--glow', (t * 0.32).toFixed(2));
    if (clock) {
      var mins = Math.round(12 * 60 + t * 12 * 60);
      var h24 = Math.floor(mins / 60) % 24;
      var m = mins % 60;
      var h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      clock.textContent = h12 + ':' + (m < 10 ? '0' + m : m) + (h24 >= 12 ? ' pm' : ' am');
    }
  }
  if (sun && photo) {
    sun.addEventListener('input', function () { setSun(Number(sun.value)); });
    setSun(Number(sun.value));
  }

  // ── Lit Stones: size it against a front door ───────────────────────────
  var sizer = document.querySelector('[data-sizer]');
  if (sizer) {
    var sizes = JSON.parse(sizer.getAttribute('data-sizer'));
    var stone = sizer.querySelector('[data-stone]');
    var out = {
      name: sizer.querySelectorAll('[data-size-name]'),
      price: sizer.querySelector('[data-size-price]'),
      dims: sizer.querySelector('[data-size-dims]'),
      blurb: sizer.querySelector('[data-size-blurb]'),
      stage: sizer.querySelector('[data-size-stage]')
    };
    var pills = sizer.querySelectorAll('[data-size]');
    function pick(i) {
      var s = sizes[i];
      if (!s) return;
      stone.style.width = s.w + 'px';
      stone.style.height = s.h + 'px';
      stone.style.fontSize = Math.round(s.h * 0.5) + 'px';
      out.name.forEach(function (el) { el.textContent = s.label.toLowerCase(); });
      out.price.textContent = s.price;
      out.dims.textContent = s.dims;
      out.blurb.textContent = s.blurb;
      out.stage.setAttribute('aria-label', 'A ' + s.label.toLowerCase() + ' stone, ' + s.dims + ', drawn to scale beside a standard front door');
      pills.forEach(function (p, j) { p.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    }
    pills.forEach(function (p, i) { p.addEventListener('click', function () { pick(i); }); });
  }

  // ── Catalog: filter by category ────────────────────────────────────────
  var filters = document.querySelectorAll('[data-filter]');
  if (filters.length) {
    var pieces = document.querySelectorAll('[data-cat]');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.getAttribute('data-filter');
        filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        pieces.forEach(function (el) { el.hidden = want !== 'all' && el.getAttribute('data-cat') !== want; });
      });
    });
  }

  // ── Start: prefill what they asked about, then send the request ─────────
  var form = document.getElementById('quote-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    var about = params.get('about');
    if (about) {
      var kind = form.querySelector('[name="type"]');
      var note = form.querySelector('[name="message"]');
      if (params.get('kind') && kind) {
        Array.prototype.forEach.call(kind.options, function (o) { if (o.value === params.get('kind')) kind.value = o.value; });
      }
      if (note && !note.value) note.value = 'Asking about: ' + about.slice(0, 80);
    }

    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var file = form.querySelector('[name="photo"]');
    if (file) {
      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        if (f && f.size > 8 * 1024 * 1024) {
          file.value = '';
          say('That photo is over 8MB. Please pick a smaller one.', true);
        } else { say('', false); }
      });
    }
    function say(msg, isErr) {
      status.textContent = msg;
      status.className = 'form-status' + (isErr ? ' err' : '');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var data = {
        name: val('name'),
        phone: val('phone'),
        address: val('address') || '—',
        type: val('type'),
        'Stone Message': val('stoneMessage') || '—',
        message: val('message') || '—'
      };
      // Formspree checks anything named "email", so only send it when given.
      if (val('email')) data.email = val('email');
      var f = file && file.files && file.files[0];
      var opts;
      if (f) {
        var fd = new FormData();
        Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
        fd.append('Site Photo', f, f.name);
        opts = { method: 'POST', headers: { Accept: 'application/json' }, body: fd };
      } else {
        opts = { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
      }
      submitBtn.disabled = true;
      say('Sending…', false);
      fetch(form.action, opts).then(function (res) {
        if (!res.ok) throw new Error('rejected');
        // Signal accepted inquiries only. Never include customer-entered text.
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'quote_request_success', form_id: 'quote_request', product_type: data.type });
        } catch (trackingError) { /* the inquiry still went through */ }
        location.href = form.getAttribute('data-thanks');
      }).catch(function () {
        submitBtn.disabled = false;
        say('That did not send. Please try again, or call ' + form.getAttribute('data-phone') + '.', true);
      });
    });
  }
})();
