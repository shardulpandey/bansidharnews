'use strict';

// Story modules: the card building blocks used by every block, list and widget.
const { esc, html, formatDate, ratioImg, img } = require('../lib/helpers');
const { catName, catUrl } = require('../lib/store');
const { icon } = require('../lib/icons');

/** "Author - 21 November, 2026" (reference byline format). */
function byline(a, { author = true, date = true } = {}) {
  if (!author && !date) return '';
  return html`<div class="module__byline">${author ? `<a class="module__author" href="${a.authorData.url}">${esc(a.authorData.name)}</a>` : ''}${author && date ? '<span class="module__sep"> - </span>' : ''}${date ? `<time class="module__date" datetime="${a.date}">${formatDate(a.date)}</time>` : ''}</div>`;
}

function title(a, tag = 'h3') {
  return `<${tag} class="module__title"><a href="${a.url}">${esc(a.title)}</a></${tag}>`;
}

/** Big module (tagDiv flex_1): image on top, title, byline, optional excerpt. */
function moduleBig(a, o = {}) {
  const { ratio = '65%', sizes = '(max-width: 767px) 100vw, 400px', excerpt = false, author = true, date = true, eager = false, cls = '', single = false, cat = false, headingTag = 'h3' } = o;
  return html`<div class="module module--big${single ? ' module--single' : ''} ${cls}">
<div class="module__container">
<a class="module__thumb" href="${a.url}" tabindex="-1" aria-hidden="true">${ratioImg(a.image, ratio, { sizes, eager, alt: '' })}</a>
<div class="module__meta">
${cat ? `<a class="module__cat" href="${catUrl(a.cat)}">${esc(catName(a.cat))}</a>` : ''}
${title(a, headingTag)}
${byline(a, { author, date })}
${excerpt ? `<p class="module__excerpt">${esc(a.excerpt)}</p>` : ''}
</div>
</div>
</div>`;
}

/** List module (tagDiv flex_3): 30% side image or text only. */
function moduleSide(a, o = {}) {
  const { ratio = '70%', image = true, author = true, date = true, cls = '' } = o;
  return html`<div class="module ${image ? 'module--side' : 'module--text'} ${cls}">
<div class="module__container">
${image ? `<a class="module__thumb" href="${a.url}" tabindex="-1" aria-hidden="true">${ratioImg(a.image, ratio, { sizes: '(max-width: 767px) 30vw, 130px', alt: '' })}</a>` : ''}
<div class="module__meta">
${title(a)}
${byline(a, { author, date })}
</div>
</div>
</div>`;
}

/** Promo module (reference tdi_22): image 45%, 60% ratio, radius 5px, title 16/24. */
function modulePromo(a) {
  return html`<div class="module module--promo">
<div class="module__container">
<a class="module__thumb" href="${a.url}" tabindex="-1" aria-hidden="true">${ratioImg(a.image, '60%', { sizes: '(max-width: 767px) 45vw, 170px', alt: '' })}</a>
<div class="module__meta">${title(a)}${byline(a, { date: false })}</div>
</div>
</div>`;
}

/** Media tile (reference video block: 210px high items). */
function mediaTile(a) {
  return html`<a class="media-tile" href="${a.url}">
${img(a.image, { sizes: '(max-width: 767px) 100vw, 380px', alt: '' })}
<span class="media-tile__body">
<span class="media-tile__badge">${icon('camera')}तस्वीरें</span>
<span class="media-tile__title">${esc(a.title)}</span>
</span>
</a>`;
}

/** Feed card used by the homepage feed and load-more (also rendered client side). */
function feedCard(a) {
  return html`<div class="module feed-card">
<div class="module__container">
<a class="module__thumb" href="${a.url}" tabindex="-1" aria-hidden="true">${ratioImg(a.image, '65%', { sizes: '(max-width: 767px) 30vw, 380px', alt: '' })}</a>
<div class="module__meta">
<a class="module__cat" href="${catUrl(a.cat)}">${esc(catName(a.cat))}</a>
${title(a)}
${byline(a)}
</div>
</div>
</div>`;
}

/** Archive list card (category, tag, author, search pages). */
function listCard(a, { eager = false } = {}) {
  return html`<article class="module list-card">
<div class="module__container">
<a class="module__thumb" href="${a.url}" tabindex="-1" aria-hidden="true">${ratioImg(a.image, '65%', { sizes: '(max-width: 767px) 30vw, 270px', eager, alt: '' })}</a>
<div class="module__meta">
${title(a, 'h2')}
${byline(a)}
<p class="module__excerpt">${esc(a.excerpt)}</p>
<a class="list-card__more" href="${a.url}">और पढ़ें<span class="sr-only">: ${esc(a.title)}</span></a>
</div>
</div>
</article>`;
}

/** Popular widget item (reference article sidebar: title, author - date). */
function popularItem(a) {
  return html`<li class="popular-item"><div class="module__meta">${title(a)}${byline(a)}</div></li>`;
}

module.exports = { byline, moduleBig, moduleSide, modulePromo, mediaTile, feedCard, listCard, popularItem };
