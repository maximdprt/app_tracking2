import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background grid min-h-screen lg:grid-cols-2">
      <section className="border-border hidden border-r bg-[linear-gradient(135deg,rgba(163,230,53,0.04)_0%,transparent_50%)] p-12 lg:flex lg:flex-col lg:justify-center">
        <h1 className="max-w-xl text-5xl font-semibold tracking-tight">
          Lift. Discipline. Performance.
        </h1>
        <p className="text-text-soft mt-4 max-w-lg text-base">
          Ton cockpit quotidien pour progresser en nutrition et en entrainement.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Link href="/login" className="text-text-soft inline-block text-sm">
            Lift
          </Link>
          {children}
        </div>
      </section>
    </div>
  );
}
