"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/button";

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "rateLimit">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (response.status === 429) {
        setStatus("rateLimit");
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-xl border-0 bg-white px-5 py-3.5 text-ink placeholder:text-slate";

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="sr-only">{t("name")}</span>
          <input name="name" required minLength={2} placeholder={t("namePlaceholder")} className={field} />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="sr-only">{t("phone")}</span>
          <input name="phone" required minLength={6} placeholder={t("phonePlaceholder")} className={field} />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        <span className="sr-only">{t("email")}</span>
        <input name="email" type="email" required placeholder={t("emailPlaceholder")} className={field} />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="sr-only">{t("subject")}</span>
        <select name="subject" required className={`${field} appearance-none`}>
          <option value="General contracting">{t("subjectPlaceholder")}</option>
          <option value="Design & build">Design & build</option>
          <option value="Project management">Project management</option>
          <option value="Interior design">Interior design</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        <span className="sr-only">{t("message")}</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={4}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-xl border-0 bg-white px-5 py-3.5 text-ink placeholder:text-slate"
        />
      </label>
      <div>
        <button type="submit" disabled={status === "sending"} className={buttonClass("gold")}>
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        <p className="mt-3 text-xs text-white/70">{t("note")}</p>
        {status === "success" ? <p className="mt-2 text-sm text-gold">{t("success")}</p> : null}
        {status === "error" ? <p className="mt-2 text-sm text-red-300">{t("error")}</p> : null}
        {status === "rateLimit" ? <p className="mt-2 text-sm text-red-300">{t("rateLimit")}</p> : null}
      </div>
    </form>
  );
}
