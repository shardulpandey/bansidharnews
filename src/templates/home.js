'use strict';

const { html } = require('../lib/helpers');
const { site, get, catUrl, catName, articles } = require('../lib/store');
const home = require('../data/home');
const { blockHead, leadBlock, columnBlock, singleBlock, promoBlock, mediaGrid, feedBlock } = require('../components/blocks');

function homeFeedItems() {
  const shown = new Set([
    ...home.khasKhabar, ...home.promo.items, ...home.latest, ...home.opinion, ...home.feature,
    ...home.sectionLead.items, ...home.sectionSide.items, ...home.singles.map((s) => s.id),
    ...home.media.items, home.spotlight.id,
  ]);
  return articles.filter((a) => !shown.has(a.id));
}

function render() {
  const ids = (list) => list.map(get);
  const feedAll = homeFeedItems();
  const feedInitial = feedAll.slice(0, home.feedInitial);
  const feedPages = Math.ceil((feedAll.length - home.feedInitial) / home.feedPageSize);

  const content = html`<h1 class="sr-only">${site.name}: ${site.tagline}</h1>
<div class="container">
<div class="row">
<section class="col col-8" aria-labelledby="h-khas">
${blockHead('ख़ास ख़बर', null).replace('<h2 class="block-head">', '<h2 class="block-head" id="h-khas">')}
${leadBlock(ids(home.khasKhabar), { eager: true })}
</section>
<div class="col col-4">
${promoBlock({ ...home.promo, items: ids(home.promo.items) })}
</div>
</div>

<div class="row">
<section class="col col-4">
${blockHead('ताज़ा-तरीन खबरें', '/latest/')}
${columnBlock(ids(home.latest), { ratio: '75%', bigDivider: 'dashed', listImage: false, listDivider: 'dashed' })}
</section>
<section class="col col-4">
${blockHead('मत-विमत', catUrl('mat-vimat'))}
${columnBlock(ids(home.opinion), { variant: 'opinion', ratio: '72%', bigExcerpt: true, bigDivider: '', bigSpace: 'sp-0 opinion-lead', listAuthor: false })}
</section>
<section class="col col-4">
${blockHead('फीचर', catUrl('feature'))}
${columnBlock(ids(home.feature), { ratio: '75%', bigExcerpt: true, bigDivider: 'dotted', listDate: false })}
</section>
</div>

<div class="row">
<section class="col col-8">
${blockHead(catName(home.sectionLead.cat), catUrl(home.sectionLead.cat))}
${leadBlock(ids(home.sectionLead.items))}
</section>
<section class="col col-4">
${blockHead(catName(home.sectionSide.cat), catUrl(home.sectionSide.cat))}
${columnBlock(ids(home.sectionSide.items), { ratio: '75%', bigDivider: 'dotted', listAuthor: false, listDate: false })}
</section>
</div>

<div class="row">
${home.singles.map(
    (s) => html`<section class="col col-4">
${blockHead(catName(s.cat), catUrl(s.cat))}
${singleBlock(get(s.id), { ratio: '65%' })}
</section>`
  )}
</div>

<div class="row">
<section class="col col-8">
${blockHead(catName(home.media.cat), catUrl(home.media.cat))}
${mediaGrid(ids(home.media.items))}
</section>
<section class="col col-4">
${blockHead(catName(home.spotlight.cat), catUrl(home.spotlight.cat))}
${singleBlock(get(home.spotlight.id), { ratio: '68%', excerpt: true, single: false })}
</section>
</div>

${feedBlock(feedInitial, { pages: feedPages, total: feedAll.length })}
</div>`;

  return {
    path: '/',
    current: 'home',
    bodyClass: 'home',
    content,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: `${site.name} (${site.nameEn})`,
        url: site.url + '/',
        inLanguage: 'hi',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${site.url}/search/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: site.nameEn,
        alternateName: site.name,
        url: site.url + '/',
        logo: site.url + site.logo.src2x,
        email: site.email,
      },
    ],
  };
}

module.exports = { render, homeFeedItems };
