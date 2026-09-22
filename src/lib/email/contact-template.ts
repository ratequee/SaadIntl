import { siteUrl } from "@/lib/utils";

export const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL?.trim() || "Saad@rateq.qa";

export const SUBJECT_LABELS: Record<string, { en: string; ar: string }> = {
  general: { en: "General contracting", ar: "مقاولات عامة" },
  designBuild: { en: "Design & build", ar: "تصميم وتنفيذ" },
  projectManagement: { en: "Project management", ar: "إدارة المشاريع" },
  interiorDesign: { en: "Interior design", ar: "التصميم الداخلي" },
  "General contracting": { en: "General contracting", ar: "مقاولات عامة" },
  "Design & build": { en: "Design & build", ar: "تصميم وتنفيذ" },
  "Project management": { en: "Project management", ar: "إدارة المشاريع" },
  "Interior design": { en: "Interior design", ar: "التصميم الداخلي" },
};

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  locale: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function withBreaks(value: string) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}

export function subjectLabels(subject: string) {
  return SUBJECT_LABELS[subject] || { en: subject, ar: subject };
}

function fieldRow(labelEn: string, labelAr: string, valueHtml: string, ltr = false) {
  const dir = ltr ? ' dir="ltr" style="direction:ltr;text-align:left;"' : "";
  return `
    <tr>
      <td style="padding:14px 22px;border-bottom:1px solid #eee6d6;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C8A36A;font-weight:700;">
              ${labelEn}
            </td>
            <td align="right" dir="rtl" style="font-size:12px;color:#C8A36A;font-weight:700;font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">
              ${labelAr}
            </td>
          </tr>
        </table>
        <p${dir} style="margin:8px 0 0;font-size:16px;line-height:1.55;color:#12171C;">${valueHtml}</p>
      </td>
    </tr>
  `;
}

export function contactEmailSubject(payload: ContactEmailPayload) {
  const labels = subjectLabels(payload.subject);
  return `New enquiry / استفسار جديد — ${payload.name} · ${labels.en}`;
}

export function contactEmailText(payload: ContactEmailPayload) {
  const labels = subjectLabels(payload.subject);
  return [
    "SAAD International Projects W.L.L.",
    "New project enquiry / استفسار مشروع جديد",
    "",
    `Name / الاسم: ${payload.name}`,
    `Email / البريد: ${payload.email}`,
    `Phone / الهاتف: ${payload.phone}`,
    `Subject / الموضوع: ${labels.en} / ${labels.ar}`,
    "",
    payload.message,
  ].join("\n");
}

export function contactEmailHtml(payload: ContactEmailPayload) {
  const labels = subjectLabels(payload.subject);
  const logo = siteUrl("/brand/logo-sd-256.png");
  const origin = siteUrl();
  const localeNote =
    payload.locale === "ar"
      ? "Submitted from the Arabic site."
      : "Submitted from the English site.";
  const localeNoteAr =
    payload.locale === "ar" ? "أُرسل من النسخة العربية للموقع." : "أُرسل من النسخة الإنجليزية للموقع.";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New enquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#12171C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12171C;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:28px;overflow:hidden;">
            <tr>
              <td style="height:6px;background:#C8A36A;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 28px 18px;background:#151B21;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="48" valign="middle">
                      <img src="${logo}" alt="SAAD International" width="40" height="40" style="display:block;border-radius:999px;border:1px solid #C8A36A;" />
                    </td>
                    <td valign="middle" style="padding-left:12px;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C8A36A;font-weight:700;">SAAD International</p>
                      <p style="margin:4px 0 0;font-size:15px;color:#F1E6D3;font-weight:600;">Projects W.L.L.</p>
                    </td>
                    <td align="right" dir="rtl" valign="middle" style="font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">
                      <p style="margin:0;font-size:13px;color:#C8A36A;">سعد الدولية</p>
                      <p style="margin:4px 0 0;font-size:12px;color:#F1E6D3;">للمشاريع ذ.م.م.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" width="50%" style="padding-right:12px;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C8A36A;font-weight:700;">New project enquiry</p>
                      <p style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#12171C;font-weight:700;">A visitor wants to start a project.</p>
                      <p style="margin:8px 0 0;font-size:13px;color:#56626E;">${localeNote}</p>
                    </td>
                    <td valign="top" width="50%" align="right" dir="rtl" style="padding-left:12px;font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">
                      <p style="margin:0;font-size:13px;color:#C8A36A;font-weight:700;">استفسار مشروع جديد</p>
                      <p style="margin:8px 0 0;font-size:20px;line-height:1.45;color:#12171C;font-weight:700;">زائر يرغب في بدء مشروع.</p>
                      <p style="margin:8px 0 0;font-size:13px;color:#56626E;">${localeNoteAr}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EA;border-radius:20px;overflow:hidden;">
                  ${fieldRow("Name", "الاسم", escapeHtml(payload.name))}
                  ${fieldRow("Email", "البريد", `<a href="mailto:${escapeHtml(payload.email)}" style="color:#12171C;text-decoration:none;">${escapeHtml(payload.email)}</a>`, true)}
                  ${fieldRow("Phone", "الهاتف", `<a href="tel:${escapeHtml(payload.phone.replace(/\s/g, ""))}" style="color:#12171C;text-decoration:none;">${escapeHtml(payload.phone)}</a>`, true)}
                  ${fieldRow("Subject", "الموضوع", `${escapeHtml(labels.en)} <span style="color:#C8A36A;">·</span> <span dir="rtl" style="font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">${escapeHtml(labels.ar)}</span>`)}
                  ${fieldRow("Message", "الرسالة", withBreaks(payload.message))}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:16px 18px;border:1px solid #eadcc3;border-radius:16px;background:#fff;">
                      <p style="margin:0;font-size:13px;color:#56626E;">Reply directly to this email to contact the sender.</p>
                      <p dir="rtl" style="margin:6px 0 0;font-size:13px;color:#56626E;font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">للرد على المرسل، استخدم الرد على هذه الرسالة.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px;background:#F7F3EA;">
                <p style="margin:0;font-size:12px;color:#56626E;">SAAD International Projects W.L.L. · Qatar</p>
                <p dir="rtl" style="margin:6px 0 0;font-size:12px;color:#56626E;font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">سعد الدولية للمشاريع ذ.م.م. · قطر</p>
                <p style="margin:10px 0 0;font-size:11px;"><a href="${origin}" style="color:#C8A36A;text-decoration:none;">${origin.replace(/^https?:\/\//, "")}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
