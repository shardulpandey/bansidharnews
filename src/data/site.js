'use strict';

// Central site configuration: brand, navigation, categories, social links, footer.

const site = {
  name: 'बंशीधर न्यूज़',
  nameEn: 'Banshidhar News',
  url: 'https://banshidharnews.com',
  tagline: 'खबरों की पड़ताल, तथ्यों के साथ',
  motto: 'तथ्य पहले, राय बाद में',
  description:
    'बंशीधर न्यूज़ (Banshidhar News): गढ़वा, पलामू, झारखंड, देश, विदेश, अर्थव्यवस्था और खेल की तथ्य-आधारित हिंदी खबरें।',
  email: 'editor@banshidharnews.in',
  adsEmail: 'ads@banshidharnews.in',
  locale: 'hi_IN',
  logo: {
    src: '/images/brand/logo.png',
    src2x: '/images/brand/logo@2x.png',
    width: 256,
    height: 84,
    alt: 'बंशीधर न्यूज़ लोगो',
  },
  logoMark: {
    src: '/images/brand/logo-mark.png',
    src2x: '/images/brand/logo-mark@2x.png',
    width: 256,
    height: 61,
    alt: 'बंशीधर न्यूज़',
  },
};

// Category registry. `parent` builds the hierarchy used by breadcrumbs and listings.
const categories = {
  garhwa: { name: 'गढ़वा', parent: 'jharkhand' },
  palamu: { name: 'पलामू', parent: 'jharkhand' },
  jharkhand: { name: 'झारखण्ड' },
  ranchi: { name: 'रांची', parent: 'jharkhand' },
  apradh: { name: 'अपराध', parent: 'jharkhand' },
  rajniti: { name: 'राजनीति' },
  desh: { name: 'देश' },
  'vigyan-tech': { name: 'विज्ञान-टेक्नॉलॉजी', parent: 'desh' },
  health: { name: 'हेल्थ', parent: 'desh' },
  education: { name: 'एजुकेशन', parent: 'desh' },
  arthvyavastha: { name: 'अर्थव्यवस्था' },
  videsh: { name: 'विदेश' },
  khel: { name: 'खेल' },
  'mat-vimat': { name: 'मत-विमत' },
  sampadkiya: { name: 'संपादकीय', parent: 'mat-vimat' },
  '50-shabdon-mein-mat': { name: '50 शब्दों में मत', parent: 'mat-vimat' },
  'samaj-sanskriti': { name: 'समाज-संस्कृति' },
  feature: { name: 'फीचर' },
  'fact-check': { name: 'फैक्ट-चेक' },
  tasveeren: { name: 'तस्वीरों में' },
};

// Primary navigation (mirrors the reference: home icon, flat items, three dropdowns).
const nav = [
  { cat: 'garhwa' },
  { cat: 'palamu' },
  { cat: 'jharkhand', children: ['ranchi', 'apradh'] },
  { cat: 'rajniti' },
  { cat: 'desh', children: ['vigyan-tech', 'health', 'education'] },
  { cat: 'arthvyavastha' },
  { cat: 'videsh' },
  { cat: 'khel' },
  { cat: 'mat-vimat', children: ['sampadkiya', '50-shabdon-mein-mat'] },
  { cat: 'samaj-sanskriti' },
];

const social = [
  { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' },
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/' },
  { key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
  { key: 'x', label: 'X (Twitter)', url: 'https://x.com/' },
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' },
];

const footer = {
  sections: [
    { label: 'फैक्ट-चेक', href: '/category/fact-check/' },
    { label: 'फीचर', href: '/category/feature/' },
    { label: 'तस्वीरों में', href: '/category/tasveeren/' },
    { label: 'ताज़ा-तरीन खबरें', href: '/latest/' },
    { label: 'लेखक व डेस्क', href: '/authors/' },
    { label: 'खोजें', href: '/search/' },
  ],
  menu: [
    { label: 'हमारे बारे में', href: '/about/' },
    { label: 'संपर्क', href: '/contact/' },
    { label: 'गोपनीयता व संपादकीय नीति', href: '/policy/' },
    { label: 'लेखक', href: '/authors/' },
    { label: 'साइटमैप', href: '/sitemap.xml' },
  ],
};

module.exports = { site, categories, nav, social, footer };
