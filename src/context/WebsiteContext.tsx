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
  faq: { heading: string; paragraph: string };
  travel: { eyebrow: string; heading: string; paragraph: string };
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
  };
  travel: {
    eyebrow: string;
    heading: string;
    paragraph: string;
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
  updateContent: (section: keyof WebsiteContent, field: string, value: string | boolean) => void;
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
    signature: 'Emma & Jordan, est. 2032',
    image: 'public/images/story.jpg',
  },
  faq: {
    heading: "You've Got Questions...",
    paragraph: "Dress code? Dogs allowed? Where to stay? Is there a late-night taco bar? (Yes.) We've answered all the big ones — and the weird ones — so you can show up ready to celebrate.",
  },
  travel: {
    eyebrow: 'travel & stay',
    heading: 'Come for the vows, stay for the city.',
    paragraph: "A loose guide to where we'd crash, eat, and wander if we had the weekend to do it over.",
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
        .catch((error) => {
          console.error('Error loading content from Supabase:', error);
        });
    }
  }, []);

  const updateContent = (section: keyof WebsiteContent, field: string, value: string | boolean) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      } as WebsiteContent[typeof section],
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
      console.error('Supabase not configured');
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
      console.error('Error saving to Supabase:', result.error);
    }
  };

  return (
    <WebsiteContext.Provider
      value={{
        content,
        sections,
        updateContent,
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