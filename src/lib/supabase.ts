import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

const isValid =
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith("https://") &&
  supabasePublishableKey.startsWith("sb_publishable_");

export const supabase = isValid
  ? createClient(supabaseUrl, supabasePublishableKey)
  : ({} as ReturnType<typeof createClient>);