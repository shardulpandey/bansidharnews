'use strict';

// Homepage curation. Block order and block types follow the reference homepage:
// row 1: lead block (8) + promo (4); row 2: three column blocks (4/4/4);
// row 3: lead block (8) + column block (4); row 4: three single-story blocks;
// row 5: media grid (8) + single story with excerpt (4); then the load-more feed.
module.exports = {
  khasKhabar: [1062201, 1062199, 1062197, 1062195, 1062193],
  promo: {
    title: 'Fact Check',
    bubble: 'पड़ताल',
    subtitle: 'हमारी विशेष पेशकश',
    href: '/category/fact-check/',
    items: [1062191, 1062189, 1062187],
  },
  latest: [1062185, 1062183, 1062181, 1062179, 1062177],
  opinion: [1062175, 1062173, 1062171],
  feature: [1062169, 1062167, 1062165],
  sectionLead: { cat: 'jharkhand', items: [1062163, 1062161, 1062159, 1062157, 1062155] },
  sectionSide: { cat: 'desh', items: [1062153, 1062151] },
  singles: [
    { cat: 'garhwa', id: 1062149 },
    { cat: 'palamu', id: 1062147 },
    { cat: 'arthvyavastha', id: 1062145 },
  ],
  media: { cat: 'tasveeren', items: [1062143, 1062141, 1062139, 1062137] },
  spotlight: { cat: 'khel', id: 1062135 },
  feedInitial: 6,
  feedPageSize: 6,
};
