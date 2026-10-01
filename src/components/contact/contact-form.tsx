"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/button";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { pushSiteToast } from "@/components/ui/site-toast";

const SUBJECTS = ["general", "designBuild", "projectManagement", "interiorDesign"] as const;

export function ContactForm({ locale, replyEmail }: { locale: string; replyEmail?: string }) {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "sending">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      pushSiteToast(t("error"), "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (response.status === 429) {
        pushSiteToast(t("rateLimit"), "error");
        return;
      }
      if (!response.ok) {
        pushSiteToast(t("error"), "error");
        return;
      }
      form.reset();
      pushSiteToast(t("success"));
    } catch {
      pushSiteToast(t("error"), "error");
    } finally {
      setStatus("idle");
    }
  }

  const field =
    "w-full rounded-xl border-0 bg-white px-5 py-3.5 text-ink placeholder:text-slate";

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="sr-only">{t("name")}</span>
          <input name="name" required minLength={2} placeholder={t("namePlaceholder")} className={field} />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="sr-only">{t("phone")}</span>
          <input
            name="phone"
            required
            minLength={6}
            dir="ltr"
            placeholder={t("phonePlaceholder")}
            className={field}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        <span className="sr-only">{t("email")}</span>
        <input name="email" type="email" required placeholder={t("emailPlaceholder")} className={field} />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="sr-only">{t("subject")}</span>
        <SelectDropdown
          name="subject"
          label={t("subject")}
          required
          defaultValue="general"
          triggerClassName={`${field} appearance-none`}
          menuClassName="overflow-hidden rounded-xl bg-white text-ink shadow-[var(--shadow)]"
          optionClassName="text-ink hover:bg-[#f3ead8]"
          selectedClassName="bg-[#f3ead8] font-medium text-ink"
          options={SUBJECTS.map((value) => ({
            value,
            label: t(`subjects.${value}`),
          }))}
        />
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
        <p className="mt-3 text-xs text-white/70">{t("note", { email: replyEmail || "Saad@rateq.qa" })}</p>
      </div>
    </form>
  );
}
