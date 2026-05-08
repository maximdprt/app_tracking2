import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  return (
    <Card>
      <h2 className="text-2xl font-semibold">Reset password</h2>
      <p className="text-text-soft mt-2 text-sm">Version V1 : ecran preparatoire.</p>
      <div className="mt-5 space-y-3">
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="toi@email.com" />
        </div>
        <Button className="w-full">Envoyer le lien</Button>
      </div>
    </Card>
  );
}
