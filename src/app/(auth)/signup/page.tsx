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
  password: z.string().min(6, "Mot de passe trop faible (min. 6 caracteres)."),
});

type Values = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        ...values,
        options: { emailRedirectTo: `${window.location.origin}/confirm` },
      });
      if (error) throw new AppError("AUTH", error.message, error);

      toast.success("Compte cree, confirme ton email.");
      router.push("/confirm");
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    }
  });

  return (
    <Card>
      <h2 className="text-2xl font-semibold">Inscription</h2>
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
          Creer mon compte
        </Button>
      </form>
      <p className="text-text-soft mt-4 text-sm">
        Deja inscrit ? <Link href="/login">Connexion</Link>
      </p>
    </Card>
  );
}
