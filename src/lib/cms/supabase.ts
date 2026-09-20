import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  Article,
  ArticleInput,
  Category,
  DocumentInput,
  DocumentItem,
  Project,
  ProjectImage,
  ProjectInput,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

export function remoteCms() {
  return getSupabaseServer();
}

function loc(en?: string | null, ar?: string | null) {
  return { en: en || "", ar: ar || "" };
}

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    slug: String(row.slug),
    type: row.type as Category["type"],
    name: loc(row.name_en as string, row.name_ar as string),
  };
}

export function mapImage(row: Record<string, unknown>): ProjectImage {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    url: String(row.url || ""),
    caption: loc(row.caption_en as string, row.caption_ar as string),
    alt: loc(row.alt_en as string, row.alt_ar as string),
    isFeatured: Boolean(row.is_featured),
    displayOrder: Number(row.display_order || 0),
  };
}

export function mapProject(
  row: Record<string, unknown>,
  images: ProjectImage[] = [],
): Project {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: loc(row.title_en as string, row.title_ar as string),
    excerpt: loc(row.excerpt_en as string, row.excerpt_ar as string),
    description: loc(row.description_en as string, row.description_ar as string),
    categoryId: String(row.category_id || ""),
    location: loc(row.location_en as string, row.location_ar as string),
    client: String(row.client || ""),
    status: (row.status as Project["status"]) || "planning",
    startDate: (row.start_date as string) || null,
    completionDate: (row.completion_date as string) || null,
    contractValue: String(row.contract_value || ""),
    services: Array.isArray(row.services) ? (row.services as string[]) : [],
    featuredImageUrl: String(row.featured_image_url || ""),
    progress: row.progress == null ? null : Number(row.progress),
    isPublished: Boolean(row.is_published),
    isFeatured: Boolean(row.is_featured),
    displayOrder: Number(row.display_order || 0),
    seoTitle: loc(row.seo_title_en as string, row.seo_title_ar as string),
    seoDescription: loc(row.seo_description_en as string, row.seo_description_ar as string),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
    publishedAt: (row.published_at as string) || null,
    images: images.sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

export function mapArticle(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: loc(row.title_en as string, row.title_ar as string),
    excerpt: loc(row.excerpt_en as string, row.excerpt_ar as string),
    content: loc(row.content_en as string, row.content_ar as string),
    categoryId: String(row.category_id || ""),
    featuredImageUrl: String(row.featured_image_url || ""),
    author: loc(row.author_en as string, row.author_ar as string),
    readingTimeMinutes: Number(row.reading_time_minutes || 3),
    isPublished: Boolean(row.is_published),
    publishedAt: (row.published_at as string) || null,
    seoTitle: loc(row.seo_title_en as string, row.seo_title_ar as string),
    seoDescription: loc(row.seo_description_en as string, row.seo_description_ar as string),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

export function mapDocument(row: Record<string, unknown>): DocumentItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: loc(row.title_en as string, row.title_ar as string),
    description: loc(row.description_en as string, row.description_ar as string),
    categoryId: String(row.category_id || ""),
    fileUrl: String(row.file_url || ""),
    fileName: String(row.file_name || ""),
    fileType: String(row.file_type || ""),
    fileSize: Number(row.file_size || 0),
    thumbnailUrl: String(row.thumbnail_url || ""),
    isPublished: Boolean(row.is_published),
    displayOrder: Number(row.display_order || 0),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
    publishedAt: (row.published_at as string) || null,
  };
}

export function mapTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: String(row.id),
    quote: loc(row.quote_en as string, row.quote_ar as string),
    clientName: loc(row.client_name_en as string, row.client_name_ar as string),
    clientRole: loc(row.client_role_en as string, row.client_role_ar as string),
    initials: String(row.initials || ""),
    isPublished: Boolean(row.is_published),
    displayOrder: Number(row.display_order || 0),
  };
}

export function projectRow(project: Project) {
  return {
    id: project.id,
    slug: project.slug,
    title_en: project.title.en,
    title_ar: project.title.ar,
    excerpt_en: project.excerpt.en,
    excerpt_ar: project.excerpt.ar,
    description_en: project.description.en,
    description_ar: project.description.ar,
    category_id: project.categoryId || null,
    location_en: project.location.en,
    location_ar: project.location.ar,
    client: project.client,
    status: project.status,
    start_date: project.startDate,
    completion_date: project.completionDate,
    contract_value: project.contractValue,
    services: project.services,
    featured_image_url: project.featuredImageUrl,
    progress: project.progress,
    is_published: project.isPublished,
    is_featured: project.isFeatured,
    display_order: project.displayOrder,
    seo_title_en: project.seoTitle.en,
    seo_title_ar: project.seoTitle.ar,
    seo_description_en: project.seoDescription.en,
    seo_description_ar: project.seoDescription.ar,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    published_at: project.publishedAt,
  };
}

