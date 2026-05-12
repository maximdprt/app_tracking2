"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/services/supabase/client";
import { createCustomFood, customFoodToFoodItem } from "@/services/supabase/queries/foods";
import { useUser } from "@/hooks/useUser";
import type { FoodItem } from "@/types/domain";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: (food: FoodItem) => void;
}

interface FieldDef {
  key: keyof Fields;
  label: string;
  required?: boolean;
}

interface Fields {
  nom: string;
  calories_100g: string;
  proteines_100g: string;
  glucides_100g: string;
  lipides_100g: string;
  fibres_100g: string;
}

const FIELDS: FieldDef[] = [
  { key: "nom", label: "Nom de l'aliment", required: true },
  { key: "calories_100g", label: "Calories (kcal/100g)", required: true },
  { key: "proteines_100g", label: "Protéines (g/100g)" },
  { key: "glucides_100g", label: "Glucides (g/100g)" },
  { key: "lipides_100g", label: "Lipides (g/100g)" },
  { key: "fibres_100g", label: "Fibres (g/100g)" },
];

const DEFAULTS: Fields = {
  nom: "",
  calories_100g: "",
  proteines_100g: "0",
  glucides_100g: "0",
  lipides_100g: "0",
  fibres_100g: "0",
};

export function CreateCustomFoodModal({ open, onClose, onAdded }: Props) {
  const { data: user } = useUser();
  const [fields, setFields] = useState<Fields>(DEFAULTS);

  function set(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Non authentifié");
      if (!fields.nom.trim()) throw new Error("Nom requis");
      const kcal = parseFloat(fields.calories_100g);
      if (Number.isNaN(kcal) || kcal < 0) throw new Error("Calories invalides");

      const supabase = createClient();
      return createCustomFood(supabase, {
        user_id: user.id,
        nom: fields.nom.trim(),
        calories_100g: kcal,
        proteines_100g: parseFloat(fields.proteines_100g) || 0,
        glucides_100g: parseFloat(fields.glucides_100g) || 0,
        lipides_100g: parseFloat(fields.lipides_100g) || 0,
        sucres_100g: 0,
        fibres_100g: parseFloat(fields.fibres_100g) || 0,
        sel_100g: 0,
      });
    },
    onSuccess: (cf) => {
      toast.success("Aliment créé ✓");
      setFields(DEFAULTS);
      onAdded(customFoodToFoodItem(cf));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur création"),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }} title="Créer un aliment personnalisé">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        {FIELDS.map(({ key, label, required }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium text-text-soft">
              {label}
              {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
            <Input
              type={key === "nom" ? "text" : "number"}
              value={fields[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={key === "nom" ? "ex: Yaourt maison" : "0"}
              min={key !== "nom" ? 0 : undefined}
              step={key !== "nom" ? "0.1" : undefined}
              required={required}
            />
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="flex-1" loading={mutation.isPending}>
            Créer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
