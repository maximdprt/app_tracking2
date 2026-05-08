"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthInput } from "@/features/auth/schemas";
import { signUp } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toUserMessage } from "@/types/domain";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: AuthInput) => {
    setError(null);
    setLoading(true);
    try {
      await signUp(values.email, values.password);
      router.push("/login");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Inscription</h1>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Input placeholder="Email" {...form.register("email")} />
        <Input placeholder="Mot de passe" type="password" {...form.register("password")} />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button disabled={loading} className="w-full" type="submit">
          {loading ? "Creation..." : "Creer mon compte"}
        </Button>
      </form>
      <p className="text-muted text-sm">
        Deja un compte ?{" "}
        <Link className="text-primary" href="/login">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
