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

const FETCH_TIMEOUT_MS = 5000;
const UNAVAILABLE_STATUSES = new Set([502, 503, 504, 520, 521, 522, 523, 524, 542, 544, 546]);

export function isSupabaseUnavailable(error: unknown) {
  if (!error) return false;
  const record = typeof error === "object" ? (error as Record<string, unknown>) : null;
  const code = String(record?.code || "");
  if (/^PGRST/i.test(code) || /^23\d{3}$/.test(code) || code === "42501") return false;
  const text = [
    error instanceof Error ? error.message : "",
    error instanceof Error && error.cause ? String(error.cause) : "",
    String(record?.message || ""),
    String(record?.details || ""),
    String(record?.hint || ""),
    typeof error === "string" ? error : "",
  ].join(" ");
  return /paused|inactive|unavailable|fetch failed|failed to fetch|network|econnreset|enotfound|etimedout|timeout|aborted|aborterror|502|503|504|520|521|522|523|524|542|544|546/i.test(
    text,
  );
}

export async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    if (init?.signal) {
      if (init.signal.aborted) controller.abort();
      else init.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    const response = await fetch(input, { ...init, signal: controller.signal });
    if (UNAVAILABLE_STATUSES.has(response.status)) {
      throw new Error(`Supabase unavailable (${response.status})`);
    }
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Supabase unavailable (timeout)");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
