"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";

export function LoginForm() {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
      <form action={action} className="w-full max-w-md rounded-[2rem] bg-background p-8 shadow-[var(--shadow)]">
        <Logo />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">{t("loginTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("loginLead")}</p>
        <label className="mt-8 grid gap-2 text-sm">
          {t("email")}
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            dir="ltr"
            className="rounded-full border border-border px-4 py-3"
          />
        </label>
        <label className="mt-4 grid gap-2 text-sm">
          {t("password")}
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            dir="ltr"
            className="rounded-full border border-border px-4 py-3"
          />
        </label>
        {state?.error === "invalid" ? (
          <p className="mt-3 text-sm text-red-700">{t("invalid")}</p>
        ) : null}
        {state?.error === "missing" ? (
          <p className="mt-3 text-sm text-red-700">{t("missing")}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className={buttonClass(
            "dark",
            "mt-6 w-full hover:bg-gold hover:text-espresso dark:hover:bg-gold dark:hover:text-espresso",
          )}
        >
          {pending ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
}
