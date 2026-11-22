'use strict';

// Document shell: <head> metadata, header, ticker, main content, footer.
const { esc, html } = require('../lib/helpers');
const { site } = require('../lib/store');
const { header } = require('./header');
const { ticker, footer } = require('./footer');

function layout(page, ctx) {
  const {
    title, description = site.description, path = '/', ogImage, ogType = 'website', current, content,
    jsonLd = [], bodyClass = '', noindex = false, preloadImage, showTicker = bodyClass === 'home',
  } = page;
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} (${site.nameEn}): ${site.tagline}`;
  const canonical = site.url + path;
  const image = ogImage ? site.url + ogImage : site.url + '/images/brand/logo@2x.png';
  return html`<!doctype html>
<html lang="hi" id="top">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/svg+xml" href="/images/brand/favicon.svg">
<link rel="preload" href="/fonts/noto-sans-devanagari-devanagari.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/mukta-600-devanagari.woff2" as="font" type="font/woff2" crossorigin>
${preloadImage || ''}
<link rel="stylesheet" href="/assets/css/main.css?v=${ctx.assetVersion}">
<meta property="og:site_name" content="${esc(site.name)} (${site.nameEn})">
<meta property="og:locale" content="${site.locale}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title || fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title || fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="/feed.xml">
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)}
<script src="/assets/js/main.js?v=${ctx.assetVersion}" defer></script>
</head>
<body class="${bodyClass}">
${header({ current, buildDate: ctx.buildDate })}
${showTicker ? ticker(ctx.tickerItems) : ''}
<main id="main" class="main${bodyClass === 'home' ? ' main--home' : ''}" tabindex="-1">
${content}
</main>
${footer({ year: new Date(ctx.buildDate).getUTCFullYear() })}
</body>
</html>
`;
}

module.exports = { layout };
