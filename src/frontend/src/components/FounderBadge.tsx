interface FounderBadgeProps {
  className?: string;
}

export function FounderBadge({ className = "" }: FounderBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gold/20 text-gold border border-gold/30 ${className}`}
      title="Founder"
    >
      👑 Founder
    </span>
  );
}

/** @deprecated Use `useIsFounder()` hook instead. Always returns false. */
export function isFounderUsername(_username: string): boolean {
  return false;
}
