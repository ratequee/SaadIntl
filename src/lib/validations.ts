import { z } from "zod";

export const localizedSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(6).max(30),
  subject: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(2000),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 10;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif";
export const MAX_DOC_SIZE = 15 * 1024 * 1024;

export function isAllowedImage(file: File) {
  return ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
}

export function isAllowedDocument(file: File) {
  return ALLOWED_DOC_TYPES.includes(file.type) && file.size <= MAX_DOC_SIZE;
}
