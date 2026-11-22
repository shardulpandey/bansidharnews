'use strict';

const { esc, html, formatTime } = require('../lib/helpers');
const { icon } = require('../lib/icons');
const { site, social, footer: footerData, nav, catUrl, catName } = require('../lib/store');
const { logoImg } = require('./header');

/** Breaking news ticker (reference has none; styled in the reference's block language). */
function ticker(items) {
  return html`<div class="ticker" data-ticker-root role="region" aria-label="ब्रेकिंग न्यूज़">
<div class="container ticker__inner">
<span class="ticker__label"><span class="ticker__dot" aria-hidden="true"></span>ब्रेकिंग</span>
<div class="ticker__viewport" aria-live="off">
<ul class="ticker__track">${items.map(
    (a, i) => `<li class="ticker__item${i === 0 ? ' is-active' : ''}"${i === 0 ? '' : ' aria-hidden="true"'}><span class="ticker__time">${formatTime(a.date).replace(' IST', '')}</span><a href="${a.url}"${i === 0 ? '' : ' tabindex="-1"'}>${esc(a.title)}</a></li>`
  )}</ul>
</div>
<div class="ticker__controls">
<button type="button" class="ticker__btn" data-ticker="prev" aria-label="पिछली खबर">${icon('chevronLeft')}</button>
<button type="button" class="ticker__btn" data-ticker="pause" aria-label="रोकें" aria-pressed="false">${icon('pause')}</button>
<button type="button" class="ticker__btn" data-ticker="next" aria-label="अगली खबर">${icon('chevronRight')}</button>
</div>
</div>
</div>`;
}

function footer({ year }) {
  return html`<footer class="site-footer">
<div class="container footer-main">
<div class="footer-brand">
<a href="/" aria-label="${esc(site.name)} होम">${logoImg('logo', false)}</a>
<p class="footer-brand__about">बंशीधर न्यूज़ एक स्वतंत्र हिंदी डिजिटल समाचार मंच है, जो गढ़वा, पलामू और पूरे झारखंड के साथ देश-दुनिया की तथ्य-आधारित खबरें पाठकों तक पहुंचाता है।</p>
<p class="footer-brand__contact">हमें संपर्क करें: <a href="mailto:${site.email}">${site.email}</a></p>
</div>
<div>
<h2 class="footer-title">समाचार श्रेणियां</h2>
<ul class="footer-links footer-cats">${nav.map((n) => `<li><a href="${catUrl(n.cat)}">${esc(catName(n.cat))}</a></li>`)}</ul>
</div>
<div>
<h2 class="footer-title">फॉलो करें</h2>
<ul class="footer-social">${social.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.key)}</a></li>`)}</ul>
<h2 class="footer-title footer-title--spaced">बंशीधर न्यूज़ पर और</h2>
<ul class="footer-links">${footerData.sections.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`)}</ul>
</div>
</div>
<div class="footer-bottom">
<div class="container footer-bottom__inner">
<p class="footer-copy">Copyright © ${year} Banshidhar News. All rights reserved.</p>
<ul class="footer-menu">${footerData.menu.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`)}</ul>
</div>
</div>
</footer>
<a class="back-to-top" href="#top" data-back-to-top aria-label="ऊपर जाएं">${icon('chevronDown')}</a>`;
}

module.exports = { ticker, footer };
