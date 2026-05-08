import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(6, "6 caracteres minimum."),
});

export type AuthInput = z.infer<typeof authSchema>;
