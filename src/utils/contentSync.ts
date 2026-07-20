import { WebsiteContent } from '../context/WebsiteContext';

// IndexedDB utilities for storing large images
const DB_NAME = 'WeddingWebsiteDB';
const DB_VERSION = 1;
const IMAGES_STORE = 'images';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE);
      }
    };
  });
}

export async function saveImageToDB(key: string, base64Data: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([IMAGES_STORE], 'readwrite');
  const store = transaction.objectStore(IMAGES_STORE);
  await new Promise<void>((resolve, reject) => {
    const request = store.put(base64Data, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function loadImageFromDB(key: string): Promise<string | null> {
  const db = await openDB();
  const transaction = db.transaction([IMAGES_STORE], 'readonly');
  const store = transaction.objectStore(IMAGES_STORE);
  return new Promise<string | null>((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteImageFromDB(key: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([IMAGES_STORE], 'readwrite');
  const store = transaction.objectStore(IMAGES_STORE);
  await new Promise<void>((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function syncContentToDOM(content: WebsiteContent, tempImages?: { [key: string]: string }) {
  try {
    console.log('Starting DOM sync with content:', content);

    // Helper function to get image data
    const getImageData = async (imageValue: string) => {
      if (tempImages && tempImages[imageValue]) {
        return tempImages[imageValue];
      }
      if (imageValue.startsWith('db:')) {
        const imageKey = imageValue.slice(3);
        return await loadImageFromDB(imageKey);
      }
      return imageValue;
    };

    // Hero Section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && content.hero?.title) {
      heroTitle.innerHTML = content.hero.title
        .split('').map((char: string) => {
          if (char === 'W' || char === 'K') {
            return `<span class="swash">${char}</span>`;
          }
          return char;
        }).join('');
    }

  const heroMetas = document.querySelectorAll('.hero-meta');
  if (heroMetas.length >= 1) {
    const leftMeta = heroMetas[0];
    const dateText = leftMeta.querySelector('.label')?.textContent || 'the date';
    leftMeta.innerHTML = `<span class="label">${dateText}</span>${content.hero.date}`;
  }

  if (heroMetas.length >= 2) {
    const rightMeta = heroMetas[1];
    const placeText = rightMeta.querySelector('.label')?.textContent || 'the place';
    rightMeta.innerHTML = `<span class="label">${placeText}</span>${content.hero.place}`;
  }

  const heroImg = document.querySelector('.hero-image img') as HTMLImageElement;
  if (heroImg) {
    const imageData = await getImageData(content.hero.image);
    if (imageData) heroImg.src = imageData;
  }

  // Intro Section
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
  if (splitImg) {
    const imageData = await getImageData(content.intro.image);
    if (imageData) splitImg.src = imageData;
  }

  // Ceremony Section
  const ceremonyCard = document.querySelector('.ceremony-card');
  if (ceremonyCard) {
    const ceremonyRows = ceremonyCard.querySelectorAll('.ceremony-row .val');
    if (ceremonyRows.length >= 1) {
      ceremonyRows[0].innerHTML = `${content.ceremony.date}<br>${content.ceremony.time}`;
    }
    if (ceremonyRows.length >= 2) {
      ceremonyRows[1].innerHTML = content.ceremony.place;
    }
  }

  // Story Section
  const storyImg = document.querySelector('.story-img img') as HTMLImageElement;
  if (storyImg) {
    const imageData = await getImageData(content.story.image);
    if (imageData) storyImg.src = imageData;
  }

  const storyText = document.querySelector('.story-text');
  if (storyText) {
    const eyebrow = storyText.querySelector('.eyebrow');
    const h2 = storyText.querySelector('h2');
    const paragraphs = storyText.querySelectorAll('p');
    const sig = storyText.querySelector('.sig');

    if (eyebrow) eyebrow.textContent = content.story.eyebrow;
    if (h2) {
      h2.innerHTML = content.story.heading
        .split('started...').map((part: string, i: number) => {
          if (i === 0) return part;
          return `<span class="script">started...</span>`;
        }).join('');
    }
    if (paragraphs.length >= 1) paragraphs[0].textContent = content.story.paragraph1;
    if (paragraphs.length >= 2) paragraphs[1].textContent = content.story.paragraph2;
    if (sig) sig.textContent = content.story.signature;
  }

  // FAQ Section
  const faqSection = document.querySelector('.angled-red');
  if (faqSection) {
    const h2 = faqSection.querySelector('h2');
    const p = faqSection.querySelector('p');

    if (h2) {
      h2.innerHTML = `${content.faq.heading.split('...')[0]}<span class="script">...</span>`;
    }
    if (p) p.textContent = content.faq.paragraph;
  }

  // Travel Section
  const travelHead = document.querySelector('.travel-head');
  if (travelHead) {
    const eyebrow = travelHead.querySelector('.eyebrow');
    const h2 = travelHead.querySelector('h2');
    const p = travelHead.querySelector('p');

    if (eyebrow) eyebrow.textContent = content.travel.eyebrow;
    if (h2) h2.textContent = content.travel.heading;
    if (p) p.textContent = content.travel.paragraph;
  }

  // Registry Section
  const registryText = document.querySelector('.registry-text');
  if (registryText) {
    const eyebrow = registryText.querySelector('.eyebrow');
    const h2 = registryText.querySelector('h2');
    const p = registryText.querySelector('p');

    if (eyebrow) eyebrow.textContent = content.registry.eyebrow;
    if (h2) h2.textContent = content.registry.heading;
    if (p) p.textContent = content.registry.paragraph;
  }

  // Footer Section
  const footerBig = document.querySelector('.footer-big');
  const hashtag = document.querySelector('.hashtag');
  const footerBottom = document.querySelector('.footer-bottom div');

  if (footerBig) {
    const headingParts = content.footer.heading.split('soon');
    footerBig.innerHTML = headingParts[0] + '<span class="script">soon</span>' + (headingParts[1] || '');
    }
    if (hashtag) hashtag.textContent = content.footer.hashtag;
    if (footerBottom) footerBottom.textContent = content.footer.copyright;

    console.log('DOM sync completed successfully');
  } catch (error) {
    console.error('Error in syncContentToDOM:', error);
    throw error;
  }
}

export async function loadContentFromLocalStorage() {
  const savedContent = localStorage.getItem('weddingContent');
  if (savedContent) {
    try {
      const content = JSON.parse(savedContent);
      console.log('Loading content from localStorage:', content);
      await syncContentToDOM(content);
    } catch (e) {
      console.error('Failed to load content from localStorage:', e);
    }
  }
}
