import type { MetadataRoute } from "next";
import { getArticles, getDocuments, getProjects } from "@/lib/cms";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles, documents] = await Promise.all([getProjects(), getArticles(), getDocuments()]);
  const locales = ["en", "ar"] as const;
  const staticPaths = ["", "/about", "/projects", "/articles", "/documents", "/contact"];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: siteUrl(`/${locale}${path}`),
        lastModified: new Date(),
      });
    }
    for (const project of projects) {
      entries.push({
        url: siteUrl(`/${locale}/projects/${project.slug}`),
        lastModified: new Date(project.updatedAt),
      });
    }
    for (const document of documents) {
      entries.push({
        url: siteUrl(`/${locale}/documents/${document.slug}`),
        lastModified: new Date(document.updatedAt),
      });
    }
  }
  return entries;
}
