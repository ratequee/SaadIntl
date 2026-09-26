# SAAD International Projects

Bilingual website and CMS for SAAD International Projects W.L.L. — project management, construction and interior design in Qatar.

## Stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- English LTR / Arabic RTL via `next-intl`
- Light / dark theme via `next-themes`
- Supabase-ready schema, auth and storage
- Local file CMS (`.data/cms.json`) when Supabase is not configured

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root path redirects to `/en`.

### Local admin

Until Supabase Auth is connected, sign in at `/admin/login` with the values in `.env.local`:

- Email: `admin@sipqa.com`
- Password: `SaadAdmin2026!`

Change these before any shared or production use.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for admin writes |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Local bootstrap admin |
| `AUTH_SECRET` | Signs the admin session cookie |
| `CONTACT_TO_EMAIL` | Inbox for contact form enquiries (`Saad@rateq.qa`) |
| `RESEND_API_KEY` | Resend API key for contact form delivery |
| `CONTACT_FROM_EMAIL` | From address on the verified `sipqa.com` domain |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Optional SMTP fallback if Resend is not set |
| `NEXT_PUBLIC_MAPS_EMBED_URL` | Optional contact map |

Never expose the service role key or `AUTH_SECRET` to the browser.

## Supabase (production)

1. Create a project and storage bucket named `media` (public).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Create an Auth user for the company administrator.
4. Set the Supabase environment variables.
5. Upload real project images and official documents from `/admin`.

The public site reads published content only. Drafts stay in the admin area. Signed-in admins can preview unpublished project and article URLs.

## Content model

- Projects (EN/AR fields, gallery, featured image, publish state, SEO)
- Articles (EN/AR rich text, sanitised on save)
- Documents (EN/AR metadata, PDF/DOC upload, public visibility)
- Categories, testimonials, site settings, contact messages

Seed/demo content lives in `src/lib/data/seed.ts` and is copied into `.data/cms.json` on first local run. It is not hardcoded in page components.

## Design source

Visual language follows the supplied homepage PDF and brand palette:

- Gold `#C8A36A`
- Ink `#12171C` / `#151B21`
- Cream `#F1E6D3`
- Slate `#56626E`
- Espresso `#1B1509`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
