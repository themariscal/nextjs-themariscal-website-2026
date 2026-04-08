import { z } from "zod";

const youtubeShortUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/shorts\/[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,}).*$/i;

export const createShortsSchemas = () => ({
  createShortSchema: z.object({
    title: z.string().trim().min(3, { message: "El título debe tener al menos 3 caracteres." }),
    section: z.string().trim().min(1, { message: "La sección es requerida." }),
    videoId: z.string().trim().min(6, { message: "Video ID inválido." }),
    shortUrl: z
      .string()
      .trim()
      .min(1, { message: "La URL del short es requerida." })
      .regex(youtubeShortUrlRegex, {
        message: "Debe ser una URL válida de YouTube Shorts o youtu.be.",
      }),
    order: z
      .union([
        z.string().trim().regex(/^\d+$/, { message: "El orden debe ser un número." }),
        z.literal(""),
      ])
      .optional(),
  }),

  editShortSchema: z.object({
    title: z.string().trim().min(3, { message: "El título debe tener al menos 3 caracteres." }),
    section: z.string().trim().min(1, { message: "La sección es requerida." }),
    shortUrl: z
      .string()
      .trim()
      .min(1, { message: "La URL del short es requerida." })
      .regex(youtubeShortUrlRegex, {
        message: "Debe ser una URL válida de YouTube Shorts o youtu.be.",
      }),
    order: z
      .union([
        z.string().trim().regex(/^\d+$/, { message: "El orden debe ser un número." }),
        z.literal(""),
      ])
      .optional(),
  }),

  addSectionSchema: z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: "La sección debe tener al menos 2 caracteres." })
      .regex(/^[a-z0-9_-]+$/, {
        message:
          "La sección solo puede contener letras minúsculas, números, guiones y guiones bajos.",
      }),
  }),
});
