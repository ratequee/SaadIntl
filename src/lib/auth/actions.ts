"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  clearAdminSession,
  createAdminSession,
  verifyLocalAdmin,
} from "./session";

export async function loginAction(_: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "missing" };
  }

  let ok = verifyLocalAdmin(email, password);

  if (!ok && isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      ok = !error;
    }
  }

  if (!ok) return { error: "invalid" };

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
