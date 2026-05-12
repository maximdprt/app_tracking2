"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { authSchema, type AuthInput } from "@/features/auth/schemas";
import { createClient } from "@/services/supabase/client";
import { AppError, toUserMessage } from "@/lib/errors";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthInput>({ resolver: zodResolver(authSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw new AppError("AUTH", error.message, error);

      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Bon retour</h2>
        <p className="mt-1 text-sm text-text-soft">Connecte-toi pour continuer.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          Se connecter
        </Button>
      </form>

      <div className="flex items-center justify-between text-xs text-text-soft">
        <Link href={ROUTES.signup} className="hover:text-text">
          Créer un compte
        </Link>
        <Link href={ROUTES.resetPassword} className="hover:text-text">
          Mot de passe oublié ?
        </Link>
      </div>
    </div>
  );
}
