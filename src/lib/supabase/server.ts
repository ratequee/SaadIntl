import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseFetch,
  supabaseServiceKey,
  supabaseUrl,
} from "./config";

export function getSupabaseServer() {
  if (!isSupabaseConfigured()) return null;
  const key = supabaseServiceKey() || supabaseAnonKey();
  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: supabaseFetch },
  });
}
