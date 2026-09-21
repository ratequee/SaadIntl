"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateSettingsAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { isNextRedirect, pushAdminToast, reportAdminForm } from "@/components/admin/admin-toast";
import { buttonClass, goldHoverClass } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      !reportAdminForm(form, {
        fieldRequired: (name) => t("fieldRequired", { name }),
        requiredFields: t("requiredFields"),
      })
    ) {
      return;
    }
    setSaving(true);
    try {
      await updateSettingsAction(new FormData(form));
      pushAdminToast(t("settingsSaved"));
      router.refresh();
    } catch (err) {
      if (isNextRedirect(err)) throw err;
      pushAdminToast(err instanceof Error ? err.message : t("couldNotSaveSettings"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5">
      <Field label={t("companyEn")} name="company_en" defaultValue={settings.companyName.en} dir="ltr" required />
      <Field label={t("companyAr")} name="company_ar" defaultValue={settings.companyName.ar} dir="rtl" required />
      <Field label={t("taglineEn")} name="tagline_en" defaultValue={settings.tagline.en} dir="ltr" required />
      <Field label={t("taglineAr")} name="tagline_ar" defaultValue={settings.tagline.ar} dir="rtl" required />
      <Field label={t("aboutEn")} name="about_en" defaultValue={settings.about.en} textarea dir="ltr" required />
      <Field label={t("aboutAr")} name="about_ar" defaultValue={settings.about.ar} textarea dir="rtl" required />
      <Field label={t("email")} name="email" type="email" defaultValue={settings.email} dir="ltr" required />
      <Field label={t("phone")} name="phone" defaultValue={settings.phone} dir="ltr" required />
      <Field label={t("hoursEn")} name="hours_en" defaultValue={settings.hours.en} dir="ltr" required />
      <Field label={t("hoursAr")} name="hours_ar" defaultValue={settings.hours.ar} dir="rtl" required />
      <Field label={t("addressEn")} name="address_en" defaultValue={settings.address.en} dir="ltr" required />
      <Field label={t("addressAr")} name="address_ar" defaultValue={settings.address.ar} dir="rtl" required />
      <Field
        label={t("mapEmbed")}
        name="mapEmbedUrl"
        defaultValue={settings.mapEmbedUrl}
        dir="ltr"
      />
      <button type="submit" disabled={saving} className={buttonClass("dark", goldHoverClass)}>
        {saving ? t("saving") : t("saveSettings")}
      </button>
    </form>
  );
}
