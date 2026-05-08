import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuthStore();
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await signIn(values.email, values.password);
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center gap-4">
        <Text className="text-3xl font-bold text-text">Connexion</Text>
        <Controller control={control} name="email" render={({ field }) => <Input label="Email" value={field.value} onChangeText={field.onChange} keyboardType="email-address" />} />
        <Controller control={control} name="password" render={({ field }) => <Input label="Mot de passe" value={field.value} onChangeText={field.onChange} />} />
        <Button label={loading ? "Chargement..." : "Se connecter"} onPress={handleSubmit(onSubmit)} disabled={loading} />
        <Link href="/(auth)/signup" asChild><Text className="text-center text-primary">Creer un compte</Text></Link>
      </View>
    </ScreenContainer>
  );
}
