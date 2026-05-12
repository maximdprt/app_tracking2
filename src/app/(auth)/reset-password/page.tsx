"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schemas";
import { createClient } from "@/services/supabase/client";
import { AppError, toUserMessage } from "@/lib/errors";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email);
      if (error) throw new AppError("AUTH", error.message, error);
      toast.success("Email envoyé. Vérifie ta boîte.");
      reset();
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="lift-display-md">Mot de passe oublié</h2>
        <p className="lift-body-soft mt-1">
          On t'envoie un lien pour le réinitialiser.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          Envoyer le lien
        </Button>
      </form>

      <div className="text-center text-xs text-text-soft">
        <Link href={ROUTES.login} className="hover:text-text">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
