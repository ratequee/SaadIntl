import { revalidatePath } from "next/cache";
import { seedStore } from "@/lib/data/seed";
import { mutateStore, readStore } from "./file-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServer } from "@/lib/supabase/server";
import { deleteUpload } from "@/lib/uploads";
import {
  documentAttachments,
  documentExpiry,
  featuredImageUrlFrom,
  normalizeGalleryImages,
} from "@/lib/utils";
import {
  deleteRemoteArticle,
  deleteRemoteDocument,
  deleteRemoteProject,
  fetchRemoteArticles,
  fetchRemoteCategories,
  fetchRemoteDocuments,
  fetchRemoteProjects,
  fetchRemoteSettings,
  fetchRemoteTestimonials,
  upsertRemoteArticle,
  upsertRemoteDocument,
  upsertRemoteProject,
} from "./supabase";
import type {
  Article,
  ArticleInput,
  Category,
  ContactMessage,
  DocumentInput,
  DocumentItem,
  Project,
  ProjectInput,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function nowIso() {
  return new Date().toISOString();
}

function refreshPublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

function publishedOnly<T extends { isPublished: boolean }>(
  items: T[],
  includeDrafts: boolean,
) {
  return includeDrafts ? items : items.filter((item) => item.isPublished);
}

function withProjectFeatured(project: Project): Project {
  return {
    ...project,
    featuredImageUrl: featuredImageUrlFrom(project.images, project.featuredImageUrl),
  };
}

function withArticleImages(article: Article): Article {
  const images = normalizeGalleryImages(article.images, article.featuredImageUrl);
  return {
    ...article,
    images,
    featuredImageUrl: featuredImageUrlFrom(images, article.featuredImageUrl),
  };
}

function normalizeDocument(doc: DocumentItem): DocumentItem {
  const files = documentAttachments(doc);
  const first = files[0];
  return {
    ...doc,
    files,
    fileUrl: first?.url || doc.fileUrl || "",
    fileName: first?.fileName || doc.fileName || "",
    fileType: first?.fileType || doc.fileType || "",
    fileSize: first?.fileSize ?? doc.fileSize ?? 0,
    thumbnailUrl: doc.thumbnailUrl || "",
    hasExpiry: Boolean(doc.hasExpiry),
    expiresAt: doc.expiresAt || null,
  };
}

async function fromSupabase<T>(fn: () => Promise<T>, fallback: () => Promise<T>) {
  if (!isSupabaseConfigured()) return fallback();
  try {
    return await fn();
  } catch {
    return fallback();
  }
}

export async function getSettings(): Promise<SiteSettings> {
  return fromSupabase(async () => {
    const settings = await fetchRemoteSettings();
    return settings || (await readStore()).settings;
  }, async () => (await readStore()).settings);
}

export async function updateSettings(settings: SiteSettings) {
  await mutateStore((store) => {
    store.settings = settings;
  });
  const supabase = getSupabaseServer();
  if (supabase) {
    const { error } = await supabase.from("site_settings").upsert({
      id: "default",
      payload: settings,
      updated_at: nowIso(),
    });
    if (error) throw error;
  }
  refreshPublic();
}

export async function getCategories(type?: Category["type"]) {
  const categories = await fromSupabase(async () => {
    const remote = await fetchRemoteCategories();
    if (remote && remote.length) return remote;
    return (await readStore()).categories;
  }, async () => (await readStore()).categories);
  return type ? categories.filter((item) => item.type === type) : categories;
}

function searchableText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function projectSearchHaystack(item: Project, locale?: string, categoryName = "") {
  const localizedFields =
    locale === "ar"
      ? [item.title.ar, item.location.ar, item.excerpt.ar, item.description.ar, item.seoTitle.ar, item.seoDescription.ar]
      : locale === "en"
        ? [item.title.en, item.location.en, item.excerpt.en, item.description.en, item.seoTitle.en, item.seoDescription.en]
        : [
            item.title.en,
            item.title.ar,
            item.location.en,
            item.location.ar,
            item.excerpt.en,
            item.excerpt.ar,
            item.description.en,
            item.description.ar,
          ];
  return searchableText([...localizedFields, categoryName, item.client].join(" "));
}

export async function getProjects(options?: {
  includeDrafts?: boolean;
  featured?: boolean;
  category?: string;
  status?: string;
  query?: string;
  locale?: string;
}) {
  const source = await fromSupabase(async () => {
    const remote = await fetchRemoteProjects(Boolean(options?.includeDrafts));
    return remote ?? (await readStore()).projects;
  }, async () => (await readStore()).projects);
  let projects = publishedOnly(source, Boolean(options?.includeDrafts)).map(withProjectFeatured);
  if (options?.featured) projects = projects.filter((item) => item.isFeatured);
  const needsCategories =
    (options?.category && options.category !== "all") || Boolean(options?.query?.trim());
  const categories = needsCategories ? await getCategories("project") : [];
  if (options?.category && options.category !== "all") {
    const match = categories.find((item) => item.slug === options.category);
    if (match) projects = projects.filter((item) => item.categoryId === match.id);
  }
  if (options?.status && options.status !== "all") {
    projects = projects.filter((item) => item.status === options.status);
  }
  const query = options?.query?.trim().toLowerCase();
  if (query) {
    projects = projects.filter((item) => {
      const category = categories.find((entry) => entry.id === item.categoryId);
      const categoryName = category
        ? options?.locale === "ar"
          ? category.name.ar
          : options?.locale === "en"
            ? category.name.en
            : `${category.name.en} ${category.name.ar}`
        : "";
      return projectSearchHaystack(item, options?.locale, categoryName).includes(query);
    });
  }
  return [...projects].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getProjectBySlug(slug: string, includeDrafts = false) {
  const projects = await getProjects({ includeDrafts });
  return projects.find((item) => item.slug === slug) || null;
}

export async function getProjectById(id: string) {
  const projects = await fromSupabase(async () => {
    const remote = await fetchRemoteProjects(true);
    return remote ?? (await readStore()).projects;
  }, async () => (await readStore()).projects);
  return projects.map(withProjectFeatured).find((item) => item.id === id) || null;
}

export async function saveProject(input: ProjectInput, id?: string) {
  let saved: Project | null = null;
  await mutateStore((store) => {
    const timestamp = nowIso();
    if (id) {
      const index = store.projects.findIndex((item) => item.id === id);
      const current = index === -1
        ? {
            ...input,
            id,
            images: [],
            createdAt: timestamp,
            updatedAt: timestamp,
            publishedAt: input.isPublished ? timestamp : null,
          }
        : store.projects[index];
      saved = {
        ...current,
        ...input,
        id,
        images: (input.images || current.images).map((image, order) => {
          const existingId = "id" in image ? String(image.id || "") : "";
          return {
            url: image.url,
            caption: image.caption,
            alt: image.alt,
            isFeatured: image.isFeatured,
            id: existingId || newId("img"),
            projectId: id,
            displayOrder: image.displayOrder ?? order + 1,
          };
        }),
        featuredImageUrl: featuredImageUrlFrom(input.images || current.images, input.featuredImageUrl),
        updatedAt: timestamp,
        publishedAt: input.isPublished ? current.publishedAt || timestamp : null,
      };
      if (index === -1) store.projects.push(saved);
      else store.projects[index] = saved;
    } else {
      const projectId = newId("proj");
      saved = {
        ...input,
        id: projectId,
        images: (input.images || []).map((image, order) => ({
          ...image,
          id: newId("img"),
          projectId,
          displayOrder: image.displayOrder ?? order + 1,
        })),
        featuredImageUrl: featuredImageUrlFrom(input.images, input.featuredImageUrl),
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: input.isPublished ? timestamp : null,
      };
      store.projects.push(saved);
    }
  });
  if (saved) await upsertRemoteProject(saved);
  refreshPublic();
  return saved!;
}

export async function deleteProject(id: string) {
  const project = await getProjectById(id);
  if (project) {
    const urls = [
      project.featuredImageUrl,
      ...project.images.map((image) => image.url),
    ].filter((url, index, list) => url && list.indexOf(url) === index);
    await Promise.all(urls.map((url) => deleteUpload(url)));
  }
  await mutateStore((store) => {
    store.projects = store.projects.filter((item) => item.id !== id);
  });
  await deleteRemoteProject(id);
  refreshPublic();
}

function articleSearchHaystack(item: Article, locale?: string, categoryName = "") {
  const localizedFields =
    locale === "ar"
      ? [item.title.ar, item.excerpt.ar, item.content.ar, item.author.ar, item.seoTitle.ar, item.seoDescription.ar]
      : locale === "en"
        ? [item.title.en, item.excerpt.en, item.content.en, item.author.en, item.seoTitle.en, item.seoDescription.en]
        : [
            item.title.en,
            item.title.ar,
            item.excerpt.en,
            item.excerpt.ar,
            item.content.en,
            item.content.ar,
            item.author.en,
            item.author.ar,
          ];
  return searchableText([...localizedFields, categoryName].join(" "));
}

export async function getArticles(options?: {
  includeDrafts?: boolean;
  category?: string;
  query?: string;
  locale?: string;
}) {
  const source = await fromSupabase(async () => {
    const remote = await fetchRemoteArticles(Boolean(options?.includeDrafts));
    return remote ?? (await readStore()).articles;
  }, async () => (await readStore()).articles);
  let articles = publishedOnly(source, Boolean(options?.includeDrafts)).map(withArticleImages);
  const needsCategories =
    (options?.category && options.category !== "all") || Boolean(options?.query?.trim());
  const categories = needsCategories ? await getCategories("article") : [];
  if (options?.category && options.category !== "all") {
    const match = categories.find((item) => item.slug === options.category);
    if (match) articles = articles.filter((item) => item.categoryId === match.id);
  }
  const query = options?.query?.trim().toLowerCase();
  if (query) {
    articles = articles.filter((item) => {
      const category = categories.find((entry) => entry.id === item.categoryId);
      const categoryName = category
        ? options?.locale === "ar"
          ? category.name.ar
          : options?.locale === "en"
            ? category.name.en
            : `${category.name.en} ${category.name.ar}`
        : "";
      return articleSearchHaystack(item, options?.locale, categoryName).includes(query);
    });
  }
  return [...articles].sort((a, b) =>
    (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt),
  );
}

export async function getArticleBySlug(slug: string, includeDrafts = false) {
  const articles = await getArticles({ includeDrafts });
  return articles.find((item) => item.slug === slug) || null;
}

export async function getArticleById(id: string) {
  const articles = await fromSupabase(async () => {
    const remote = await fetchRemoteArticles(true);
    return remote ?? (await readStore()).articles;
  }, async () => (await readStore()).articles);
  return articles.map(withArticleImages).find((item) => item.id === id) || null;
}

export async function saveArticle(input: ArticleInput, id?: string) {
  let saved: Article | null = null;
  await mutateStore((store) => {
    const timestamp = nowIso();
    if (id) {
      const index = store.articles.findIndex((item) => item.id === id);
      const current = index === -1
        ? {
            ...input,
            id,
            createdAt: timestamp,
            updatedAt: timestamp,
            publishedAt: input.publishedAt,
          }
        : store.articles[index];
      saved = {
        ...current,
        ...input,
        id,
        images: normalizeGalleryImages(input.images || current.images, input.featuredImageUrl),
        featuredImageUrl: featuredImageUrlFrom(input.images || current.images, input.featuredImageUrl),
        createdAt: current.createdAt,
        updatedAt: timestamp,
        publishedAt: input.publishedAt,
      };
      if (index === -1) store.articles.push(saved);
      else store.articles[index] = saved;
    } else {
      saved = {
        ...input,
        id: newId("art"),
        images: normalizeGalleryImages(input.images, input.featuredImageUrl),
        featuredImageUrl: featuredImageUrlFrom(input.images, input.featuredImageUrl),
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: input.publishedAt || (input.isPublished ? timestamp : null),
      };
      store.articles.push(saved);
    }
  });
  if (saved) await upsertRemoteArticle(saved);
  refreshPublic();
  return saved!;
}

export async function deleteArticle(id: string) {
  const article = await getArticleById(id);
  const urls = [
    article?.featuredImageUrl,
    ...(article?.images || []).map((image) => image.url),
  ].filter((url, index, list) => url && list.indexOf(url) === index) as string[];
  await Promise.all(urls.map((url) => deleteUpload(url)));
  await mutateStore((store) => {
    store.articles = store.articles.filter((item) => item.id !== id);
  });
  await deleteRemoteArticle(id);
  refreshPublic();
}

function documentSearchHaystack(item: DocumentItem, locale?: string, categoryName = "") {
  const files = documentAttachments(item);
  const localizedFields =
    locale === "ar"
      ? [item.title.ar, item.description.ar]
      : locale === "en"
        ? [item.title.en, item.description.en]
        : [item.title.en, item.title.ar, item.description.en, item.description.ar];
  return searchableText([...localizedFields, categoryName, ...files.map((file) => file.fileName)].join(" "));
}

export async function getDocuments(options?: {
  includeDrafts?: boolean;
  category?: string;
  query?: string;
  locale?: string;
}) {
  const source = await fromSupabase(async () => {
    const remote = await fetchRemoteDocuments(Boolean(options?.includeDrafts));
    return remote ?? (await readStore()).documents;
  }, async () => (await readStore()).documents);
  let documents = publishedOnly(source, Boolean(options?.includeDrafts)).map(normalizeDocument);
  const needsCategories =
    (options?.category && options.category !== "all") || Boolean(options?.query?.trim());
  const categories = needsCategories ? await getCategories("document") : [];
  if (options?.category && options.category !== "all") {
    const match = categories.find((item) => item.slug === options.category);
    if (match) documents = documents.filter((item) => item.categoryId === match.id);
  }
  const query = options?.query?.trim().toLowerCase();
  if (query) {
    documents = documents.filter((item) => {
      const category = categories.find((entry) => entry.id === item.categoryId);
      const categoryName = category
        ? options?.locale === "ar"
          ? category.name.ar
          : options?.locale === "en"
            ? category.name.en
            : `${category.name.en} ${category.name.ar}`
        : "";
      return documentSearchHaystack(item, options?.locale, categoryName).includes(query);
    });
  }
  return [...documents].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getDocumentBySlug(slug: string, includeDrafts = false) {
  const documents = await getDocuments({ includeDrafts });
  return documents.find((item) => item.slug === slug) || null;
}

export async function getDocumentById(id: string) {
  const documents = await fromSupabase(async () => {
    const remote = await fetchRemoteDocuments(true);
    return remote ?? (await readStore()).documents;
  }, async () => (await readStore()).documents);
  return documents.map(normalizeDocument).find((item) => item.id === id) || null;
}

export async function saveDocument(input: DocumentInput, id?: string) {
  let saved: DocumentItem | null = null;
  const files = documentAttachments(input);
  const first = files[0];
  const payload: DocumentInput = {
    ...input,
    files,
    fileUrl: first?.url || "",
    fileName: first?.fileName || "",
    fileType: first?.fileType || "",
    fileSize: first?.fileSize || 0,
    hasExpiry: Boolean(input.hasExpiry),
    expiresAt: input.hasExpiry ? input.expiresAt : null,
  };

  const current = id ? await getDocumentById(id) : null;
  if (current) {
    const keep = new Set(files.map((item) => item.url));
    const stale = [
      current.thumbnailUrl,
      ...documentAttachments(current).map((item) => item.url),
    ].filter((url) => url && !keep.has(url) && url !== payload.thumbnailUrl);
    await Promise.all(stale.map((url) => deleteUpload(url)));
  }

  await mutateStore((store) => {
    const timestamp = nowIso();
    if (id) {
      const index = store.documents.findIndex((item) => item.id === id);
      const existing = index === -1
        ? {
            ...payload,
            id,
            createdAt: timestamp,
            updatedAt: timestamp,
            publishedAt: payload.isPublished ? timestamp : null,
          }
        : store.documents[index];
      saved = {
        ...existing,
        ...payload,
        id,
        createdAt: existing.createdAt,
        updatedAt: timestamp,
        publishedAt: payload.isPublished ? existing.publishedAt || timestamp : null,
      };
      if (index === -1) store.documents.push(saved);
      else store.documents[index] = saved;
    } else {
      saved = {
        ...payload,
        id: newId("doc"),
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: payload.isPublished ? timestamp : null,
      };
      store.documents.push(saved);
    }
  });
  if (saved) await upsertRemoteDocument(saved);
  refreshPublic();
  return saved!;
}

export async function deleteDocument(id: string) {
  const document = await getDocumentById(id);
  if (document) {
    const urls = [
      document.thumbnailUrl,
      ...documentAttachments(document).map((item) => item.url),
    ].filter((url, index, list) => url && list.indexOf(url) === index);
    await Promise.all(urls.map((url) => deleteUpload(url)));
  }
  await mutateStore((store) => {
    store.documents = store.documents.filter((item) => item.id !== id);
  });
  await deleteRemoteDocument(id);
  refreshPublic();
}

export async function getExpiringDocuments() {
  const documents = await getDocuments({ includeDrafts: true });
  return documents
    .flatMap((document) => {
      const expiry = documentExpiry(document.hasExpiry, document.expiresAt);
      if (!expiry || expiry.status === "ok") return [];
      return [{ document, expiry }];
    })
    .sort((a, b) => a.expiry.days - b.expiry.days);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return fromSupabase(async () => {
    const remote = await fetchRemoteTestimonials();
    if (remote && remote.length) return remote;
    return (await readStore()).testimonials
      .filter((item) => item.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, async () =>
    (await readStore()).testimonials
      .filter((item) => item.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  );
}

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">,
) {
  const message: ContactMessage = {
    ...input,
    id: newId("msg"),
    createdAt: nowIso(),
  };
  await mutateStore((store) => {
    store.messages.unshift(message);
  });
  const supabase = getSupabaseServer();
  if (supabase) {
    await supabase.from("contact_messages").insert({
      id: message.id,
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      locale: message.locale,
      created_at: message.createdAt,
    });
  }
  return message;
}

export async function getDashboardStats() {
  const [projects, articles, documents] = await Promise.all([
    getProjects({ includeDrafts: true }),
    getArticles({ includeDrafts: true }),
    getDocuments({ includeDrafts: true }),
  ]);
  return {
    projects: projects.length,
    publishedProjects: projects.filter((item) => item.isPublished).length,
    draftProjects: projects.filter((item) => !item.isPublished).length,
    articles: articles.length,
    publishedArticles: articles.filter((item) => item.isPublished).length,
    documents: documents.length,
    publishedDocuments: documents.filter((item) => item.isPublished).length,
    recentProjects: [...projects]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
    recentArticles: [...articles]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  };
}

export async function getRelatedArticles(article: Article, limit = 3) {
  const articles = await getArticles();
  return articles
    .filter((item) => item.id !== article.id)
    .filter((item) => item.categoryId === article.categoryId)
    .concat(articles.filter((item) => item.id !== article.id))
    .filter((item, index, list) => list.findIndex((entry) => entry.id === item.id) === index)
    .slice(0, limit);
}

export { seedStore };
