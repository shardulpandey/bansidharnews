'use strict';

const { esc, html, initials } = require('../lib/helpers');
const { site, authors, authorUrl, byAuthor } = require('../lib/store');
const { breadcrumb } = require('./article');
const { searchForm } = require('../components/header');

function shell({ path, title, lead, body, crumbs }) {
  const content = html`<div class="container page">
<header class="archive__head">
${breadcrumb(crumbs || [{ label: 'होम', href: '/' }, { label: title }])}
<h1 class="archive__title">${esc(title)}</h1>
${lead ? `<p class="archive__desc">${esc(lead)}</p>` : ''}
</header>
${body}
</div>`;
  return { path, title, description: lead || site.description, current: null, bodyClass: 'static-page', content };
}

function about() {
  return shell({
    path: '/about/',
    title: 'हमारे बारे में',
    lead: `${site.motto}: ${site.name} (${site.nameEn})`,
    body: html`<div class="page__body">
<p>बंशीधर न्यूज़ (Banshidhar News) एक स्वतंत्र हिंदी डिजिटल समाचार मंच है। गढ़वा, पलामू और पूरे झारखंड की ज़मीनी खबरों के साथ हम देश, विदेश, अर्थव्यवस्था और खेल से जुड़ी तथ्य-आधारित पत्रकारिता करते हैं।</p>
<p>हमारा उद्देश्य बिना सनसनी के, प्राथमिक दस्तावेज़ों, सरकारी आंकड़ों और ज़मीनी संवाददाताओं की प्रत्यक्ष रिपोर्टों के माध्यम से पाठकों तक विश्वसनीय समाचार पहुंचाना है।</p>
<h2>हमारी प्रतिबद्धता</h2>
<ul>
<li>हर बड़ी खबर प्रकाशन से पहले संपादकीय डेस्क द्वारा क्रॉस-चेक की जाती है।</li>
<li>वायरल दावों की पड़ताल के लिए समर्पित फैक्ट-चेक डेस्क।</li>
<li>गलती होने पर स्पष्ट सुधार और पारदर्शिता।</li>
</ul>
</div>
<div class="info-grid">
<div class="info-card"><h3>संपादकीय ईमेल</h3><p><a href="mailto:${site.email}">${site.email}</a></p></div>
<div class="info-card"><h3>विज्ञापन एवं साझेदारी</h3><p><a href="mailto:${site.adsEmail}">${site.adsEmail}</a></p></div>
<div class="info-card"><h3>वेबसाइट</h3><p>${site.url.replace('https://', '')}</p></div>
</div>`,
  });
}

function contact() {
  return shell({
    path: '/contact/',
    title: 'संपर्क करें एवं खबर भेजें',
    lead: 'किसी खबर की जानकारी, प्रेस विज्ञप्ति, सुझाव या विज्ञापन पूछताछ के लिए नीचे दिया गया फॉर्म भरें।',
    body: html`<form class="form" data-contact-form data-to="${site.email}" novalidate>
<div class="form__row">
<div><label for="cf-name">आपका नाम</label><input id="cf-name" name="name" type="text" required autocomplete="name"></div>
<div><label for="cf-email">ईमेल</label><input id="cf-email" name="email" type="email" required autocomplete="email"></div>
</div>
<div><label for="cf-topic">विषय</label>
<select id="cf-topic" name="topic">
<option>खबर की जानकारी</option><option>प्रेस विज्ञप्ति</option><option>सुधार का अनुरोध</option><option>विज्ञापन पूछताछ</option><option>अन्य</option>
</select></div>
<div><label for="cf-message">संदेश</label><textarea id="cf-message" name="message" required></textarea></div>
<button class="form__submit" type="submit">संदेश भेजें</button>
<p class="form__note">"संदेश भेजें" दबाने पर आपका ईमेल ऐप इस संदेश के साथ खुलेगा, जिसे आप सीधे ${site.email} पर भेज सकते हैं।</p>
<p class="form__status" data-form-status aria-live="polite"></p>
</form>
<div class="info-grid">
<div class="info-card"><h3>संपादकीय विभाग</h3><p><a href="mailto:${site.email}">${site.email}</a></p></div>
<div class="info-card"><h3>विज्ञापन एवं साझेदारी</h3><p><a href="mailto:${site.adsEmail}">${site.adsEmail}</a></p></div>
<div class="info-card"><h3>ब्यूरो</h3><p>गढ़वा, मेदिनीनगर (पलामू) एवं रांची</p></div>
</div>`,
  });
}

