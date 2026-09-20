import { updateSettingsAction } from "@/app/admin/actions";
import { Field } from "@/components/admin/field";
import { buttonClass } from "@/components/ui/button";
import { getSettings } from "@/lib/cms";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="display text-4xl">Settings</h1>
      <p className="mt-2 text-muted">Company details used across the public website.</p>
      <form action={updateSettingsAction} className="mt-8 grid max-w-3xl gap-5">
        <Field label="Company name (English)" name="company_en" defaultValue={settings.companyName.en} required />
        <Field label="Company name (Arabic)" name="company_ar" defaultValue={settings.companyName.ar} dir="rtl" required />
        <Field label="Tagline (English)" name="tagline_en" defaultValue={settings.tagline.en} />
        <Field label="Tagline (Arabic)" name="tagline_ar" defaultValue={settings.tagline.ar} dir="rtl" />
        <Field label="About (English)" name="about_en" defaultValue={settings.about.en} textarea />
        <Field label="About (Arabic)" name="about_ar" defaultValue={settings.about.ar} textarea dir="rtl" />
        <Field label="Email" name="email" type="email" defaultValue={settings.email} />
        <Field label="Phone" name="phone" defaultValue={settings.phone} />
        <Field label="Hours (English)" name="hours_en" defaultValue={settings.hours.en} />
        <Field label="Hours (Arabic)" name="hours_ar" defaultValue={settings.hours.ar} dir="rtl" />
        <Field label="Address (English)" name="address_en" defaultValue={settings.address.en} />
        <Field label="Address (Arabic)" name="address_ar" defaultValue={settings.address.ar} dir="rtl" />
        <Field label="Google Maps embed URL" name="mapEmbedUrl" defaultValue={settings.mapEmbedUrl} />
        <button type="submit" className={buttonClass("dark")}>Save settings</button>
      </form>
    </div>
  );
}
