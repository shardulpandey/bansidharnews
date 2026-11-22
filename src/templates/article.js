'use strict';

const { esc, html, formatDate, ratioImg, imageCredit, imageData, initials } = require('../lib/helpers');
const { icon } = require('../lib/icons');
const { site, catName, catUrl, tags, tagUrl, neighbours, related, articles } = require('../lib/store');
const { blockHead, popularWidget, latestWidget } = require('../components/blocks');
const { moduleBig } = require('../components/modules');

const POPULAR_IDS = [1062201, 1062195, 1062169, 1062163, 1062149];

function breadcrumb(items) {
  const parts = items.map((it, i) =>
    it.href && i < items.length - 1
      ? `<a href="${it.href}">${esc(it.label)}</a><span class="breadcrumb__sep" aria-hidden="true">›</span>`
      : `<span aria-current="page">${esc(it.label)}</span>`
  );
  return `<nav class="breadcrumb" aria-label="ब्रेडक्रंब">${parts.join('')}</nav>`;
}

function shareRow(a) {
  const url = encodeURIComponent(site.url + a.url);
  const text = encodeURIComponent(a.title);
  const btn = (key, href, label, iconName, extra = '') =>
    `<a class="share__btn share__btn--${key}" href="${href}" target="_blank" rel="noopener" aria-label="${label} पर साझा करें"${extra}>${icon(iconName)}<span class="sr-only">${label}</span></a>`;
  return html`<div class="share" data-share>
${btn('facebook', `https://www.facebook.com/sharer/sharer.php?u=${url}`, 'Facebook', 'facebook')}
${btn('x', `https://twitter.com/intent/tweet?text=${text}&url=${url}`, 'Twitter', 'x')}
${btn('linkedin', `https://www.linkedin.com/shareArticle?mini=true&url=${url}`, 'LinkedIn', 'linkedin')}
<a class="share__btn share__btn--email" href="mailto:?subject=${text}&body=${url}" aria-label="ईमेल से साझा करें">${icon('email')}<span class="sr-only">Email</span></a>
${btn('whatsapp', `https://api.whatsapp.com/send?text=${text}%20${url}`, 'WhatsApp', 'whatsapp')}
<button type="button" class="share__btn share__btn--more" data-share-more data-url="${site.url + a.url}" data-title="${esc(a.title)}" aria-label="और विकल्प: लिंक कॉपी करें या साझा करें">${icon('share')}<span class="sr-only">More</span></button>
<span class="share__note" data-share-note aria-live="polite"></span>
</div>`;
}

function bodyHtml(a, alsoRead) {
  const out = [];
  let paragraphs = 0;
  a.body.forEach((block) => {
    if (block.startsWith('## ')) {
      out.push(`<h2>${esc(block.slice(3))}</h2>`);
      return;
    }
    if (block.startsWith('> ')) {
      out.push(`<blockquote><p>${esc(block.slice(2))}</p></blockquote>`);
      return;
    }
    // Dateline ("रांची: ...") is set in bold, as on the source site.
    const m = paragraphs === 0 ? block.match(/^([^:]{2,25}):\s(.*)$/s) : null;
    out.push(m ? `<p><span class="dateline">${esc(m[1])}:</span> ${esc(m[2])}</p>` : `<p>${esc(block)}</p>`);
    paragraphs += 1;
    if (paragraphs === 2 && alsoRead) {
      out.push(`<aside class="also-read" aria-label="यह भी पढ़ें"><p class="also-read__rule" aria-hidden="true">* * *</p><p><strong>यह भी पढ़ें:</strong> <a href="${alsoRead.url}">${esc(alsoRead.title)}</a></p><p class="also-read__rule" aria-hidden="true">* * *</p></aside>`);
    }
  });
  return out.join('\n');
}

function render(a) {
  const { prev, next } = neighbours(a);
  const rel = related(a, 3);
  const alsoRead = rel[0] && a.body.length > 2 ? rel[0] : null;
  const crumbs = [{ label: 'होम', href: '/' }, ...a.chain.map((c) => ({ label: catName(c), href: catUrl(c) })), { label: a.title }];
  const popular = POPULAR_IDS.filter((id) => id !== a.id).slice(0, 3).map((id) => articles.find((x) => x.id === id));
  const latest = articles.filter((x) => x.id !== a.id).slice(0, 5);
  const im = imageData(a.image);
  const ratio = `${((im.h / im.w) * 100).toFixed(2)}%`;
  const heroRatio = parseFloat(ratio) > 75 ? '66.67%' : ratio;

  const content = html`<div class="container container--article">
<article class="article" data-article>
<header class="article__head">
${breadcrumb(crumbs)}
<a class="article__cat" href="${catUrl(a.cat)}">${esc(catName(a.cat))}</a>
<h1 class="article__title">${esc(a.title)}</h1>
${a.subtitle ? `<p class="article__subtitle">${esc(a.subtitle)}</p>` : ''}
<div class="article__byline">
<a class="article__author" href="${a.authorData.url}" rel="author">${esc(a.authorData.name)}</a>
<time class="article__date" datetime="${a.date}">${formatDate(a.date)}</time>
</div>
</header>
<div class="row">
<div class="col col-9 article__main">
${shareRow(a)}
<figure class="article__figure">
${ratioImg(a.image, heroRatio, { eager: true, sizes: '(max-width: 767px) 100vw, (max-width: 1018px) 470px, 830px' })}
<figcaption class="article__credit">${imageCredit(a.image)}</figcaption>
</figure>
<div class="textsize" data-textsize>
<span>Text Size:</span>
<button type="button" data-size="-1" aria-label="टेक्स्ट छोटा करें">A-</button>
<button type="button" data-size="1" aria-label="टेक्स्ट बड़ा करें">A+</button>
</div>
<div class="article__body" data-article-body>
${bodyHtml(a, alsoRead)}
</div>
${a.tags && a.tags.length ? html`<div class="tags"><span class="tags__label">Tags</span>${a.tags.map((t) => `<a href="${tagUrl(t)}" rel="tag">${esc(tags[t])}</a>`)}</div>` : ''}
${shareRow(a)}
<section class="author-box" aria-label="लेखक के बारे में">
<span class="author-box__avatar" aria-hidden="true">${esc(initials(a.authorData.name))}</span>
<div>
<a class="author-box__name" href="${a.authorData.url}">${esc(a.authorData.name)}</a>
<p class="author-box__role">${esc(a.authorData.role)}</p>
<p class="author-box__bio">${esc(a.authorData.bio)}</p>
<a class="author-box__link" href="${a.authorData.url}">सभी रिपोर्ट देखें</a>
</div>
</section>
<nav class="post-nav" aria-label="पिछली और अगली खबर">
${prev ? `<a class="post-nav__item post-nav__item--prev" href="${prev.url}" rel="prev"><span class="post-nav__label">‹ पिछली खबर</span><span class="post-nav__title">${esc(prev.title)}</span></a>` : '<span></span>'}
${next ? `<a class="post-nav__item post-nav__item--next" href="${next.url}" rel="next"><span class="post-nav__label">अगली खबर ›</span><span class="post-nav__title">${esc(next.title)}</span></a>` : '<span></span>'}
</nav>
${rel.length ? html`<section class="related" aria-labelledby="h-related">
${blockHead('संबंधित खबरें', null).replace('<h2 class="block-head">', '<h2 class="block-head" id="h-related">')}
<div class="related__grid">${rel.map((r) => moduleBig(r, { ratio: '65%', author: false, sizes: '(max-width: 767px) 30vw, 250px' }))}</div>
</section>` : ''}
</div>
<aside class="col col-3 sidebar" aria-label="साइडबार">
<div class="sidebar__sticky">
${popularWidget(popular)}
${latestWidget(latest)}
</div>
</aside>
</div>
</article>
</div>`;

  return {
    path: a.url,
    title: a.title,
    description: a.subtitle || a.excerpt,
    ogType: 'article',
    ogImage: `/images/articles/${a.image}-${im.widths[im.widths.length - 1]}.webp`,
    current: a.chain[0],
    bodyClass: 'single',
    content,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: a.title,
        description: a.subtitle || a.excerpt,
        image: [`${site.url}/images/articles/${a.image}-${im.widths[im.widths.length - 1]}.webp`],
        datePublished: a.date,
        dateModified: a.date,
        inLanguage: 'hi',
        articleSection: catName(a.cat),
        author: { '@type': 'Organization', name: a.authorData.name, url: site.url + a.authorData.url },
        publisher: { '@type': 'NewsMediaOrganization', name: site.nameEn, logo: { '@type': 'ImageObject', url: site.url + site.logo.src2x } },
        mainEntityOfPage: site.url + a.url,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.slice(0, -1).map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: site.url + c.href })),
      },
    ],
  };
}

module.exports = { render, breadcrumb };