function policy() {
  return shell({
    path: '/policy/',
    title: 'गोपनीयता एवं संपादकीय नीति',
    lead: 'पाठकों के विश्वास और निजता की रक्षा हमारी प्राथमिकता है।',
    body: html`<div class="page__body">
<h2>संपादकीय नीति</h2>
<p>बंशीधर न्यूज़ पर प्रकाशित हर खबर कम से कम दो स्वतंत्र स्रोतों से पुष्टि के बाद प्रकाशित की जाती है। राय और विश्लेषण वाले लेख "मत-विमत" श्रेणी में स्पष्ट रूप से अलग रखे जाते हैं।</p>
<h2>सुधार नीति</h2>
<p>किसी खबर में तथ्यात्मक त्रुटि पाए जाने पर हम उसे जल्द से जल्द सुधारते हैं और लेख के अंत में सुधार का उल्लेख करते हैं। सुधार के अनुरोध <a href="mailto:${site.email}">${site.email}</a> पर भेजे जा सकते हैं।</p>
<h2>तस्वीरों का उपयोग</h2>
<p>हमारी अपनी तस्वीरों के अलावा, कुछ प्रतीकात्मक तस्वीरें विकिमीडिया कॉमन्स से उनके मुक्त लाइसेंस की शर्तों के अनुसार, फोटोग्राफर के नाम और लाइसेंस के उल्लेख के साथ उपयोग की जाती हैं।</p>
<h2>गोपनीयता</h2>
<p>यह वेबसाइट पढ़ने के लिए किसी पंजीकरण की आवश्यकता नहीं है। टेक्स्ट साइज़ जैसी आपकी पसंद केवल आपके ब्राउज़र में सहेजी जाती है और हमारे सर्वर पर नहीं भेजी जाती।</p>
</div>`,
  });
}

function authorsIndex() {
  const cards = Object.keys(authors).map((k) => {
    const a = authors[k];
    const count = byAuthor(k).length;
    return `<a class="author-card" href="${authorUrl(k)}"><span class="author-box__avatar" aria-hidden="true">${esc(initials(a.name))}</span><span><span class="author-box__name">${esc(a.name)}</span><span class="author-box__role author-card__role">${esc(a.role)}</span><span class="author-box__role">${count} खबरें</span></span></a>`;
  });
  return shell({
    path: '/authors/',
    title: 'संपादकीय टीम व डेस्क',
    lead: 'बंशीधर न्यूज़ के ब्यूरो और डेस्क, जिनकी रिपोर्ट आप पढ़ते हैं।',
    body: `<div class="author-grid">${cards.join('')}</div>`,
  });
}

function notFound() {
  const page = {
    path: '/404.html',
    title: 'पेज नहीं मिला',
    current: null,
    noindex: true,
    bodyClass: 'not-found-page',
    content: html`<div class="container not-found">
<p class="not-found__code">404</p>
<h1>यह पेज उपलब्ध नहीं है</h1>
<p>हो सकता है लिंक बदल गया हो या पेज हटा दिया गया हो। नीचे खोजें या <a href="/">होम पेज</a> पर जाएं।</p>
${searchForm('search-404')}
</div>`,
  };
  return page;
}

module.exports = { about, contact, policy, authorsIndex, notFound };
