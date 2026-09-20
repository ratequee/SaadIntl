function firstEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function supabaseUrl() {
  return firstEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabaseAnonKey() {
  return firstEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export function supabaseServiceKey() {
  return firstEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && (supabaseServiceKey() || supabaseAnonKey()));
}

export function hasServiceRole() {
  return Boolean(supabaseServiceKey());
}
