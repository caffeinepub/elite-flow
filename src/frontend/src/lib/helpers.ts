/**
 * Calculate streak for a habit (consecutive days ending today)
 */
export function calculateStreak(completions: bigint[]): number {
  if (completions.length === 0) return 0;

  const today = getDayStart(Date.now());
  const completionDays = new Set(
    completions.map((c) => getDayStart(Number(c))),
  );

  let streak = 0;
  let current = today;

  while (completionDays.has(current)) {
    streak++;
    current -= 24 * 60 * 60 * 1000;
  }

  return streak;
}

/**
 * Get the start of a day (midnight) in milliseconds
 */
export function getDayStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Check if a habit was completed today
 */
export function isCompletedToday(completions: bigint[]): boolean {
  const today = getDayStart(Date.now());
  return completions.some((c) => getDayStart(Number(c)) === today);
}

/**
 * Format a bigint timestamp (milliseconds) to a readable date/time
 */
export function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp);
  const date = new Date(ms);
  const now = new Date();

  const diffMs = now.getTime() - ms;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Format a number as Indian Rupees
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get avatar initials from a display name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a consistent color from a string
 */
export function stringToColor(str: string): string {
  const colors = [
    "oklch(0.55 0.18 264)",
    "oklch(0.55 0.18 150)",
    "oklch(0.55 0.18 30)",
    "oklch(0.55 0.18 300)",
    "oklch(0.55 0.18 70)",
    "oklch(0.55 0.18 220)",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
