import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const isValid =
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith("http") &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabasePublishableKey !== "your-publishable-key";

export const supabase = isValid
  ? createClient(supabaseUrl, supabasePublishableKey)
  : ({} as ReturnType<typeof createClient>);
