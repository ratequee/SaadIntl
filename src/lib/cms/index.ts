import { revalidatePath } from "next/cache";
import { seedStore } from "@/lib/data/seed";
import { mutateStore, readStore } from "./file-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServer } from "@/lib/supabase/server";
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
    await supabase.from("site_settings").upsert({
      id: "default",
      payload: settings,
      updated_at: nowIso(),
    });
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

export async function getProjects(options?: {
  includeDrafts?: boolean;
  featured?: boolean;
  category?: string;
  status?: string;
  query?: string;
}) {
  const source = await fromSupabase(async () => {
    const remote = await fetchRemoteProjects(Boolean(options?.includeDrafts));
    return remote ?? (await readStore()).projects;
  }, async () => (await readStore()).projects);
  let projects = publishedOnly(source, Boolean(options?.includeDrafts));
  if (options?.featured) projects = projects.filter((item) => item.isFeatured);
  if (options?.category && options.category !== "all") {
    const categories = await getCategories("project");
    const match = categories.find((item) => item.slug === options.category);
    if (match) projects = projects.filter((item) => item.categoryId === match.id);
  }
  if (options?.status && options.status !== "all") {
    projects = projects.filter((item) => item.status === options.status);
  }
  if (options?.query) {
    const q = options.query.toLowerCase();
    projects = projects.filter((item) =>
      [
        item.title.en,
        item.title.ar,
        item.location.en,
        item.location.ar,
        item.excerpt.en,
        item.excerpt.ar,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
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
  return projects.find((item) => item.id === id) || null;
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
  await mutateStore((store) => {
    store.projects = store.projects.filter((item) => item.id !== id);
  });
  await deleteRemoteProject(id);
  refreshPublic();
}

export async function getArticles(options?: {
  includeDrafts?: boolean;
  category?: string;
  query?: string;
}) {
  const source = await fromSupabase(async () => {
    const remote = await fetchRemoteArticles(Boolean(options?.includeDrafts));
    return remote ?? (await readStore()).articles;
  }, async () => (await readStore()).articles);
  let articles = publishedOnly(source, Boolean(options?.includeDrafts));
  if (options?.category && options.category !== "all") {
    const categories = await getCategories("article");
    const match = categories.find((item) => item.slug === options.category);
    if (match) articles = articles.filter((item) => item.categoryId === match.id);
  }
  if (options?.query) {
    const q = options.query.toLowerCase();
    articles = articles.filter((item) =>
      [item.title.en, item.title.ar, item.excerpt.en, item.excerpt.ar]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
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
  return articles.find((item) => item.id === id) || null;
}

export async function saveArticle(input: ArticleInput, id?: string) {
  let saved: Article | null = null;
  await mutateStore((store) => {
    const timestamp = nowIso();
    if (id) {
      const index = store.articles.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Article not found");
      const current = store.articles[index];
      saved = {
        ...current,
        ...input,
        id,
        updatedAt: timestamp,
        publishedAt: input.isPublished
          ? input.publishedAt || current.publishedAt || timestamp
          : null,
      };
      store.articles[index] = saved;
    } else {
      saved = {
        ...input,
        id: newId("art"),
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: input.isPublished ? input.publishedAt || timestamp : null,
      };
      store.articles.push(saved);
    }
  });
  if (saved) await upsertRemoteArticle(saved);
  refreshPublic();
  return saved!;
}

export async function deleteArticle(id: string) {
  await mutateStore((store) => {
    store.articles = store.articles.filter((item) => item.id !== id);
  });
  await deleteRemoteArticle(id);
  refreshPublic();
}

export async function getDocuments(options?: {
  includeDrafts?: boolean;
  category?: string;
  query?: string;
}) {
  const source = await fromSupabase(async () => {
    const remote = await fetchRemoteDocuments(Boolean(options?.includeDrafts));
    return remote ?? (await readStore()).documents;
  }, async () => (await readStore()).documents);
  let documents = publishedOnly(source, Boolean(options?.includeDrafts));
  if (options?.category && options.category !== "all") {
    const categories = await getCategories("document");
    const match = categories.find((item) => item.slug === options.category);
    if (match) documents = documents.filter((item) => item.categoryId === match.id);
  }
  if (options?.query) {
    const q = options.query.toLowerCase();
    documents = documents.filter((item) =>
      [item.title.en, item.title.ar, item.description.en, item.description.ar]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  return [...documents].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getDocumentById(id: string) {
  const documents = await fromSupabase(async () => {
    const remote = await fetchRemoteDocuments(true);
    return remote ?? (await readStore()).documents;
  }, async () => (await readStore()).documents);
  return documents.find((item) => item.id === id) || null;
}

export async function saveDocument(input: DocumentInput, id?: string) {
  let saved: DocumentItem | null = null;
  await mutateStore((store) => {
    const timestamp = nowIso();
    if (id) {
      const index = store.documents.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Document not found");
      saved = {
        ...store.documents[index],
        ...input,
        id,
        updatedAt: timestamp,
        publishedAt: input.isPublished
          ? store.documents[index].publishedAt || timestamp
          : null,
      };
      store.documents[index] = saved;
    } else {
      saved = {
        ...input,
        id: newId("doc"),
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: input.isPublished ? timestamp : null,
      };
      store.documents.push(saved);
    }
  });
  if (saved) await upsertRemoteDocument(saved);
  refreshPublic();
  return saved!;
}

export async function deleteDocument(id: string) {
  await mutateStore((store) => {
    store.documents = store.documents.filter((item) => item.id !== id);
  });
  await deleteRemoteDocument(id);
  refreshPublic();
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
  const [projects, articles, documents, store] = await Promise.all([
    getProjects({ includeDrafts: true }),
    getArticles({ includeDrafts: true }),
    getDocuments({ includeDrafts: true }),
    readStore(),
  ]);
  return {
    projects: projects.length,
    publishedProjects: projects.filter((item) => item.isPublished).length,
    draftProjects: projects.filter((item) => !item.isPublished).length,
    articles: articles.length,
    publishedArticles: articles.filter((item) => item.isPublished).length,
    documents: documents.length,
    publishedDocuments: documents.filter((item) => item.isPublished).length,
    messages: store.messages.length,
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
