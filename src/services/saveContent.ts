import { supabase } from "../lib/supabase";
import { WebsiteContent, SectionSettings } from "../context/WebsiteContext";

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  description?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
}

export interface Settings {
  [key: string]: string | boolean | number;
}

export interface SaveContentData {
  hero: WebsiteContent['hero'];
  story: WebsiteContent['story'];
  gallery?: GalleryItem[];
  events?: EventItem[];
  venue: WebsiteContent['ceremony'];
  family?: FamilyMember[];
  rsvp: WebsiteContent['rsvp'];
  settings?: Settings;
  intro: WebsiteContent['intro'];
  faq: WebsiteContent['faq'];
  travel: WebsiteContent['travel'];
  registry: WebsiteContent['registry'];
  footer: WebsiteContent['footer'];
  sections: SectionSettings;
}

export async function saveContent(siteId: string, data: SaveContentData) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  console.log('saveContent - supabaseUrl:', supabaseUrl);
  console.log('saveContent - siteId:', siteId);

  if (!supabase || typeof supabase.from !== "function") {
    const err = new Error("Supabase not configured - check your .env file");
    console.error('saveContent - error:', err);
    return { error: err };
  }

  const result = await supabase
    .from("site_content")
    .upsert({
      site_id: siteId,
      data,
      updated_at: new Date().toISOString(),
    });

  console.log('saveContent - result:', result);
  return result;
}