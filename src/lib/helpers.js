'use strict';

const images = require('../data/images.json');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Escape text for HTML content and attributes. */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tagged template helper: joins arrays and drops null/false. */
function html(strings, ...values) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < values.length) {
      const v = values[i];
      if (Array.isArray(v)) out += v.join('');
      else if (v !== null && v !== undefined && v !== false) out += v;
    }
  });
  return out;
}

/** Parse an ISO date and return its parts in IST (UTC+05:30). */
function istParts(iso) {
  const d = new Date(iso);
  const ist = new Date(d.getTime() + 330 * 60000);
  return {
    day: ist.getUTCDate(),
    month: ist.getUTCMonth(),
    year: ist.getUTCFullYear(),
    weekday: ist.getUTCDay(),
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
  };
}

/** Reference byline format: "21 November, 2026". */
function formatDate(iso) {
  const p = istParts(iso);
  return `${p.day} ${MONTHS[p.month]}, ${p.year}`;
}

/** Reference top-bar format: "Saturday, 21 November, 2026". */
function formatLongDate(iso) {
  const p = istParts(iso);
  return `${DAYS[p.weekday]}, ${p.day} ${MONTHS[p.month]}, ${p.year}`;
}

function formatTime(iso) {
  const p = istParts(iso);
  const h12 = p.hours % 12 || 12;
  return `${h12}:${String(p.minutes).padStart(2, '0')} ${p.hours < 12 ? 'am' : 'pm'} IST`;
}

/** Group digits Indian style for page counts, e.g. 1,000. */
function num(n) {
  return Number(n).toLocaleString('en-IN');
}

function imageData(key) {
  const img = images[key];
  if (!img) throw new Error(`Unknown image key: ${key}`);
  return img;
}

/**
 * Responsive <img>. `sizes` describes the rendered width; `eager` marks above-the-fold images.
 */
function img(key, { sizes = '100vw', eager = false, alt, className = '' } = {}) {
  const im = imageData(key);
  const srcset = im.widths.map((w) => `/images/articles/${key}-${w}.webp ${w}w`).join(', ');
  const fallback = im.widths.find((w) => w >= 640) || im.widths[im.widths.length - 1];
  return `<img src="/images/articles/${key}-${fallback}.webp" srcset="${srcset}" sizes="${esc(sizes)}" width="${im.w}" height="${im.h}" alt="${esc(alt != null ? alt : im.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${className ? ` class="${className}"` : ''}>`;
}

/** Ratio box around a responsive image (tagDiv td-image-wrap with padding-bottom). */
function ratioImg(key, ratio, opts = {}) {
  const im = imageData(key);
  const style = `--r:${ratio};${im.pos && im.pos !== '50% 50%' ? `--pos:${im.pos};` : ''}`;
  return `<span class="ratio" style="${style}">${img(key, opts)}</span>`;
}

function imageCredit(key) {
  const im = imageData(key);
  if (im.source === 'banshidhar') return `${esc(im.caption)} | फोटो: ${esc(im.credit)}`;
  const lic = im.licenseUrl
    ? `<a href="${esc(im.licenseUrl)}" rel="license noopener" target="_blank">${esc(im.license)}</a>`
    : esc(im.license);
  return `${esc(im.caption)} | फोटो: <a href="${esc(im.sourceUrl)}" rel="noopener" target="_blank">${esc(im.credit)}</a>/विकिमीडिया कॉमन्स, ${lic}`;
}

function initials(name) {
  return String(name).trim().charAt(0);
}

module.exports = {
  esc, html, formatDate, formatLongDate, formatTime, num, img, ratioImg, imageCredit, imageData, initials, MONTHS, DAYS,
};
