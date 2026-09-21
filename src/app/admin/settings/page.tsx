import { getTranslations } from "next-intl/server";
import { SettingsForm } from "./settings-form";
import { getSettings } from "@/lib/cms";

export default async function AdminSettingsPage() {
  const t = await getTranslations("admin");
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display text-center text-4xl">{t("settings")}</h1>
      <p className="mt-2 text-center text-muted">{t("settingsLead")}</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
