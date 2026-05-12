"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { createClient } from "@/services/supabase/client";
import { ROUTES } from "@/constants/routes";
import { truncateEmail } from "@/lib/format";

interface UserMenuProps {
  email: string | undefined;
}

export function UserMenu({ email }: UserMenuProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(ROUTES.login);
    router.refresh();
  }

  return (
    <DropdownMenu
      align="left"
      trigger={
        <div className="flex items-center gap-2 rounded-full px-2 py-2 text-left transition-colors hover:bg-surface-2">
          <Avatar fallback={email?.[0] ?? "?"} size="sm" />
          <span className="truncate md-body-medium text-text-soft">
            {email ? truncateEmail(email, 18) : "Utilisateur"}
          </span>
        </div>
      }
      items={[
        {
          label: "Profil",
          icon: <User className="h-3.5 w-3.5" />,
          onClick: () => router.push(ROUTES.profile),
        },
        {
          label: "Déconnexion",
          icon: <LogOut className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: handleLogout,
        },
      ]}
    />
  );
}
