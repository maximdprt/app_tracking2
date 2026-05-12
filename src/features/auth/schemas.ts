import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(6, "6 caractères minimum."),
});

export type AuthInput = z.infer<typeof authSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide."),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
