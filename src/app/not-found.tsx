import Link from "next/link";
import { Button } from "@/components/ui/Button";
export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="border-border bg-surface w-full max-w-md rounded-2xl border p-6 text-center">
        <h2 className="text-2xl font-semibold">404</h2>
        <p className="text-text-soft mt-2 text-sm">Cette page n&apos;existe pas.</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button>Retour dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
