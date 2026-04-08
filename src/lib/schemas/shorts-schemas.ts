import { z } from "zod";

const youtubeShortUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/shorts\/[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,}).*$/i;

export const createShortsSchemas = () => ({
  editShortSchema: z.object({
    title: z.string().trim().min(3, { message: "El título debe tener al menos 3 caracteres." }),
    page: z.string().trim().min(1, { message: "La página es requerida." }),
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
});

