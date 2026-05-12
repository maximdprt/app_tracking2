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

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthInput>({ resolver: zodResolver(authSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp(values);
      if (error) throw new AppError("AUTH", error.message, error);
      router.replace(ROUTES.confirm);
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="lift-display-md">Crée ton compte</h2>
        <p className="lift-body-soft mt-1">Quelques secondes et c'est parti.</p>
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
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          Créer mon compte
        </Button>
      </form>

      <div className="text-center text-xs text-text-soft">
        Déjà inscrit ?{" "}
        <Link href={ROUTES.login} className="text-text hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
