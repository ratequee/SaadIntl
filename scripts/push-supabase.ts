import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";
import { seedStore } from "../src/lib/data/seed";

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

function firstEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function projectRef(url: string) {
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return "";
  }
}

async function runSql(sql: string) {
  const password = firstEnv("DB_PASSWORD");
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL");
  const ref = projectRef(url);
  if (!password || !ref) {
    throw new Error("DB_PASSWORD and NEXT_PUBLIC_SUPABASE_URL are required for migrations.");
  }

  const { Client } = await import("pg");
  const encoded = encodeURIComponent(password);
  const hosts = [
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-me-central-1.pooler.supabase.com:6543/postgres`,
  ];

  let lastError: unknown;
  for (const connectionString of hosts) {
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      return;
    } catch (error) {
      lastError = error;
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  throw lastError;
}

async function seed() {
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = firstEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase URL and secret key are required.");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date().toISOString();
  const categories = seedStore.categories.map((item) => ({
    id: item.id,
    slug: item.slug,
    type: item.type,
    name_en: item.name.en,
    name_ar: item.name.ar,
    updated_at: now,
  }));
  const { error: categoryError } = await supabase.from("categories").upsert(categories);
  if (categoryError) throw categoryError;

  const projects = seedStore.projects.map((item) => ({
    id: item.id,
    slug: item.slug,
    title_en: item.title.en,
    title_ar: item.title.ar,
    excerpt_en: item.excerpt.en,
    excerpt_ar: item.excerpt.ar,
    description_en: item.description.en,
    description_ar: item.description.ar,
    category_id: item.categoryId,
    location_en: item.location.en,
    location_ar: item.location.ar,
    client: item.client,
    status: item.status,
    start_date: item.startDate,
    completion_date: item.completionDate,
    contract_value: item.contractValue,
    services: item.services,
    featured_image_url: item.featuredImageUrl,
    progress: item.progress,
    is_published: item.isPublished,
    is_featured: item.isFeatured,
    display_order: item.displayOrder,
    seo_title_en: item.seoTitle.en,
    seo_title_ar: item.seoTitle.ar,
    seo_description_en: item.seoDescription.en,
    seo_description_ar: item.seoDescription.ar,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    published_at: item.publishedAt,
  }));
  const { error: projectError } = await supabase.from("projects").upsert(projects);
  if (projectError) throw projectError;

  const images = seedStore.projects.flatMap((project) =>
    project.images.map((image) => ({
      id: image.id,
      project_id: image.projectId,
      url: image.url,
      caption_en: image.caption.en,
      caption_ar: image.caption.ar,
      alt_en: image.alt.en,
      alt_ar: image.alt.ar,
      is_featured: image.isFeatured,
      display_order: image.displayOrder,
    })),
  );
  const { error: imageError } = await supabase.from("project_images").upsert(images);
  if (imageError) throw imageError;

  const articles = seedStore.articles.map((item) => ({
    id: item.id,
    slug: item.slug,
    title_en: item.title.en,
    title_ar: item.title.ar,
    excerpt_en: item.excerpt.en,
    excerpt_ar: item.excerpt.ar,
    content_en: item.content.en,
    content_ar: item.content.ar,
    category_id: item.categoryId,
    featured_image_url: item.featuredImageUrl,
    images: item.images || [],
    author_en: item.author.en,
    author_ar: item.author.ar,
    reading_time_minutes: item.readingTimeMinutes,
    is_published: item.isPublished,
    published_at: item.publishedAt,
    seo_title_en: item.seoTitle.en,
    seo_title_ar: item.seoTitle.ar,
    seo_description_en: item.seoDescription.en,
    seo_description_ar: item.seoDescription.ar,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }));
  const { error: articleError } = await supabase.from("articles").upsert(articles);
  if (articleError) throw articleError;

  const documents = seedStore.documents.map((item) => ({
    id: item.id,
    slug: item.slug,
    title_en: item.title.en,
    title_ar: item.title.ar,
    description_en: item.description.en,
    description_ar: item.description.ar,
    category_id: item.categoryId,
    file_url: item.fileUrl,
    file_name: item.fileName,
    file_type: item.fileType,
    file_size: item.fileSize,
    thumbnail_url: item.thumbnailUrl,
    files: item.files,
    has_expiry: item.hasExpiry,
    expires_at: item.expiresAt,
    is_published: item.isPublished,
    display_order: item.displayOrder,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    published_at: item.publishedAt,
  }));
  const { error: documentError } = await supabase.from("documents").upsert(documents);
  if (documentError) throw documentError;

  const testimonials = seedStore.testimonials.map((item) => ({
    id: item.id,
    quote_en: item.quote.en,
    quote_ar: item.quote.ar,
    client_name_en: item.clientName.en,
    client_name_ar: item.clientName.ar,
    client_role_en: item.clientRole.en,
    client_role_ar: item.clientRole.ar,
    initials: item.initials,
    is_published: item.isPublished,
    display_order: item.displayOrder,
  }));
  const { error: testimonialError } = await supabase.from("testimonials").upsert(testimonials);
  if (testimonialError) throw testimonialError;

  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: "default",
    payload: seedStore.settings,
    updated_at: now,
  });
  if (settingsError) throw settingsError;
}

async function main() {
  loadEnv();
  const sql = readFileSync(path.join(process.cwd(), "supabase/migrations/0001_init.sql"), "utf8");
  console.log("Applying schema to production Supabase…");
  await runSql(sql);
  console.log("Schema applied. Seeding content…");
  await seed();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
