import { z } from "zod";

const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,}).*$/i;

const sectionElementTypeSchema = z.enum(["video", "quiz", "resource", "note"]);

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

  addCourseSectionSchema: z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: "La sección debe tener al menos 2 caracteres." })
      .regex(/^[a-zA-ZÀ-ÿ0-9 .,_-]+$/, {
        message: "El nombre de la sección contiene caracteres inválidos.",
      }),
  }),

  createCourseSectionWithElementsSchema: z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: "La sección debe tener al menos 2 caracteres." }),
    elements: z
      .array(
        z.object({
          type: sectionElementTypeSchema,
          title: z
            .string()
            .trim()
            .min(2, { message: "El título del elemento debe tener al menos 2 caracteres." }),
          durationLabel: z.string().trim().optional(),
          isPreview: z.boolean().optional(),
          contentUrl: z.string().trim().optional(),
          contentText: z.string().trim().optional(),
        })
      )
      .min(1, { message: "Agregá al menos un elemento en la sección." }),
  }),
});
