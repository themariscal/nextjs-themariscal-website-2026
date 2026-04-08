import { z } from "zod";

const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,}).*$/i;

export const createAcademySchemas = () => ({
  createCourseSchema: z.object({
    name: z.string().trim().min(3, { message: "El nombre del curso debe tener al menos 3 caracteres." }),
    youtubeUrl: z
      .string()
      .trim()
      .min(1, { message: "La URL de YouTube es requerida." })
      .regex(youtubeUrlRegex, { message: "Debe ser una URL válida de YouTube." }),
    languageId: z.string().trim().min(1, { message: "Seleccioná un idioma." }),
    instructorId: z.string().trim().min(1, { message: "Seleccioná un instructor." }),
    description: z.string().trim().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  }),

  addLanguageSchema: z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: "El idioma debe tener al menos 2 caracteres." })
      .regex(/^[a-zA-ZÀ-ÿ0-9 _-]+$/, {
        message: "El idioma contiene caracteres inválidos.",
      }),
  }),

  addInstructorSchema: z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: "El instructor debe tener al menos 2 caracteres." })
      .regex(/^[a-zA-ZÀ-ÿ0-9 .,_-]+$/, {
        message: "El nombre del instructor contiene caracteres inválidos.",
      }),
  }),
});

