import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { loadContent } from '../services/loadContent';
import { supabase } from '../lib/supabase';

export interface SectionSettings {
  [key: string]: {
    visible: boolean;
  };
}

export type PartialWebsiteContent = Partial<{
  hero: { title: string; date: string; place: string; image: string };
  intro: { eyebrow: string; heading: string; paragraph1: string; paragraph2: string; signature: string; image: string };
  ceremony: { date: string; time: string; place: string };
  story: { eyebrow: string; heading: string; paragraph1: string; paragraph2: string; signature: string; image: string };
  faq: { heading: string; paragraph: string; image: string; items: { question: string; answer: string }[] };
  travel: { eyebrow: string; heading: string; paragraph: string; cards: { tag: string; title: string; paragraph: string; image: string }[] };
  registry: { eyebrow: string; heading: string; paragraph: string };
  footer: { heading: string; hashtag: string; copyright: string };
  rsvp: { phoneNumber: string; enableWhatsApp: boolean };
}>;

export interface WebsiteContent {
  hero: {
    title: string;
    date: string;
    place: string;
    image: string;
  };
  intro: {
    eyebrow: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    signature: string;
    image: string;
  };
  ceremony: {
    date: string;
    time: string;
    place: string;
  };
  story: {
    eyebrow: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    signature: string;
    image: string;
  };
  faq: {
    heading: string;
    paragraph: string;
    image: string;
    items: { question: string; answer: string }[];
  };
  travel: {
    eyebrow: string;
    heading: string;
    paragraph: string;
    cards: { tag: string; title: string; paragraph: string; image: string }[];
  };
  registry: {
    eyebrow: string;
    heading: string;
    paragraph: string;
  };
  footer: {
    heading: string;
    hashtag: string;
    copyright: string;
  };
  rsvp: {
    phoneNumber: string;
    enableWhatsApp: boolean;
  };
}

export interface WebsiteContextType {
  content: WebsiteContent;
  sections: SectionSettings;
  updateContent: (section: keyof WebsiteContent, field: string, value: unknown) => void;
  updateNestedContent: (section: keyof WebsiteContent, path: string, value: unknown) => void;
  updateSection: (sectionName: string, visible: boolean) => void;
  saveContent: (siteId: string) => Promise<void>;
}

const defaultContent: WebsiteContent = {
  hero: {
    title: "WE'RE TYING THE KNOT!",
    date: "Friday, October 26, 2026 · 5:00 PM",
    place: "Safdie Foundry, San Francisco, CA",
    image: 'public/images/couple-hero.jpg',
  },
  intro: {
    eyebrow: 'a little note',
    heading: 'From the first hello to forever.',
    paragraph1: 'We met on a rainy Tuesday in a tiny bookshop in the Mission. He was looking for a Murakami. She was pretending to be. Three years later — here we are.',
    paragraph2: "We can't wait to celebrate with the people we love most. You.",
    signature: '— Emma & Jordan',
    image: 'public/images/couple-2.jpg',
  },
  ceremony: {
    date: 'October 26, 2026',
    time: '5:00 PM sharp',
    place: 'Safdie Foundry, San Francisco',
  },
  story: {
    eyebrow: 'our story',
    heading: 'How it started...',
    paragraph1: 'She ordered an oat-milk latte. He spilled his. What followed was a two-hour conversation about terrible movies, better books, and why neither of us could stand the smell of eucalyptus candles.',
    paragraph2: 'One apartment, two coastal moves, and a stubborn rescue dog named Pablo later — we still argue about the candles.',
    signature: 'Emma & Jordan, est. 2026',
    image: 'public/images/story.jpg',
  },
  faq: {
    heading: "You've Got Questions...",
    paragraph: "Dress code? Dogs allowed? Where to stay? Is there a late-night taco bar? (Yes.) We've answered all the big ones — and the weird ones — so you can show up ready to celebrate.",
    image: 'public/images/couple-3.jpg',
    items: [
      { question: 'What should I wear?', answer: 'Dress code is cocktail attire — think dressy but comfortable. We\'re going for elevated casual. No jeans, but you know what looks good on you. Wear colors! The venue is beautiful but we want you to feel like you.' },
      { question: 'Are dogs allowed?', answer: 'Yes! If you have a furry friend, we\'d love to have them celebrate with us (space permitting). Just let us know in your RSVP so we can plan accordingly and make sure they\'re comfortable.' },
      { question: 'Where should I stay?', answer: 'San Francisco has tons of options. We\'re recommending the SOMA and Mission Bay areas — both are 15-20 minutes from the venue. The Four Seasons is beautiful if you\'re splurging, or try the Pod Hotel for something more budget-friendly.' },
      { question: 'Is there a late-night taco bar?', answer: 'Yes! There absolutely is. After the main reception, we\'re heading to a secret late-night taco spot that\'s only open for our guests. Bring your appetite and your dancing shoes. More details in your welcome packet.' },
      { question: 'Can I bring a plus one?', answer: 'Your invitation will specify. If there\'s a plus-one line on your card, you\'re golden. If not, we\'d love to celebrate with you solo (or with your family if they\'re invited).' },
      { question: 'What time should I arrive?', answer: 'Doors open at 4:00 PM for cocktails. Ceremony starts at 5:00 PM sharp. We\'d love to see you early to settle in, have a drink, and soak in the vibe.' },
      { question: 'Is there parking?', answer: 'Yes! Valet parking is complimentary for all guests. Just pull up to the entrance and our team will take care of it.' },
      { question: 'What about dietary restrictions?', answer: 'Let us know on your RSVP! We\'re accommodating vegetarian, vegan, gluten-free, and allergy-friendly meals. Just be specific so our caterer can do it right.' },
    ],
  },
  travel: {
    eyebrow: 'travel & stay',
    heading: 'Come for the vows, stay for the city.',
    paragraph: "A loose guide to where we'd crash, eat, and wander if we had the weekend to do it over.",
    cards: [
      { tag: 'getting there', title: 'Fly into SFO or OAK', paragraph: 'SFO is a 20-min ride to the venue. OAK is 25. Both have reliable rideshare — Caltrain works too if you\'re feeling scenic.', image: 'public/images/travel-1.jpg' },
      { tag: 'where to stay', title: 'The Proper & The Battery', paragraph: 'Use code EMMA&JORDAN at checkout for the group rate. Both are under a mile from the Foundry.', image: 'public/images/travel-2.jpg' },
      { tag: 'eat & wander', title: 'Our favorite spots', paragraph: 'Tartine for the morning after. Zuni Cafe for Friday lunch. Lands End if your legs are up for a walk.', image: 'public/images/travel-3.jpg' },
    ],
  },
  registry: {
    eyebrow: 'the registry',
    heading: 'Your presence is the gift.',
    paragraph: 'We have chosen not to have a registry or request gifts. Being able to spend this time together and celebrate as a community is truly what matters most to us.',
  },
  footer: {
    heading: 'See you soon.',
    hashtag: '#EmmaAndJordan2026',
    copyright: '© 2026 webforwedd.com',
  },
  rsvp: {
    phoneNumber: '+1234567890',
    enableWhatsApp: true,
  },
};

