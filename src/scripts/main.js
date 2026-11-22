/* Banshidhar News: progressive enhancement for navigation, search, ticker,
   load-more, sharing, text size and the contact form. No dependencies. */
(function () {
  'use strict';

  var doc = document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Current date in IST (reference format: Saturday, 21 November, 2026) ---------- */
  function todayIST() {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
  }
  $$('[data-today]').forEach(function (el) { el.textContent = todayIST(); });

  /* ---------- Desktop dropdowns (hover is CSS; this adds click/keyboard support) ---------- */
  $$('.primary-nav__toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var item = btn.parentElement;
      var open = !item.classList.contains('is-open');
      $$('.primary-nav__item.is-open').forEach(function (i) {
        i.classList.remove('is-open');
        var t = $('.primary-nav__toggle', i);
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.primary-nav__item')) {
      $$('.primary-nav__item.is-open').forEach(function (i) {
        i.classList.remove('is-open');
        var t = $('.primary-nav__toggle', i);
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------- Sticky menu bar: show the small logo once the masthead scrolls away ---------- */
  var menubar = $('[data-menubar]');
  var masthead = $('.masthead');
  if (menubar && masthead && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      menubar.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(masthead);
  }

  /* ---------- Search panels ---------- */
  $$('[data-search-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = doc.getElementById(btn.getAttribute('data-search-target') || 'search-panel');
      if (!panel) return;
      var open = panel.hidden;
      panel.hidden = !open;
      $$('[data-search-toggle]').forEach(function (b) {
        if ((b.getAttribute('data-search-target') || 'search-panel') === panel.id) b.setAttribute('aria-expanded', String(open));
      });
      if (panel.classList.contains('search-panel--mobile')) doc.body.classList.toggle('has-overlay', open);
      if (open) { var input = $('input', panel); if (input) input.focus(); }
    });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var mobileSearch = doc.getElementById('search-panel-mobile');
    if (mobileSearch && !mobileSearch.hidden) doc.body.classList.remove('has-overlay');
    $$('.search-panel').forEach(function (p) { p.hidden = true; });
    $$('[data-search-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    closeMenu();
  });

  /* ---------- Mobile off-canvas menu ---------- */
  var menu = doc.getElementById('mobile-menu');
  var opener = $('[data-menu-open]');
  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('has-overlay');
    if (opener) opener.setAttribute('aria-expanded', 'true');
    var close = $('.mobile-menu__close', menu);
    if (close) close.focus();
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('has-overlay');
    if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus(); }
  }
  if (opener) opener.addEventListener('click', openMenu);
  $$('[data-menu-close]').forEach(function (el) { el.addEventListener('click', closeMenu); });
  $$('.mobile-nav__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = doc.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      if (sub) sub.hidden = !open;
    });
  });
  if (menu) {
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !menu.classList.contains('is-open')) return;
      var f = $$('a, button, input', $('.mobile-menu__panel', menu)).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ---------- Breaking news ticker ---------- */
  var ticker = $('[data-ticker-root]');
  if (ticker) {
    var items = $$('.ticker__item', ticker);
    var idx = 0;
    var paused = false;
    var hover = false;
    var timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pauseBtn = $('[data-ticker="pause"]', ticker);
    var show = function (n) {
      if (items.length < 2) return;
      var prev = items[idx];
      idx = (n + items.length) % items.length;
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      prev.setAttribute('aria-hidden', 'true');
      $('a', prev).setAttribute('tabindex', '-1');
      setTimeout(function () { prev.classList.remove('is-leaving'); }, 450);
      items[idx].classList.add('is-active');
      items[idx].removeAttribute('aria-hidden');
      $('a', items[idx]).removeAttribute('tabindex');
    };
    var schedule = function () {
      clearInterval(timer);
      if (!paused && !hover && !reduce) timer = setInterval(function () { show(idx + 1); }, 5000);
    };
    $('[data-ticker="prev"]', ticker).addEventListener('click', function () { show(idx - 1); schedule(); });
    $('[data-ticker="next"]', ticker).addEventListener('click', function () { show(idx + 1); schedule(); });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.setAttribute('aria-label', paused ? 'चलाएं' : 'रोकें');
        pauseBtn.innerHTML = paused
          ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
          : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        schedule();
      });
    }
    ticker.addEventListener('mouseenter', function () { hover = true; schedule(); });
    ticker.addEventListener('mouseleave', function () { hover = false; schedule(); });
    ticker.addEventListener('focusin', function () { hover = true; schedule(); });
    ticker.addEventListener('focusout', function () { hover = false; schedule(); });
    schedule();
  }

  /* ---------- Homepage "load more" feed ---------- */
  var feed = $('[data-feed]');
  var moreBtn = $('[data-feed-more]');
  if (feed && moreBtn) {
    var page = 0;
    var pages = parseInt(feed.getAttribute('data-feed-pages'), 10) || 0;
    var status = $('[data-feed-status]');
    moreBtn.addEventListener('click', function () {
      if (page >= pages) return;
      moreBtn.disabled = true;
      moreBtn.textContent = 'लोड हो रहा है...';
      fetch('/data/feed-' + (page + 1) + '.json')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          page += 1;
          feed.insertAdjacentHTML('beforeend', data.items.join(''));
          if (status) status.textContent = data.items.length + ' और खबरें जोड़ी गईं';
          if (page >= pages) {
            moreBtn.remove();
            if (status) status.textContent = 'आपने सभी खबरें देख लीं।';
          } else {
            moreBtn.disabled = false;
            moreBtn.textContent = 'और खबरें लोड करें';
          }
        })
        .catch(function () {
          moreBtn.disabled = false;
          moreBtn.textContent = 'फिर से कोशिश करें';
          if (status) status.textContent = 'खबरें लोड नहीं हो सकीं।';
        });
    });
  }

  /* ---------- Share: "More" uses the native share sheet or copies the link ---------- */
  $$('[data-share-more]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-url');
      var title = btn.getAttribute('data-title');
      var note = $('[data-share-note]', btn.parentElement);
      var done = function (msg) { if (note) { note.textContent = msg; setTimeout(function () { note.textContent = ''; }, 2500); } };
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () { /* dismissed */ });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { done('लिंक कॉपी हो गया'); }, function () { window.prompt('लिंक कॉपी करें:', url); });
      } else {
        window.prompt('लिंक कॉपी करें:', url);
      }
    });
  });

  /* ---------- Article text size (reference: "Text Size: A- A+") ---------- */
  var body = $('[data-article-body]');
  if (body) {
    var sizes = [16, 17, 18, 20, 22];
    var base = window.matchMedia('(max-width: 767px)').matches ? 1 : 2;
    var saved = parseInt(store.get('bn-text-size'), 10);
    var level = isNaN(saved) ? base : Math.max(0, Math.min(sizes.length - 1, saved));
    var apply = function () { body.style.setProperty('--body-fs', sizes[level] + 'px'); };
    if (!isNaN(saved)) apply();
    $$('[data-textsize] button').forEach(function (b) {
      b.addEventListener('click', function () {
        level = Math.max(0, Math.min(sizes.length - 1, level + parseInt(b.getAttribute('data-size'), 10)));
        apply();
        store.set('bn-text-size', String(level));
      });
    });
  }

  /* ---------- Search page ---------- */
  var results = $('[data-search-results]');
  if (results) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var countEl = $('[data-search-count]');
    var titleEl = $('[data-search-title]');
    var input = $('#search-page-input');
    if (input) input.value = q;
    if (!q) {
      countEl.textContent = 'कोई शब्द लिखकर खोजें, जैसे: गढ़वा, मौसम, हॉकी।';
    } else {
      titleEl.textContent = 'खोज परिणाम: ' + q;
      doc.title = 'खोज: ' + q + ' | बंशीधर न्यूज़';
      fetch('/data/search.json')
        .then(function (r) { return r.json(); })
        .then(function (index) {
          var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
          var scored = index.map(function (it) {
            var t = it.t.toLowerCase(), s = it.s.toLowerCase(), k = it.k.toLowerCase(), b = it.b.toLowerCase();
            var score = 0;
            for (var i = 0; i < terms.length; i++) {
              var term = terms[i], hit = 0;
              if (t.indexOf(term) > -1) hit += 5;
              if (k.indexOf(term) > -1) hit += 3;
              if (s.indexOf(term) > -1) hit += 2;
              if (b.indexOf(term) > -1) hit += 1;
              if (!hit) return null;
              score += hit;
            }
            return { it: it, score: score };
          }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });
          countEl.textContent = scored.length ? scored.length + ' खबरें मिलीं' : '"' + q + '" के लिए कोई खबर नहीं मिली। दूसरे शब्दों से खोजें।';
          results.innerHTML = scored.map(function (x) { return x.it.h; }).join('');
        })
        .catch(function () { countEl.textContent = 'खोज अभी उपलब्ध नहीं है, कृपया बाद में कोशिश करें।'; });
    }
  }

  /* ---------- Contact form: validates, then opens the reader's mail app ---------- */
  var form = $('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var statusEl = $('[data-form-status]', form);
      if (!form.checkValidity()) {
        statusEl.setAttribute('data-state', 'error');
        statusEl.textContent = 'कृपया नाम, सही ईमेल और संदेश भरें।';
        var bad = $(':invalid', form);
        if (bad) bad.focus();
        return;
      }
      var f = form.elements;
      var subject = '[' + f.topic.value + '] ' + f.name.value;
      var bodyText = f.message.value + '\n\n' + f.name.value + ' (' + f.email.value + ')';
      statusEl.removeAttribute('data-state');
      statusEl.textContent = 'आपका ईमेल ऐप खोला जा रहा है...';
      window.location.href = 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
    });
  }

  /* ---------- Back to top ---------- */
  var toTop = $('[data-back-to-top]');
  if (toTop) {
    var onScroll = function () { toTop.classList.toggle('is-visible', window.scrollY > 800); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      var main = doc.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    });
  }
})();
