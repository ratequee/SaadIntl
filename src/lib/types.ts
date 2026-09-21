export type Locale = "en" | "ar";

export type PublishStatus = "draft" | "published";
export type ProjectStatus = "planning" | "in_progress" | "completed";
export type CategoryType = "project" | "article" | "document" | "service";

export type Localized = {
  en: string;
  ar: string;
};

export type Category = {
  id: string;
  slug: string;
  type: CategoryType;
  name: Localized;
};

export type GalleryImage = {
  url: string;
  caption: Localized;
  alt: Localized;
  isFeatured: boolean;
  displayOrder: number;
};

export type ProjectImage = GalleryImage & {
  id: string;
  projectId: string;
};

export type Project = {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  description: Localized;
  categoryId: string;
  location: Localized;
  client: string;
  status: ProjectStatus;
  startDate: string | null;
  completionDate: string | null;
  contractValue: string;
  services: string[];
  featuredImageUrl: string;
  progress: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  seoTitle: Localized;
  seoDescription: Localized;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  images: ProjectImage[];
};

export type Article = {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  content: Localized;
  categoryId: string;
  featuredImageUrl: string;
  images: GalleryImage[];
  author: Localized;
  readingTimeMinutes: number;
  isPublished: boolean;
  publishedAt: string | null;
  seoTitle: Localized;
  seoDescription: Localized;
  createdAt: string;
  updatedAt: string;
};

export type DocumentFile = {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type DocumentItem = {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  categoryId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string;
  files: DocumentFile[];
  hasExpiry: boolean;
  expiresAt: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type Testimonial = {
  id: string;
  quote: Localized;
  clientName: Localized;
  clientRole: Localized;
  initials: string;
  isPublished: boolean;
  displayOrder: number;
};

export type SiteSettings = {
  companyName: Localized;
  tagline: Localized;
  about: Localized;
  email: string;
  phone: string;
  hours: Localized;
  address: Localized;
  mapEmbedUrl: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  locale: string;
  createdAt: string;
};

export type CmsStore = {
  categories: Category[];
  projects: Project[];
  articles: Article[];
  documents: DocumentItem[];
  testimonials: Testimonial[];
  settings: SiteSettings;
  messages: ContactMessage[];
};

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt" | "images"> & {
  images?: Omit<ProjectImage, "id" | "projectId">[];
};

export type ArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt">;
export type DocumentInput = Omit<DocumentItem, "id" | "createdAt" | "updatedAt">;