const defaultSections: SectionSettings = {
  hero: { visible: true },
  intro: { visible: true },
  ceremony: { visible: true },
  story: { visible: true },
  faq: { visible: true },
  travel: { visible: true },
  registry: { visible: true },
  footer: { visible: true },
};

const defaultSiteId = 'default';

const isSupabaseConfigured = () => {
  return !!supabase && typeof supabase.from === 'function';
};

const getStoredSiteId = (): string => {
  try {
    const stored = localStorage.getItem('weddingSiteId');
    return stored || defaultSiteId;
  } catch {
    return defaultSiteId;
  }
};

const storeSiteId = (id: string) => {
  try {
    localStorage.setItem('weddingSiteId', id);
  } catch {
    // localStorage not available
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

interface WebsiteProviderProps {
  children: ReactNode;
}

export function WebsiteProvider({ children }: WebsiteProviderProps) {
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [sections, setSections] = useState<SectionSettings>(defaultSections);

  useEffect(() => {
    const siteId = getStoredSiteId();
    
    if (isSupabaseConfigured()) {
      loadContent(siteId)
        .then((data) => {
          if (data) {
            const mergedData = data as PartialWebsiteContent;
            setContent(prev => ({
              ...prev,
              ...mergedData,
              rsvp: {
                ...prev.rsvp,
                ...(mergedData.rsvp || {}),
              },
            }));
            storeSiteId(siteId);
          }
        })
        .catch(() => {
          // Silently fail — defaults will be used
        });
    }
  }, []);

  const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((acc, key) => acc[key] as Record<string, unknown>, obj);
    (target as Record<string, unknown>)[lastKey] = value;
    return { ...obj };
  };

  const updateContent = (section: keyof WebsiteContent, field: string, value: unknown) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      } as WebsiteContent[typeof section],
    }));
  };

  const updateNestedContent = (section: keyof WebsiteContent, path: string, value: unknown) => {
    setContent((prev) => ({
      ...prev,
      [section]: setNestedValue({ ...prev[section] }, path, value) as WebsiteContent[typeof section],
    }));
  };

  const updateSection = (sectionName: string, visible: boolean) => {
    setSections((prev) => ({
      ...prev,
      [sectionName]: { visible },
    }));
  };

  const saveContentToSupabase = async (siteId: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const result = await supabase
      .from('site_content')
      .upsert({
        site_id: siteId,
        data: {
          ...content,
          sections,
        },
        updated_at: new Date().toISOString(),
      });

    if (result.error) {
      // Silently fail — error will be caught by caller
    }
  };

  return (
    <WebsiteContext.Provider
      value={{
        content,
        sections,
        updateContent,
        updateNestedContent,
        updateSection,
        saveContent: saveContentToSupabase,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWebsiteContext() {
  const context = React.useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsiteContext must be used within WebsiteProvider');
  }
  return context;
}