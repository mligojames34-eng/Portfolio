(function () {
  'use strict';
  var root = document.documentElement;

  /* ================================================================
     POPUPS. To feature a new project later, change the first entry:
     id (a new id shows it again to everyone), text, image and links.
     trigger "time": shows after delay ms. trigger "scroll": shows once
     the visitor has read past depth (0 to 1) of the page.
     action "scroll" jumps to a section. action "gallery" opens a
     screenshot group ("web" or "admin"). A closed popup stays away for
     DAYS_QUIET days. No more than MAX_PER_VISIT show in one visit.
     ================================================================ */
  var POPUPS = [
    {
      id: 'igoabroad-new',
      trigger: 'time', delay: 3000,
      tag: 'New project',
      title: 'IGOABROAD is live',
      text: 'A study, work and live abroad website with its own admin panel, built for I Go Abroad Inc in Dar es Salaam.',
      image: 'images/igoabroad/home.webp',
      primary: { label: 'View the project', action: 'scroll', target: '#featured' },
      secondary: { label: 'Visit the live site', href: 'https://igoabroadinc.com' }
    },
    {
      id: 'similar-site',
      trigger: 'scroll', depth: 0.6,
      tag: 'Need a site like this?',
      title: 'A website you can edit yourself',
      text: 'Tell me about your business and I will reply on WhatsApp with what it would take.',
      image: 'images/igoabroad/admin-programmes.webp',
      primary: { label: 'Chat on WhatsApp', href: 'https://wa.me/255688787438?text=Hello%20James%2C%20I%20saw%20the%20IGOABROAD%20project%20and%20I%27d%20like%20a%20website%20like%20it.' },
      secondary: { label: 'See the admin panel', action: 'gallery', group: 'admin', target: '#gallery' }
    }
  ];
  var MAX_PER_VISIT = 2;
  var DAYS_QUIET = 7;

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
    if (metaTheme) metaTheme.setAttribute('content', d ? '#040A22' : '#0B1F5C');
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

  /* ---------- screenshot viewer (one image or a whole gallery) ---------- */
  var dlg = document.getElementById('viewer');
  var viewerOK = !!(dlg && typeof dlg.showModal === 'function');
  var vList = [], vIdx = 0;
  var vImg, vCap, vCount;
  function vShow(i) {
    vIdx = (i + vList.length) % vList.length;
    var it = vList[vIdx];
    vImg.src = it.src;
    vImg.alt = it.alt;
    vCap.textContent = it.cap;
    vCount.textContent = vList.length > 1 ? (vIdx + 1) + ' of ' + vList.length : '';
    dlg.classList.toggle('single', vList.length < 2);
  }
  function openViewer(list, i) {
    if (!viewerOK) return;
    vList = list;
    vShow(i);
    if (!dlg.open) dlg.showModal();
  }
  if (viewerOK) {
    vImg = dlg.querySelector('.vstage img');
    vCap = dlg.querySelector('.vcap');
    vCount = dlg.querySelector('.vcount');
    document.querySelectorAll('.shot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('noimg')) return;
        var img = btn.querySelector('img');
        openViewer([{ src: img.currentSrc || img.src, alt: img.alt, cap: img.alt }], 0);
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('.vclose').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.vnav.prev').addEventListener('click', function () { vShow(vIdx - 1); });
    dlg.querySelector('.vnav.next').addEventListener('click', function () { vShow(vIdx + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (vList.length < 2) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); vShow(vIdx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); vShow(vIdx + 1); }
    });
    var sx = null;
    var stage = dlg.querySelector('.vstage');
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null || vList.length < 2) { sx = null; return; }
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) vShow(vIdx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- featured project gallery ---------- */
  var gal = document.getElementById('gallery');
  var setGroup = function () {};
  if (gal) {
    var frame = gal.querySelector('.gal-frame');
    var frameImg = frame.querySelector('img');
    var urlEl = frame.querySelector('.u');
    var capTxt = gal.querySelector('.gc-txt');
    var capN = gal.querySelector('.gc-n');
    var tabs = Array.prototype.slice.call(gal.querySelectorAll('[role="tab"]'));
    var items = Array.prototype.slice.call(gal.querySelectorAll('.gt')).map(function (b) {
      return { btn: b, group: b.getAttribute('data-group'), src: b.getAttribute('data-src'), title: b.getAttribute('data-title'),
               note: b.getAttribute('data-note'), url: b.getAttribute('data-url'), phone: b.hasAttribute('data-phone') };
    });
    var group = 'web', current = items[0];
    var list = function () { return items.filter(function (it) { return it.group === group; }); };

    var select = function (it, scrollThumb) {
      current = it;
      var l = list(), idx = l.indexOf(it);
      items.forEach(function (x) { x.btn.setAttribute('aria-current', String(x === it)); });
      frameImg.src = it.src;
      frameImg.alt = it.title + '. ' + it.note;
      urlEl.textContent = it.url;
      frame.classList.toggle('is-phone', it.phone);
      capTxt.innerHTML = '';
      var b = document.createElement('b'); b.textContent = it.title;
      capTxt.appendChild(b); capTxt.appendChild(document.createTextNode(' ' + it.note));
      capN.textContent = (idx + 1) + ' of ' + l.length;
      if (scrollThumb && it.btn.scrollIntoView) { try { it.btn.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
    };
    setGroup = function (g) {
      group = g;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-group') === g;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      items.forEach(function (it) { it.btn.hidden = it.group !== g; });
      select(list()[0]);
    };
    var step = function (d) {
      var l = list(), i = l.indexOf(current);
      select(l[(i + d + l.length) % l.length], true);
    };

    items.forEach(function (it) { it.btn.addEventListener('click', function () { select(it); }); });
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { setGroup(t.getAttribute('data-group')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); setGroup(n.getAttribute('data-group'));
      });
    });
    gal.querySelector('.gn.prev').addEventListener('click', function () { step(-1); });
    gal.querySelector('.gn.next').addEventListener('click', function () { step(1); });
    frame.addEventListener('click', function () {
      var l = list();
      openViewer(l.map(function (it) { return { src: it.src, alt: it.title + '. ' + it.note, cap: it.title + '. ' + it.note }; }), l.indexOf(current));
    });
    /* Keep the viewer and the gallery in step when the viewer is closed. */
    if (viewerOK) {
      dlg.addEventListener('close', function () {
        var l = list();
        if (vList.length === l.length && vList[0] && vList[0].src === l[0].src) { select(l[vIdx] || l[0], true); }
      });
    }
  }

  /* ---------- popups ---------- */
  var pop = document.getElementById('pop');
  if (pop && POPUPS.length) {
    var pImg = pop.querySelector('.pop-img'), pTag = pop.querySelector('.pop-tag'), pT = pop.querySelector('.pop-t'),
        pP = pop.querySelector('.pop-p'), pA1 = pop.querySelector('.pop-a1'), pA2 = pop.querySelector('.pop-a2'),
        pX = pop.querySelector('.pop-x');
    var showing = null;
    var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    function ls(k, v) {
      try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
      return null;
    }
    function ss(k, v) {
      try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {}
      return null;
    }
    var shownCount = parseInt(ss('pf-pops') || '0', 10) || 0;
    var quiet = function (p) { var t = parseInt(ls('pf-pop-' + p.id) || '0', 10); return t && (Date.now() - t) < DAYS_QUIET * 864e5; };
    var dialogOpen = function () { return viewerOK && dlg.open; };
    var canShow = function (p) { return !showing && shownCount < MAX_PER_VISIT && !quiet(p) && !dialogOpen() && document.visibilityState === 'visible'; };

    var closePop = function (remember) {
      if (!showing) return;
      var p = showing; showing = null;
      if (remember) ls('pf-pop-' + p.id, String(Date.now()));
      pop.classList.remove('is-in');
      setTimeout(function () { if (!showing) pop.hidden = true; }, reduce ? 0 : 260);
    };
    var jump = function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      var h = el.querySelector('h3[tabindex]');
      if (h) setTimeout(function () { try { h.focus({ preventScroll: true }); } catch (e) {} }, reduce ? 0 : 600);
    };
    var wire = function (a, spec, p) {
      a.textContent = spec.label;
      a.removeAttribute('target'); a.removeAttribute('rel');
      a.onclick = null;
      if (spec.href) {
        a.setAttribute('href', spec.href);
        if (/^https?:/.test(spec.href)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
        a.onclick = function () { closePop(true); };
      } else {
        a.setAttribute('href', spec.target || '#');
        a.onclick = function (e) {
          e.preventDefault();
          if (spec.action === 'gallery') setGroup(spec.group || 'web');
          closePop(true);
          jump(spec.target);
        };
      }
    };
    var openPop = function (p) {
      showing = p; shownCount++; ss('pf-pops', String(shownCount));
      pImg.src = p.image; pTag.textContent = p.tag; pT.textContent = p.title; pP.textContent = p.text;
      wire(pA1, p.primary, p); wire(pA2, p.secondary, p);
      pop.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { pop.classList.add('is-in'); }); });
    };
    pX.addEventListener('click', function () { closePop(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && showing && !dialogOpen()) closePop(true);
    });

    POPUPS.forEach(function (p) {
      if (p.trigger === 'time') {
        var tries = 0;
        var attempt = function () {
          if (canShow(p)) { openPop(p); return; }
          if (!quiet(p) && ++tries < 6 && shownCount < MAX_PER_VISIT) setTimeout(attempt, 4000);
        };
        setTimeout(attempt, p.delay || 3000);
      } else if (p.trigger === 'scroll') {
        var fired = false;
        var onScroll = function () {
          if (fired) return;
          var h = document.documentElement.scrollHeight - window.innerHeight;
          if (h <= 0) return;
          if (window.scrollY / h >= (p.depth || 0.6)) {
            if (canShow(p)) { fired = true; window.removeEventListener('scroll', onScroll); openPop(p); }
          }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    });
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
