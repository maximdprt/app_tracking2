"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const links = ["/dashboard", "/nutrition", "/training", "/stats", "/habits", "/coach", "/profile"];

export function SidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 lg:hidden">
          <div className="border-border bg-surface rounded-2xl border p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold">Lift</p>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {links.map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:bg-surface-2 block rounded-xl px-3 py-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  {href.replace("/", "") || "dashboard"}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
