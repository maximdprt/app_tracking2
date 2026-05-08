"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/services/supabase/client";
import { AppError, toUserMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw new AppError("AUTH", error.message, error);

      toast.success("Connexion reussie");
      router.replace("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    }
  });

  return (
    <Card>
      <h2 className="text-2xl font-semibold">Connexion</h2>
      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email ? <p className="text-danger mt-1 text-xs">{errors.email.message}</p> : null}
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input type="password" {...register("password")} />
          {errors.password ? (
            <p className="text-danger mt-1 text-xs">{errors.password.message}</p>
          ) : null}
        </div>
        <Button className="w-full" loading={isSubmitting} type="submit">
          Se connecter
        </Button>
      </form>
      <div className="text-text-soft mt-4 flex justify-between text-sm">
        <Link href="/signup">Creer un compte</Link>
        <Link href="/reset-password">Mot de passe oublie</Link>
      </div>
    </Card>
  );
}
