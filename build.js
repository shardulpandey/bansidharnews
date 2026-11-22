'use strict';

// Static site build: renders every page into dist/, bundles CSS/JS, writes JSON
// for search and load-more, plus sitemap.xml, feed.xml and robots.txt.
// Usage: node build.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const store = require('./src/lib/store');
const { esc, formatDate } = require('./src/lib/helpers');
const { layout } = require('./src/components/layout');
const { feedCard, listCard } = require('./src/components/modules');
const homeTpl = require('./src/templates/home');
const articleTpl = require('./src/templates/article');
const listing = require('./src/templates/listing');
const pages = require('./src/templates/pages');
const homeData = require('./src/data/home');

const CSS_ORDER = ['fonts', 'tokens', 'base', 'header', 'blocks', 'article', 'listing', 'footer', 'pages'];

// BASE_PATH serves the site from a sub-folder (GitHub Pages project sites live
// at /<repo>/). NOINDEX=1 keeps a preview deployment out of search engines.
const BASE = (process.env.BASE_PATH || '').replace(/\/+$/, '');
const NOINDEX = process.env.NOINDEX === '1';

/** Prefix root-relative href, src, action and srcset URLs with BASE. */
function rebase(markup) {
  if (!BASE) return markup;
  const fix = (u) => (u.startsWith('/') && !u.startsWith('//') ? BASE + u : u);
  return markup
    .replace(/(\s(?:href|src|action)=")(\/[^"]*)"/g, (m, attr, u) => `${attr}${fix(u)}"`)
    .replace(/(\ssrcset=")([^"]*)"/g, (m, attr, v) => `${attr}${v.split(/,\s*/).map(fix).join(', ')}"`);
}

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function writePage(page, ctx) {
  const rel = page.path.endsWith('.html') ? page.path : path.join(page.path, 'index.html');
  write(rel, rebase(layout(NOINDEX ? { ...page, noindex: true } : page, ctx)));
  return page.path;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/ !important/g, '!important')
    .trim();
}

function build() {
  const started = Date.now();
  rmrf(DIST);
  copyDir(path.join(ROOT, 'public'), DIST);

  // Assets
  const css = minifyCss(CSS_ORDER.map((n) => fs.readFileSync(path.join(ROOT, 'src/styles', `${n}.css`), 'utf8')).join('\n'));
  const js = fs.readFileSync(path.join(ROOT, 'src/scripts/main.js'), 'utf8');
  const assetVersion = crypto.createHash('md5').update(css + js).digest('hex').slice(0, 8);
  write('assets/css/main.css', BASE ? css.replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}/`) : css);
  write('assets/js/main.js', BASE ? js.replace(/fetch\('\/data\//g, `fetch('${BASE}/data/`) : js);
  write('.nojekyll', '');

  const ctx = {
    assetVersion,
    buildDate: new Date().toISOString(),
    tickerItems: store.articles.slice(0, 8),
  };

  const urls = [];
  const add = (page) => urls.push(writePage(page, ctx));

  // Home
  add(homeTpl.render());

  // Articles
  store.articles.forEach((a) => add(articleTpl.render(a)));

  // Categories (every category, including sub-categories)
  Object.keys(store.categories).forEach((slug) => listing.categoryPages(slug).forEach(add));

  // Latest
  listing
    .archivePages({
      base: '/latest/',
      title: 'ताज़ा-तरीन खबरें',
      description: 'बंशीधर न्यूज़ की सभी खबरें, सबसे नई सबसे पहले।',
      items: store.articles,
      crumbs: [{ label: 'होम', href: '/' }, { label: 'ताज़ा-तरीन खबरें' }],
      kind: 'latest',
    })
    .forEach(add);

  // Authors
  Object.keys(store.authors).forEach((key) => {
    const au = store.authors[key];
    listing
      .archivePages({
        base: store.authorUrl(key),
        title: au.name,
        description: `${au.role}. ${au.bio}`,
        items: store.byAuthor(key),
        crumbs: [{ label: 'होम', href: '/' }, { label: 'लेखक', href: '/authors/' }, { label: au.name }],
        kind: 'author',
      })
      .forEach(add);
  });

  // Tags
  Object.keys(store.tags).forEach((slug) => {
    const items = store.byTag(slug);
    if (!items.length) return;
    listing
      .archivePages({
        base: store.tagUrl(slug),
        title: store.tags[slug],
        items,
        crumbs: [{ label: 'होम', href: '/' }, { label: 'टैग' }, { label: store.tags[slug] }],
        kind: 'tag',
      })
      .forEach(add);
  });

  // Search and static pages
  add(listing.searchPage());
  [pages.about(), pages.contact(), pages.policy(), pages.authorsIndex()].forEach(add);
  writePage(pages.notFound(), ctx);

  // Homepage load-more feed: pre-rendered card HTML in pages of N.
  const feedAll = homeTpl.homeFeedItems();
  const rest = feedAll.slice(homeData.feedInitial);
  for (let i = 0; i * homeData.feedPageSize < rest.length; i += 1) {
    const chunk = rest.slice(i * homeData.feedPageSize, (i + 1) * homeData.feedPageSize);
    write(`data/feed-${i + 1}.json`, JSON.stringify({ page: i + 1, items: chunk.map((a) => rebase(feedCard(a))) }));
  }

  // Search index: searchable text plus pre-rendered result card.
  const index = store.articles.map((a) => ({
    t: a.title,
    s: [a.subtitle, a.excerpt].filter(Boolean).join(' '),
    k: [store.catName(a.cat), a.authorData.name, ...(a.tags || []).map((t) => store.tags[t]), a.location || ''].join(' '),
    b: a.body.join(' ').slice(0, 600),
    h: rebase(listCard(a)),
  }));
  write('data/search.json', JSON.stringify(index));

  // Sitemap, RSS, robots
  const { site } = store;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .filter((u) => u !== '/search/')
    .map((u) => {
      const art = store.articles.find((a) => a.url === u);
      return `<url><loc>${site.url}${u}</loc>${art ? `<lastmod>${art.date}</lastmod>` : ''}</url>`;
    })
    .join('\n')}\n</urlset>\n`;
  write('sitemap.xml', sitemap);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(site.name)}</title>
<link>${site.url}/</link>
<atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
<description>${esc(site.description)}</description>
<language>hi</language>
${store.articles
  .slice(0, 30)
  .map(
    (a) => `<item><title>${esc(a.title)}</title><link>${site.url}${a.url}</link><guid>${site.url}${a.url}</guid><pubDate>${new Date(a.date).toUTCString()}</pubDate><category>${esc(store.catName(a.cat))}</category><description>${esc(a.excerpt)}</description></item>`
  )
  .join('\n')}
</channel>
</rss>
`;
  write('feed.xml', rss);
  write('robots.txt', NOINDEX ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${site.url}/sitemap.xml\n`);

  console.log(`Built ${urls.length + 1} pages in ${Date.now() - started} ms (assets v${assetVersion}). Latest story: ${formatDate(store.articles[0].date)}`);
}

build();
