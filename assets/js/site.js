/* ==========================================================================
   Fioredano Construction — site behaviour
   No dependencies. Everything degrades to a working page without JS.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIG — the only block you need to edit to take leads live.
     Set `endpoint` to a form service URL that accepts a POST and you are done.
     Until then the form falls back to opening the visitor's email client.
     See README.md for the three-minute Formspree / Web3Forms setup.
     ---------------------------------------------------------------------- */
  var CONFIG = {
    endpoint: '',                                   // e.g. 'https://formspree.io/f/xxxxxxxx'
    fallbackEmail: 'fioredanoconstruction@gmail.com',
    phoneDisplay: '(848) 448-2294',
    redirect: 'thank-you.html'
  };

  /* ---------------------------------------------------------------- footer */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------ mobile nav */
  var toggle = document.getElementById('navToggle');
  var inner = document.getElementById('headerInner');
  if (toggle && inner) {
    toggle.addEventListener('click', function () {
      var open = inner.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    inner.addEventListener('click', function (e) {
      if (e.target.closest('a') && inner.classList.contains('is-open')) {
        inner.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });
  }

  /* ----------------------------------------------------------------- form  */
  var form = document.getElementById('leadForm');
  if (!form) return;

  var note = document.getElementById('formNote');
  var submitBtn = document.getElementById('submitBtn');

  function digits(s) { return (s || '').replace(/\D/g, ''); }

  var RULES = {
    'f-name':  function (v) { return v.trim().length >= 2 || 'Please enter your name.'; },
    'f-phone': function (v) {
      var d = digits(v);
      return (d.length === 10 || (d.length === 11 && d.charAt(0) === '1')) ||
             'Enter a 10-digit phone number so we can call you back.';
    },
    'f-town':  function (v) { return v.trim().length >= 2 || 'Which town is the project in?'; },
    'f-email': function (v) {
      if (!v.trim()) return true;                   // optional
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email address looks incomplete.';
    }
  };

  function setError(id, message) {
    var input = document.getElementById(id);
    var slot = document.querySelector('[data-err-for="' + id + '"]');
    if (!input || !slot) return;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      slot.textContent = message;
    } else {
      input.removeAttribute('aria-invalid');
      slot.textContent = '';
    }
  }

  function validateField(id) {
    var input = document.getElementById(id);
    if (!input) return true;
    var result = RULES[id](input.value);
    setError(id, result === true ? '' : result);
    return result === true;
  }

  Object.keys(RULES).forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', function () { validateField(id); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(id);
    });
  });

  function say(kind, message) {
    if (!note) return;
    note.className = 'formnote is-' + kind;
    note.textContent = message;
  }

  function payload() {
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    delete data.company;                             // honeypot never travels
    data.source = 'fioredanoconstruction.com';
    data.submitted = new Date().toISOString();
    return data;
  }

  function mailtoFallback(data) {
    var lines = [
      'Name: '      + data.name,
      'Phone: '     + data.phone,
      'Email: '     + (data.email || '—'),
      'Town: '      + data.town,
      'Project: '   + data.project,
      'Timeline: '  + data.timeline,
      '',
      'Details:',
      data.details || '—'
    ].join('\n');

    window.location.href = 'mailto:' + CONFIG.fallbackEmail +
      '?subject=' + encodeURIComponent('Estimate request — ' + data.name + ', ' + data.town) +
      '&body=' + encodeURIComponent(lines);

    say('ok', 'Opening your email app with the details filled in — just hit send. ' +
              'Or call us directly at ' + CONFIG.phoneDisplay + '.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Bot check: a real visitor never fills a field they cannot see.
    if (form.querySelector('[name="company"]').value) return;

    var ok = Object.keys(RULES).map(validateField).every(Boolean);
    if (!ok) {
      say('bad', 'Please fix the highlighted fields and try again.');
      var firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    var data = payload();

    if (!CONFIG.endpoint) { mailtoFallback(data); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    say('ok', 'Sending your request…');

    fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (CONFIG.redirect) { window.location.href = CONFIG.redirect; return; }
        form.reset();
        say('ok', 'Thanks — we have your request. Andrew will call you back shortly.');
      })
      .catch(function () {
        say('bad', "That didn't go through. Please call us at " + CONFIG.phoneDisplay +
                   ' and we\'ll take the details over the phone.');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request my free estimate';
      });
  });
})();
