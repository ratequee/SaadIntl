import nodemailer from "nodemailer";
import {
  CONTACT_TO_EMAIL,
  contactEmailHtml,
  contactEmailSubject,
  contactEmailText,
  type ContactEmailPayload,
} from "./contact-template";

function fromAddress() {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    (process.env.SMTP_USER
      ? `SAAD International <${process.env.SMTP_USER}>`
      : `SAAD International <${CONTACT_TO_EMAIL}>`)
  );
}

async function sendWithResend(payload: ContactEmailPayload) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [CONTACT_TO_EMAIL],
      reply_to: payload.email,
      subject: contactEmailSubject(payload),
      html: contactEmailHtml(payload),
      text: contactEmailText(payload),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Resend rejected the email.");
  }
  return true;
}

async function sendWithSmtp(payload: ContactEmailPayload) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return false;

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: fromAddress(),
    to: CONTACT_TO_EMAIL,
    replyTo: `${payload.name} <${payload.email}>`,
    subject: contactEmailSubject(payload),
    html: contactEmailHtml(payload),
    text: contactEmailText(payload),
  });
  return true;
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  if (await sendWithSmtp(payload)) return;
  if (await sendWithResend(payload)) return;
  throw new Error("Email is not configured.");
}
