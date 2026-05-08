"use client";

import { createClient } from "@/services/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu } from "@/components/ui/DropdownMenu";

export function UserMenu({ email }: { email: string | undefined }) {
  const short =
    email && email.length > 24 ? `${email.slice(0, 24)}...` : (email ?? "user@lift.app");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <DropdownMenu
      trigger={
        <div className="border-border bg-surface-2 flex w-full items-center gap-3 rounded-xl border px-3 py-2">
          <Avatar email={email} />
          <p className="text-text-soft max-w-40 truncate text-xs">{short}</p>
        </div>
      }
      items={[
        { label: "Profil", onClick: () => (window.location.href = "/profile") },
        { label: "Deconnexion", onClick: () => void handleSignOut() },
      ]}
    />
  );
}
