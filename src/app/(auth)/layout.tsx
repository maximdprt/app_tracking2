import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <section className="hidden border-r border-border bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.12)_0%,transparent_50%)] p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-lg bg-primary text-black">
            L
          </span>
          Lift
        </Link>
        <div className="space-y-6">
          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight">
            Discipline.
            <br />
            <span className="bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent">
              Performance.
            </span>
            <br />
            Clarté.
          </h1>
          <p className="max-w-md text-base text-text-soft">
            Ton coach fitness et nutrition intelligent — un produit pensé pour devenir
            quotidien.
          </p>
        </div>
        <div className="text-xs text-muted">
          © {new Date().getFullYear()} Lift — Construit avec rigueur.
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center p-6 lg:min-h-0">
        <div className="w-full max-w-sm space-y-6">{children}</div>
      </section>
    </div>
  );
}
