
import { z } from "zod";

// Function to create schemas with translations
export const createAuthSchemas = (t: (key: string) => string) => ({
  loginSchema: z.object({
    email: z
      .string()
      .trim()
      .email({ message: t("validation.email.invalid") }),
    password: z
      .string()
      .trim()
      .min(8, { message: t("validation.password.minLength") }),
  }),

  registerSchema: z.object({
    username: z
      .string()
      .trim()
      .min(4, { message: t("validation.username.minLength") })
      .regex(/^[a-z0-9_-]+$/, {
        message: t("validation.username.format")
      }),
    email: z
      .string()
      .trim()
      .email({ message: t("validation.email.invalid") }),
    password: z
      .string()
      .trim()
      .min(8, { message: t("validation.password.minLength") })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: t("validation.password.complexity")
      }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: t("validation.confirmPassword.required") }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.confirmPassword.mismatch"),
    path: ["confirmPassword"],
  }),

  forgotPasswordSchema: z.object({
    email: z
      .string()
      .trim()
      .email({ message: t("validation.email.invalid") }),
  }),

  resetPasswordSchema: z.object({
    code: z
      .string()
      .trim()
      .min(6, { message: t("validation.code.minLength") }),
    password: z
      .string()
      .trim()
      .min(8, { message: t("validation.password.minLength") })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: t("validation.password.complexity")
      }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: t("validation.confirmPassword.required") }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.confirmPassword.mismatch"),
    path: ["confirmPassword"],
  }),

  otpSchema: z.object({
    pin: z.string().min(6, {
      message: t("validation.code.otpLength"),
    }),
  })
});

// Legacy schemas for backward compatibility (will be removed)
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Debe ser un email válido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
});

export const otpSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, { message: "El nombre de usuario debe tener al menos 4 caracteres" })
    .regex(/^[a-z0-9_-]+$/, {
      message: "El nombre de usuario solo puede contener letras minúsculas, números, guiones y guiones bajos"
    }),
  email: z
    .string()
    .trim()
    .email({ message: "Debe ser un email válido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: "La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (@$!%*?&)"
    }),
  confirmPassword: z
    .string()
    .trim()
    .min(1, { message: "Confirma tu contraseña" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Debe ser un email válido" }),
});

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, { message: "El código debe tener al menos 6 caracteres" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: "La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (@$!%*?&)"
    }),
  confirmPassword: z
    .string()
    .trim()
    .min(1, { message: "Confirma tu contraseña" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// export const userSchema = z.object({
//   id: z
//   .string(),
// createdAt: z
//   .string()
//   .optional(),
// createdFrom: z.string().optional(),
// createdPlatform: z.string().optional(),
// email: z
//   .string()
//   .trim()
//   .email({ message: "Debe ser un email válido" }),
// first_name: z
//   .string()
//   .trim()
//   .min(1, { message: "El nombre es requerido" })
//   .optional(),
// last_name: z
//   .string()
//   .trim()
//   .min(1, { message: "El apellido es requerido" })
//   .optional(),
// permissions: z.array(z.string()).optional(),
// username: z
//   .string()
//   .trim()
//   .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
//   .regex(/^[a-z0-9_-]+$/, {
//     message: "El nombre de usuario solo puede contener letras minúsculas, números, guiones y guiones bajos"
//   }).optional(),
// });