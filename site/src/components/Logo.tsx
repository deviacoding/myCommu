export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="16" fill="var(--night)" />
      <circle cx="32" cy="24" r="8" fill="var(--gold-soft)" />
      <path d="M14 50c2-10 9-15 18-15s16 5 18 15" fill="none" stroke="var(--gold-soft)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="18" cy="30" r="4" fill="var(--on-night)" opacity=".85" />
      <circle cx="46" cy="30" r="4" fill="var(--on-night)" opacity=".85" />
    </svg>
  );
}
