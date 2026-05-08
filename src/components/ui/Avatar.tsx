export function Avatar({ email }: { email: string | undefined }) {
  const letter = email?.[0]?.toUpperCase() ?? "U";
  return (
    <div className="border-border bg-surface-2 grid h-9 w-9 place-items-center rounded-full border text-sm">
      {letter}
    </div>
  );
}
