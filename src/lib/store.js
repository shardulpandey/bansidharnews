'use strict';

const { site, categories, nav, social, footer } = require('../data/site');
const authors = require('../data/authors');
const { articles: rawArticles, tags } = require('../data/articles');
const images = require('../data/images.json');

/** Category chain from root to the given slug, e.g. ['jharkhand', 'ranchi']. */
function catChain(slug) {
  const chain = [];
  let cur = slug;
  while (cur) {
    if (!categories[cur]) throw new Error(`Unknown category: ${cur}`);
    chain.unshift(cur);
    cur = categories[cur].parent;
  }
  return chain;
}

function catUrl(slug) {
  return `/category/${catChain(slug).join('/')}/`;
}

function catName(slug) {
  return categories[slug].name;
}

function childCats(slug) {
  return Object.keys(categories).filter((k) => categories[k].parent === slug);
}

function authorUrl(key) {
  return `/author/${key}/`;
}

function tagUrl(slug) {
  return `/tag/${slug}/`;
}

// Normalise and validate articles.
const articles = rawArticles
  .map((a) => {
    if (!authors[a.author]) throw new Error(`Unknown author ${a.author} in ${a.id}`);
    if (!images[a.image]) throw new Error(`Unknown image ${a.image} in ${a.id}`);
    (a.tags || []).forEach((t) => {
      if (!tags[t]) throw new Error(`Unknown tag ${t} in ${a.id}`);
    });
    const chain = catChain(a.cat);
    const firstPara = (a.body.find((p) => !p.startsWith('## ') && !p.startsWith('> ')) || '').replace(/^[^:]{2,25}:\s*/, '');
    return {
      ...a,
      chain,
      url: `/${chain.join('/')}/${a.slug}/${a.id}/`,
      excerpt: a.excerpt || truncate(firstPara, 190),
      authorData: { key: a.author, ...authors[a.author], url: authorUrl(a.author) },
      time: new Date(a.date).getTime(),
    };
  })
  .sort((x, y) => y.time - x.time);

const byId = new Map(articles.map((a) => [a.id, a]));
if (byId.size !== articles.length) throw new Error('Duplicate article ids');

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '...';
}

function get(id) {
  const a = byId.get(id);
  if (!a) throw new Error(`Unknown article id ${id}`);
  return a;
}

function inCat(article, slug) {
  return article.chain.includes(slug);
}

function byCat(slug) {
  return articles.filter((a) => inCat(a, slug));
}

function byAuthor(key) {
  return articles.filter((a) => a.author === key);
}

function byTag(slug) {
  return articles.filter((a) => (a.tags || []).includes(slug));
}

/** Previous = older story, next = newer story (chronological, like tagDiv next/prev). */
function neighbours(article) {
  const i = articles.indexOf(article);
  return { prev: articles[i + 1] || null, next: articles[i - 1] || null };
}

/** Related: same tag or category, newest first, excluding the article itself. */
function related(article, n = 3) {
  const score = (a) =>
    (a.tags || []).filter((t) => (article.tags || []).includes(t)).length * 2 +
    (a.cat === article.cat ? 2 : 0) +
    (a.chain[0] === article.chain[0] ? 1 : 0);
  return articles
    .filter((a) => a.id !== article.id)
    .map((a) => ({ a, s: score(a) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || y.a.time - x.a.time)
    .slice(0, n)
    .map((x) => x.a);
}

module.exports = {
  site, categories, nav, social, footer, authors, tags, articles, images,
  catChain, catUrl, catName, childCats, authorUrl, tagUrl, get, byCat, byAuthor, byTag, neighbours, related, truncate,
};
