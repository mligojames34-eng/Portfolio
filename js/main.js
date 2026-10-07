(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- theme: follow the system until the visitor chooses ---------- */
  var themeBtn = document.getElementById('theme');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  function saved() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function syncTheme() {
    var d = isDark();
    themeBtn.textContent = d ? 'Switch to light theme' : 'Switch to dark theme';
    themeBtn.setAttribute('aria-pressed', String(d));
    if (metaTheme) metaTheme.setAttribute('content', d ? '#0F1422' : '#F5F6F8');
  }
  var s = saved();
  if (s === 'dark' || s === 'light') root.setAttribute('data-theme', s);
  syncTheme();
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  if (window.matchMedia) {
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme); } catch (e) {}
  }

  /* ---------- local time in Dar es Salaam ---------- */
  var clocks = document.querySelectorAll('.clock');
  function tick() {
    var t;
    try {
      t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Dar_es_Salaam', hour: '2-digit', minute: '2-digit' }) + ' EAT';
    } catch (e) { return; }
    clocks.forEach(function (c) { c.textContent = t; });
  }
  tick();
  setInterval(tick, 30000);

  /* ---------- images that are missing fall back to a neutral placeholder ---------- */
  function onMissing(img, fn) {
    if (img.complete && img.naturalWidth === 0) { fn(); return; }
    img.addEventListener('error', fn);
  }
  var portrait = document.querySelector('.portrait img');
  if (portrait) onMissing(portrait, function () { portrait.remove(); });
  document.querySelectorAll('.shot').forEach(function (btn) {
    var img = btn.querySelector('img');
    if (!img) return;
    onMissing(img, function () { img.remove(); btn.classList.add('noimg'); btn.setAttribute('tabindex', '-1'); });
  });

  /* ---------- screenshot viewer ---------- */
  var dlg = document.getElementById('viewer');
  if (dlg && typeof dlg.showModal === 'function') {
    var vImg = dlg.querySelector('img');
    var vCap = dlg.querySelector('p');
    document.querySelectorAll('.shot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('noimg')) return;
        var img = btn.querySelector('img');
        vImg.src = img.currentSrc || img.src;
        vImg.alt = img.alt;
        vCap.textContent = img.alt;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('button').addEventListener('click', function () { dlg.close(); });
  }

  /* ---------- highlight the section being read ---------- */
  var links = {};
  document.querySelectorAll('.snav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
  function setCurrent(id) {
    Object.keys(links).forEach(function (k) {
      if (k === id) links[k].setAttribute('aria-current', 'true'); else links[k].removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { setCurrent(sections[i].id); return; }
      }
    }, { rootMargin: '-20% 0px -60% 0px' });
    sections.forEach(function (sec) { io.observe(sec); });
  }
  document.querySelectorAll('.snav a').forEach(function (a) {
    a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); });
  });

  /* ---------- opening a project in the ledger closes the others ---------- */
  var projects = document.querySelectorAll('.proj');
  projects.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      projects.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
