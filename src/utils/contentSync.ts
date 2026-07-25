import { WebsiteContent } from '../context/WebsiteContext';
import DOMPurify from 'dompurify';

export function syncContentToDOM(content: WebsiteContent) {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && content.hero?.title) {
    heroTitle.innerHTML = DOMPurify.sanitize(
      content.hero.title
        .split('').map((char: string) => {
          if (char === 'W' || char === 'K') {
            return `<span class="swash">${char}</span>`;
          }
          return char;
        }).join('')
    );
  }

  const heroMetas = document.querySelectorAll('.hero-meta');
  if (heroMetas.length >= 1) {
    const leftMeta = heroMetas[0];
    const dateText = leftMeta.querySelector('.label')?.textContent || 'the date';
    leftMeta.innerHTML = DOMPurify.sanitize(`<span class="label">${dateText}</span>${content.hero.date}`);
  }

  if (heroMetas.length >= 2) {
    const rightMeta = heroMetas[1];
    const placeText = rightMeta.querySelector('.label')?.textContent || 'the place';
    rightMeta.innerHTML = DOMPurify.sanitize(`<span class="label">${placeText}</span>${content.hero.place}`);
  }

  const heroImg = document.querySelector('.hero-image img') as HTMLImageElement;
  if (heroImg && content.hero.image) {
    heroImg.src = content.hero.image;
  }

  const splitCard = document.querySelector('.split-card');
  if (splitCard) {
    const eyebrow = splitCard.querySelector('.eyebrow');
    const h2 = splitCard.querySelector('h2');
    const paragraphs = splitCard.querySelectorAll('p');
    const signature = splitCard.querySelector('.signature');

    if (eyebrow) eyebrow.textContent = content.intro.eyebrow;
    if (h2) h2.textContent = content.intro.heading;
    if (paragraphs.length >= 1) paragraphs[0].textContent = content.intro.paragraph1;
    if (paragraphs.length >= 2) paragraphs[1].textContent = content.intro.paragraph2;
    if (signature) signature.textContent = content.intro.signature;
  }

  const splitImg = document.querySelector('.split-img-wrap img') as HTMLImageElement;
  if (splitImg && content.intro.image) {
    splitImg.src = content.intro.image;
  }

  const ceremonyCard = document.querySelector('.ceremony-card');
  if (ceremonyCard) {
    const ceremonyRows = ceremonyCard.querySelectorAll('.ceremony-row .val');
    if (ceremonyRows.length >= 1) {
      ceremonyRows[0].innerHTML = DOMPurify.sanitize(`${content.ceremony.date}<br>${content.ceremony.time}`);
    }
    if (ceremonyRows.length >= 2) {
      ceremonyRows[1].innerHTML = DOMPurify.sanitize(content.ceremony.place);
    }
  }

  const storyImg = document.querySelector('.story-img img') as HTMLImageElement;
  if (storyImg && content.story.image) {
    storyImg.src = content.story.image;
  }

  const storyText = document.querySelector('.story-text');
  if (storyText) {
    const eyebrow = storyText.querySelector('.eyebrow');
    const h2 = storyText.querySelector('h2');
    const paragraphs = storyText.querySelectorAll('p');
    const sig = storyText.querySelector('.sig');

    if (eyebrow) eyebrow.textContent = content.story.eyebrow;
    if (h2) {
      h2.innerHTML = DOMPurify.sanitize(
        content.story.heading
          .split('started...').map((part: string, i: number) => {
            if (i === 0) return part;
            return `<span class="script">started...</span>`;
          }).join('')
      );
    }
    if (paragraphs.length >= 1) paragraphs[0].textContent = content.story.paragraph1;
    if (paragraphs.length >= 2) paragraphs[1].textContent = content.story.paragraph2;
    if (sig) sig.textContent = content.story.signature;
  }

  const faqSection = document.querySelector('.angled-red');
  if (faqSection) {
    const h2 = faqSection.querySelector('h2');
    const p = faqSection.querySelector('p');

    if (h2) {
      h2.innerHTML = DOMPurify.sanitize(`${content.faq.heading.split('...')[0]}<span class="script">...</span>`);
    }
    if (p) p.textContent = content.faq.paragraph;
  }

  const faqImg = document.querySelector('#faq .angled-img img') as HTMLImageElement;
  if (faqImg && content.faq.image) {
    faqImg.src = content.faq.image;
  }

  const travelHead = document.querySelector('.travel-head');
  if (travelHead) {
    const eyebrow = travelHead.querySelector('.eyebrow');
    const h2 = travelHead.querySelector('h2');
    const p = travelHead.querySelector('p');

    if (eyebrow) eyebrow.textContent = content.travel.eyebrow;
    if (h2) h2.textContent = content.travel.heading;
    if (p) p.textContent = content.travel.paragraph;
  }

  const travelCards = document.querySelectorAll('.travel-card');
  if (content.travel.cards && travelCards.length >= content.travel.cards.length) {
    content.travel.cards.forEach((card, index) => {
      const cardEl = travelCards[index];
      if (!cardEl) return;
      const tag = cardEl.querySelector('.tag');
      const h3 = cardEl.querySelector('h3');
      const p = cardEl.querySelector('p');
      const img = cardEl.querySelector('img') as HTMLImageElement;

      if (tag) tag.textContent = card.tag;
      if (h3) h3.textContent = card.title;
      if (p) p.textContent = card.paragraph;
      if (img && card.image) img.src = card.image;
    });
  }

  const registryText = document.querySelector('.registry-text');
  if (registryText) {
    const eyebrow = registryText.querySelector('.eyebrow');
    const h2 = registryText.querySelector('h2');
    const p = registryText.querySelector('p');

    if (eyebrow) eyebrow.textContent = content.registry.eyebrow;
    if (h2) h2.textContent = content.registry.heading;
    if (p) p.textContent = content.registry.paragraph;
  }

  const footerBig = document.querySelector('.footer-big');
  const hashtag = document.querySelector('.hashtag');

  if (footerBig) {
    const headingParts = content.footer.heading.split('soon');
    footerBig.innerHTML = DOMPurify.sanitize(headingParts[0] + '<span class="script">soon</span>' + (headingParts[1] || ''));
  }
  if (hashtag) hashtag.textContent = content.footer.hashtag;
}