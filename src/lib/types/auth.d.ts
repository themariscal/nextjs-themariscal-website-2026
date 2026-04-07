import { z } from "zod";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, userSchema, otpSchema } from "@/lib/schemas/auth-schemas";


export type LoginType = z.infer<typeof loginSchema>;
export type RegisterType = z.infer<typeof registerSchema>;
export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
export type UserType = z.infer<typeof userSchema>;
export type OtpType = z.infer<typeof otpSchema>;