'use strict';

const { esc, html, num } = require('../lib/helpers');
const { icon } = require('../lib/icons');
const { site, articles, catName, catUrl, childCats, byCat } = require('../lib/store');
const { listCard } = require('../components/modules');
const { blockHead, columnBlock, latestWidget } = require('../components/blocks');
const { breadcrumb } = require('./article');
const { searchForm } = require('../components/header');

const PER_PAGE = 14; // reference category pages list 14 stories

function pageUrl(base, n) {
  return n === 1 ? base : `${base}page/${n}/`;
}

/** tagDiv style page-nav: 1 2 3 ... last, next arrow, and "पेज {total} का {current}". */
function pagination(base, current, total) {
  if (total <= 1) return '';
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3].forEach((p) => pages.add(p));
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const parts = [];
  if (current > 1) parts.push(`<a href="${pageUrl(base, current - 1)}" rel="prev" aria-label="पिछला पेज">${icon('chevronLeft')}</a>`);
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) parts.push('<span class="page-nav__dots">...</span>');
    parts.push(p === current ? `<span class="page-nav__current" aria-current="page">${num(p)}</span>` : `<a href="${pageUrl(base, p)}">${num(p)}</a>`);
  });
  if (current < total) parts.push(`<a href="${pageUrl(base, current + 1)}" rel="next" aria-label="अगला पेज">${icon('chevronRight')}</a>`);
  return `<nav class="page-nav" aria-label="पेज नेविगेशन">${parts.join('')}<span class="page-nav__info">पेज ${num(total)} का ${num(current)}</span></nav>`;
}

function sidebar(excludeIds = []) {
  const opinion = byCat('mat-vimat').slice(0, 3);
  const latest = articles.filter((a) => !excludeIds.includes(a.id)).slice(0, 5);
  return html`<aside class="col col-4 sidebar" aria-label="साइडबार">
<div class="sidebar__sticky">
<section class="widget">
${blockHead('मत-विमत', catUrl('mat-vimat'))}
${columnBlock(opinion, { variant: 'opinion', ratio: '72%', bigExcerpt: true, bigDivider: '', bigSpace: 'sp-0 opinion-lead', listAuthor: false })}
</section>
${latestWidget(latest)}
</div>
</aside>`;
}

/**
 * Generic paginated archive. Returns one page object per page number.
 * kind: category | tag | author | latest
 */
function archivePages({ base, title, description, items, crumbs, current = null, extraHead = '', kind = 'category' }) {
  const total = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const pages = [];
  for (let n = 1; n <= total; n += 1) {
    const slice = items.slice((n - 1) * PER_PAGE, n * PER_PAGE);
    const pageTitle = n > 1 ? `${title} (पेज ${n})` : title;
    const content = html`<div class="container">
<div class="row">
<div class="col col-8 archive">
<header class="archive__head">
${breadcrumb(crumbs)}
<h1 class="archive__title">${esc(title)}</h1>
${description ? `<p class="archive__desc">${esc(description)}</p>` : ''}
${extraHead}
</header>
${slice.length ? slice.map((a, i) => listCard(a, { eager: i === 0 })) : '<p class="empty-state">इस श्रेणी में अभी कोई खबर नहीं है।</p>'}
${pagination(base, n, total)}
</div>
${sidebar(slice.map((a) => a.id))}
</div>
</div>`;
    pages.push({
      path: pageUrl(base, n),
      title: pageTitle,
      description: description || `${title}: ${site.name} पर ${title} से जुड़ी ताज़ा खबरें।`,
      current,
      bodyClass: `archive-page archive-${kind}`,
      content,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: pageTitle,
          url: site.url + pageUrl(base, n),
          inLanguage: 'hi',
        },
      ],
    });
  }
  return pages;
}

function categoryPages(slug) {
  const chain = require('../lib/store').catChain(slug);
  const kids = childCats(slug);
  const extraHead = kids.length
    ? `<div class="subcats">${kids.map((k) => `<a href="${catUrl(k)}">${esc(catName(k))}</a>`).join('')}</div>`
    : '';
  return archivePages({
    base: catUrl(slug),
    title: catName(slug),
    items: byCat(slug),
    crumbs: [{ label: 'होम', href: '/' }, ...chain.map((c) => ({ label: catName(c), href: catUrl(c) }))],
    current: chain[0],
    extraHead,
  });
}

function searchPage() {
  const content = html`<div class="container">
<div class="row">
<div class="col col-8 archive search-page">
<header class="archive__head">
${breadcrumb([{ label: 'होम', href: '/' }, { label: 'खोज' }])}
<h1 class="archive__title" data-search-title>खोजें</h1>
${searchForm('search-page-input')}
</header>
<p class="search-count" data-search-count aria-live="polite"></p>
<div data-search-results></div>
<noscript><p class="empty-state">खोज के लिए जावास्क्रिप्ट आवश्यक है।</p></noscript>
</div>
${sidebar()}
</div>
</div>`;
  return { path: '/search/', title: 'खोज', current: null, bodyClass: 'archive-page search', content, noindex: true };
}

module.exports = { archivePages, categoryPages, searchPage, pagination, PER_PAGE };
