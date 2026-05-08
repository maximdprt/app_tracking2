export function Skeleton({ className = "h-5 w-full" }: { className?: string }) {
  return <div className={`bg-surface-2 animate-pulse rounded-xl ${className}`} />;
}
