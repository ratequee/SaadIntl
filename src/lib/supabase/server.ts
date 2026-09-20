import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseServiceKey,
  supabaseUrl,
} from "./config";

export function getSupabaseServer() {
  if (!isSupabaseConfigured()) return null;
  const key = supabaseServiceKey() || supabaseAnonKey();
  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
