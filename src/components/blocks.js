'use strict';

// Homepage/section blocks, each mirroring a reference tagDiv block configuration.
const { esc, html } = require('../lib/helpers');
const { moduleBig, moduleSide, modulePromo, mediaTile, feedCard, popularItem } = require('./modules');

/** Section heading (reference h4.header.half). */
function blockHead(label, href, tag = 'h2') {
  const inner = href ? `<a href="${href}">${esc(label)}</a>` : esc(label);
  return `<${tag} class="block-head"><span>${inner}</span></${tag}>`;
}

/**
 * Lead block (reference tdi_19 / tdi_48, td_flex_block_3, 2 columns of 50%):
 * big story with 65% image and excerpt on the left, list with 30% thumbs on the right.
 */
function leadBlock(items, { eager = false, listAuthor = true, listDate = true } = {}) {
  const [first, ...rest] = items;
  return html`<div class="flexblock flexblock--lead flexblock--two">
<div class="flexblock__inner">
<div class="flexblock__col">${moduleBig(first, { ratio: '65%', excerpt: true, eager, cls: 'sp-0', sizes: '(max-width: 767px) 100vw, (max-width: 1018px) 240px, 370px' })}</div>
<div class="flexblock__col">${rest.map((a) => moduleSide(a, { cls: 'sp-13', author: listAuthor, date: listDate }))}</div>
</div>
</div>`;
}

/**
 * Column block (reference tdi_31 / tdi_41 / tdi_53, td_flex_block_3, 1 column):
 * big story (75% image) then list items. Divider style and list meta vary per block.
 */
function columnBlock(items, o = {}) {
  const {
    ratio = '75%', bigExcerpt = false, bigDivider = 'dashed', bigSpace = 'sp-15',
    listImage = true, listDivider = '', listAuthor = true, listDate = true, variant = 'column',
  } = o;
  const [first, ...rest] = items;
  const bigCls = `${bigSpace}${bigDivider ? ` div-${bigDivider}` : ''}`;
  const listCls = `sp-13${listDivider ? ` div-${listDivider}` : ''}`;
  return html`<div class="flexblock flexblock--${variant}">
<div class="flexblock__inner">
<div class="flexblock__col">
${moduleBig(first, { ratio, excerpt: bigExcerpt, cls: bigCls, sizes: '(max-width: 767px) 100vw, 370px' })}
${rest.map((a) => moduleSide(a, { image: listImage, cls: listCls, author: listAuthor, date: listDate }))}
</div>
</div>
</div>`;
}

/** Single-story block (reference tdi_60 / 65 / 70 and tdi_85). */
function singleBlock(a, { ratio = '65%', excerpt = false, single = true } = {}) {
  return moduleBig(a, { ratio, excerpt, single, sizes: '(max-width: 767px) 100vw, 370px' });
}

/** Promo block (reference tdi_22, td_block_template_18). */
function promoBlock({ title, bubble, subtitle, href, items }) {
  return html`<section class="promo" aria-labelledby="promo-title">
<h2 class="promo__title" id="promo-title"><a class="promo__title-text" href="${href}">${esc(title)}<span class="promo__bubble">${esc(bubble)}</span></a><span class="promo__subtitle">${esc(subtitle)}</span></h2>
<div class="promo__list">${items.map(modulePromo)}</div>
</section>`;
}

function mediaGrid(items) {
  return `<div class="media-grid">${items.map(mediaTile).join('')}</div>`;
}

function feedBlock(items, { pages, total }) {
  return html`<section class="feed" aria-labelledby="feed-title">
${blockHead('और खबरें', '/latest/').replace('<h2 class="block-head">', '<h2 class="block-head" id="feed-title">')}
<div class="feed__grid" data-feed data-feed-pages="${pages}" data-feed-total="${total}">${items.map(feedCard)}</div>
<div class="feed__more">${pages > 0 ? '<button type="button" class="btn-more" data-feed-more>और खबरें लोड करें</button>' : ''}</div>
<p class="feed__status" data-feed-status aria-live="polite"></p>
</section>`;
}

function popularWidget(items, label = 'लोकप्रिय') {
  return html`<section class="widget">
${blockHead(label, null, 'h2')}
<ol class="popular-list">${items.map(popularItem)}</ol>
</section>`;
}

function latestWidget(items) {
  return html`<section class="widget">
${blockHead('ताज़ा-तरीन खबरें', '/latest/', 'h2')}
${columnBlock(items, { ratio: '75%', listImage: false, listDivider: 'dashed' })}
</section>`;
}

module.exports = { blockHead, leadBlock, columnBlock, singleBlock, promoBlock, mediaGrid, feedBlock, popularWidget, latestWidget };
