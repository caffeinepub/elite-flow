import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGetHabits, useGetTasks } from "../hooks/useQueries";

// ─── Level Config ─────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1, name: "Novice", minXP: 0, maxXP: 100 },
  { level: 2, name: "Apprentice", minXP: 100, maxXP: 300 },
  { level: 3, name: "Warrior", minXP: 300, maxXP: 600 },
  { level: 4, name: "Elite", minXP: 600, maxXP: 1000 },
  { level: 5, name: "Legend", minXP: 1000, maxXP: 1500 },
  { level: 6, name: "God", minXP: 1500, maxXP: Number.POSITIVE_INFINITY },
];

function getLevelData(totalXP: number) {
  const current =
    [...LEVELS].reverse().find((l) => totalXP >= l.minXP) ?? LEVELS[0];
  const isMaxLevel = current.level === LEVELS[LEVELS.length - 1].level;
  const xpIntoLevel = totalXP - current.minXP;
  const xpNeededForLevel = isMaxLevel
    ? Number.POSITIVE_INFINITY
    : current.maxXP - current.minXP;
  const progressPct = isMaxLevel
    ? 100
    : Math.min(100, (xpIntoLevel / xpNeededForLevel) * 100);

  return {
    level: current.level,
    name: current.name,
    xpIntoLevel,
    xpNeededForLevel,
    progressPct,
    isMaxLevel,
    minXP: current.minXP,
    maxXP: current.maxXP,
  };
}

// ─── XP Level Bar ─────────────────────────────────────────────────────────────

export default function XPLevelBar() {
  const { data: habits = [] } = useGetHabits();
  const { data: tasks = [] } = useGetTasks();

  // Compute total XP
  const habitXP = habits.reduce((acc, h) => acc + h.completions.length * 10, 0);
  const taskXP = tasks.filter((t) => t.completed).length * 20;
  const totalXP = habitXP + taskXP;

  const levelData = getLevelData(totalXP);

  // Detect level-up: compare previous level to current
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevLevelRef.current === null) {
      prevLevelRef.current = levelData.level;
      return;
    }
    if (levelData.level > prevLevelRef.current) {
      toast.success(
        `⚡ Level Up! You reached Level ${levelData.level} — ${levelData.name}!`,
        {
          duration: 4000,
          style: {
            background:
              "linear-gradient(135deg, oklch(0.64 0.26 352), oklch(0.50 0.27 293))",
            color: "white",
            border: "1px solid oklch(0.64 0.26 352 / 0.5)",
          },
        },
      );
    }
    prevLevelRef.current = levelData.level;
  }, [levelData.level, levelData.name]);

  const xpDisplay = levelData.isMaxLevel
    ? `${totalXP} XP — MAX`
    : `${levelData.xpIntoLevel} / ${levelData.xpNeededForLevel} XP`;

  return (
    <div
      className="p-4 lg:p-5 rounded-2xl bg-card card-glow animate-fade-in-up relative overflow-hidden"
      data-ocid="xp.panel"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 10% 50%, oklch(0.64 0.26 352), transparent 60%), radial-gradient(ellipse 60% 80% at 90% 50%, oklch(0.50 0.27 293), transparent 60%)",
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Level badge */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center gradient-brand shadow-glow-pink"
          data-ocid="xp.card"
        >
          <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase leading-none">
            LVL
          </span>
          <span className="text-2xl font-display font-black text-white leading-none">
            {levelData.level}
          </span>
        </div>

        {/* Progress info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-gradient-brand">
                {levelData.name}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {xpDisplay}
              </span>
            </div>
            {!levelData.isMaxLevel && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                Next: {levelData.maxXP} XP
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted/40 overflow-hidden relative">
            <div
              className="progress-bar-fill h-full rounded-full"
              style={{ width: `${levelData.progressPct}%` }}
            />
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.4) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.5s linear infinite",
              }}
            />
          </div>

          {/* XP display on mobile */}
          <p className="text-xs text-muted-foreground sm:hidden">{xpDisplay}</p>
        </div>

        {/* Total XP pill */}
        <div className="hidden md:flex flex-col items-end flex-shrink-0">
          <span className="text-xs text-muted-foreground">Total XP</span>
          <span className="text-lg font-display font-bold text-gradient-brand">
            {totalXP.toLocaleString()}
          </span>
        </div>
      </div>

      {/* XP breakdown hint */}
      <div className="relative mt-3 flex items-center gap-3 text-xs text-muted-foreground/60">
        <span>🔥 Habit = +10 XP</span>
        <span>✅ Task = +20 XP</span>
        {totalXP === 0 && (
          <span className="ml-1 text-muted-foreground/40">
            — Complete habits &amp; tasks to earn XP
          </span>
        )}
      </div>
    </div>
  );
}