export function imageRow(image: ProjectImage) {
  return {
    id: image.id,
    project_id: image.projectId,
    url: image.url,
    caption_en: image.caption.en,
    caption_ar: image.caption.ar,
    alt_en: image.alt.en,
    alt_ar: image.alt.ar,
    is_featured: image.isFeatured,
    display_order: image.displayOrder,
  };
}

export function articleRow(article: Article) {
  return {
    id: article.id,
    slug: article.slug,
    title_en: article.title.en,
    title_ar: article.title.ar,
    excerpt_en: article.excerpt.en,
    excerpt_ar: article.excerpt.ar,
    content_en: article.content.en,
    content_ar: article.content.ar,
    category_id: article.categoryId || null,
    featured_image_url: article.featuredImageUrl,
    author_en: article.author.en,
    author_ar: article.author.ar,
    reading_time_minutes: article.readingTimeMinutes,
    is_published: article.isPublished,
    published_at: article.publishedAt,
    seo_title_en: article.seoTitle.en,
    seo_title_ar: article.seoTitle.ar,
    seo_description_en: article.seoDescription.en,
    seo_description_ar: article.seoDescription.ar,
    created_at: article.createdAt,
    updated_at: article.updatedAt,
  };
}

export function documentRow(doc: DocumentItem) {
  return {
    id: doc.id,
    slug: doc.slug,
    title_en: doc.title.en,
    title_ar: doc.title.ar,
    description_en: doc.description.en,
    description_ar: doc.description.ar,
    category_id: doc.categoryId || null,
    file_url: doc.fileUrl,
    file_name: doc.fileName,
    file_type: doc.fileType,
    file_size: doc.fileSize,
    thumbnail_url: doc.thumbnailUrl,
    is_published: doc.isPublished,
    display_order: doc.displayOrder,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
    published_at: doc.publishedAt,
  };
}

export async function fetchRemoteProjects(includeDrafts = false) {
  const supabase = remoteCms();
  if (!supabase) return null;
  let query = supabase.from("projects").select("*").order("display_order");
  if (!includeDrafts) query = query.eq("is_published", true);
  const { data, error } = await query;
  if (error) throw error;
  const { data: images, error: imageError } = await supabase
    .from("project_images")
    .select("*")
    .order("display_order");
  if (imageError) throw imageError;
  const byProject = new Map<string, ProjectImage[]>();
  for (const row of images || []) {
    const image = mapImage(row);
    byProject.set(image.projectId, [...(byProject.get(image.projectId) || []), image]);
  }
  return (data || []).map((row) => mapProject(row, byProject.get(String(row.id)) || []));
}

export async function fetchRemoteArticles(includeDrafts = false) {
  const supabase = remoteCms();
  if (!supabase) return null;
  let query = supabase.from("articles").select("*").order("published_at", { ascending: false });
  if (!includeDrafts) query = query.eq("is_published", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapArticle);
}

export async function fetchRemoteDocuments(includeDrafts = false) {
  const supabase = remoteCms();
  if (!supabase) return null;
  let query = supabase.from("documents").select("*").order("display_order");
  if (!includeDrafts) query = query.eq("is_published", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapDocument);
}

export async function fetchRemoteCategories() {
  const supabase = remoteCms();
  if (!supabase) return null;
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return (data || []).map(mapCategory);
}

export async function fetchRemoteTestimonials() {
  const supabase = remoteCms();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("display_order");
  if (error) throw error;
  return (data || []).map(mapTestimonial);
}

export async function fetchRemoteSettings() {
  const supabase = remoteCms();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return data ? (data.payload as SiteSettings) : null;
}

export async function upsertRemoteProject(project: Project) {
  const supabase = remoteCms();
  if (!supabase) return;
  const { error } = await supabase.from("projects").upsert(projectRow(project));
  if (error) throw error;
  const { error: clearError } = await supabase
    .from("project_images")
    .delete()
    .eq("project_id", project.id);
  if (clearError) throw clearError;
  if (project.images.length) {
    const { error: imageError } = await supabase
      .from("project_images")
      .insert(project.images.map(imageRow));
    if (imageError) throw imageError;
  }
}

export async function deleteRemoteProject(id: string) {
  const supabase = remoteCms();
  if (!supabase) return;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertRemoteArticle(article: Article) {
  const supabase = remoteCms();
  if (!supabase) return;
  const { error } = await supabase.from("articles").upsert(articleRow(article));
  if (error) throw error;
}

export async function deleteRemoteArticle(id: string) {
  const supabase = remoteCms();
  if (!supabase) return;
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertRemoteDocument(doc: DocumentItem) {
  const supabase = remoteCms();
  if (!supabase) return;
  const { error } = await supabase.from("documents").upsert(documentRow(doc));
  if (error) throw error;
}

export async function deleteRemoteDocument(id: string) {
  const supabase = remoteCms();
  if (!supabase) return;
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

