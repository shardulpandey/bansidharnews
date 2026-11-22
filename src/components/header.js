'use strict';

// Site header, measured from the live reference: dark top bar (round social
// icons, date, yellow button), logo row with the logo on the left, dark sticky
// menu bar with search on the right, mobile header, full-screen mobile menu
// and full-screen mobile search.
const { esc, html, formatLongDate } = require('../lib/helpers');
const { icon } = require('../lib/icons');
const { site, nav, social, catUrl, catName } = require('../lib/store');

function socialLinks(cls = 'social') {
  return html`<ul class="${cls}">${social.map(
    (s) => `<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.key)}</a></li>`
  )}</ul>`;
}

function logoImg(variant = 'logo', eager = true) {
  const l = variant === 'mark' ? site.logoMark : site.logo;
  // Width descriptors let the browser pick the sharp file when the masthead shows the logo larger than 1x.
  const sizes = variant === 'mark' ? '150px' : '(max-width: 1018px) 220px, 275px';
  return `<img src="${l.src}" srcset="${l.src} ${l.width}w, ${l.src2x} ${l.width * 2}w" sizes="${sizes}" width="${l.width}" height="${l.height}" alt="${esc(l.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
}

function searchForm(id, autofocus = false) {
  return html`<form class="search-form" action="/search/" method="get" role="search">
<label class="sr-only" for="${id}">खबरें खोजें</label>
<input id="${id}" type="search" name="q" placeholder="खबरें, विषय या जगह खोजें..." autocomplete="off" required${autofocus ? ' data-autofocus' : ''}>
<button type="submit">खोजें</button>
</form>`;
}

function desktopNav(current) {
  const items = nav.map((n) => {
    const isCurrent = current === n.cat;
    const kids = n.children || [];
    const subId = `sub-${n.cat}`;
    return html`<li class="primary-nav__item${kids.length ? ' has-children' : ''}${isCurrent ? ' is-current' : ''}">
<a class="primary-nav__link" href="${catUrl(n.cat)}"${isCurrent ? ' aria-current="page"' : ''}>${esc(catName(n.cat))}</a>${
      kids.length
        ? `<button type="button" class="primary-nav__toggle" aria-expanded="false" aria-controls="${subId}" aria-label="${esc(catName(n.cat))} उप-मेन्यू">${icon('chevronDown')}</button>
<ul class="sub-menu" id="${subId}">${kids.map((k) => `<li><a href="${catUrl(k)}">${esc(catName(k))}</a></li>`).join('')}</ul>`
        : ''
    }</li>`;
  });
  return html`<nav class="primary-nav" aria-label="मुख्य मेन्यू">
<ul class="primary-nav__list">
<li class="primary-nav__item${current === 'home' ? ' is-current' : ''}"><a class="primary-nav__link primary-nav__home" href="/" aria-label="होम"${current === 'home' ? ' aria-current="page"' : ''}>${icon('home')}</a></li>
${items}
</ul>
</nav>`;
}

function mobileNav(current) {
  const items = nav.map((n) => {
    const kids = n.children || [];
    const subId = `msub-${n.cat}`;
    return html`<li class="mobile-nav__item${current === n.cat ? ' is-current' : ''}">
<div class="mobile-nav__row"><a class="mobile-nav__link" href="${catUrl(n.cat)}">${esc(catName(n.cat))}</a>${
      kids.length
        ? `<button type="button" class="mobile-nav__toggle" aria-expanded="false" aria-controls="${subId}" aria-label="${esc(catName(n.cat))} उप-मेन्यू खोलें">${icon('chevronDown')}</button>`
        : ''
    }</div>${kids.length ? `<div class="mobile-nav__sub" id="${subId}" hidden>${kids.map((k) => `<a href="${catUrl(k)}">${esc(catName(k))}</a>`).join('')}</div>` : ''}
</li>`;
  });
  return html`<nav class="mobile-nav" aria-label="मोबाइल मेन्यू"><ul>
<li class="mobile-nav__item${current === 'home' ? ' is-current' : ''}"><div class="mobile-nav__row"><a class="mobile-nav__link" href="/">होम</a></div></li>
${items}
</ul></nav>`;
}

function header({ current, buildDate }) {
  const today = formatLongDate(buildDate);
  return html`<a class="skip-link" href="#main">मुख्य सामग्री पर जाएं</a>
<header class="site-header">
<div class="topbar">
<div class="container topbar__inner">
<div class="topbar__left">
${socialLinks('social social--round topbar__social')}
<span class="topbar__date" data-today>${today}</span>
</div>
<a class="topbar__cta" href="/contact/">अपनी खबर हमें भेजें!</a>
</div>
</div>
<div class="masthead">
<div class="container masthead__inner">
<a class="masthead__logo" href="/" aria-label="${esc(site.name)} होम">${logoImg('logo')}</a>
</div>
</div>
</header>
<div class="menu-bar" data-menubar>
<div class="container menu-bar__inner">
<a class="menu-bar__logo" href="/" tabindex="-1" aria-hidden="true">${logoImg('mark', false)}</a>
${desktopNav(current)}
<button type="button" class="menu-bar__search" data-search-toggle aria-expanded="false" aria-controls="search-panel" aria-label="खोजें">${icon('search')}</button>
<div class="search-panel" id="search-panel" hidden>
<div class="search-panel__inner">${searchForm('search-desktop')}</div>
</div>
</div>
</div>
<div class="mobile-header">
<button type="button" class="mobile-header__btn" data-menu-open aria-expanded="false" aria-controls="mobile-menu" aria-label="मेन्यू खोलें">${icon('menu')}</button>
<a class="mobile-header__logo" href="/" aria-label="${esc(site.name)} होम">${logoImg('mark')}</a>
<button type="button" class="mobile-header__btn" data-search-toggle data-search-target="search-panel-mobile" aria-expanded="false" aria-controls="search-panel-mobile" aria-label="खोजें">${icon('search')}</button>
</div>
<div class="search-panel search-panel--mobile" id="search-panel-mobile" role="dialog" aria-label="खोजें" hidden>
<button type="button" class="search-panel__close" data-search-toggle data-search-target="search-panel-mobile" aria-expanded="false" aria-controls="search-panel-mobile" aria-label="खोज बंद करें">${icon('close')}</button>
<form class="search-overlay" action="/search/" method="get" role="search">
<label class="search-overlay__label" for="search-mobile">खोजें</label>
<input id="search-mobile" type="search" name="q" autocomplete="off" required>
<button type="submit" class="sr-only">खोजें</button>
</form>
</div>
<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
<div class="mobile-menu__backdrop" data-menu-close></div>
<div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="मेन्यू">
<div class="mobile-menu__head">
${socialLinks('social mobile-menu__social')}
<button type="button" class="mobile-menu__close" data-menu-close aria-label="मेन्यू बंद करें">${icon('close')}</button>
</div>
${mobileNav(current)}
</div>
</div>`;
}

module.exports = { header, socialLinks, logoImg, searchForm };
