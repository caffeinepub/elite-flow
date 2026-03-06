import React, { Suspense, lazy } from "react";
import Footer from "../components/Footer";
import { useGetCallerUserProfile } from "../hooks/useQueries";

// ─── Lazy-loaded heavy widgets ────────────────────────────────────────────────

const HabitTracker = lazy(() => import("../components/HabitTracker"));
const TaskManager = lazy(() => import("../components/TaskManager"));
const CashflowSystem = lazy(() => import("../components/CashflowSystem"));
const WealthGoal = lazy(() => import("../components/WealthGoal"));

// ─── Skeleton components ──────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="h-5 w-32 bg-muted/40 rounded-lg animate-pulse" />
      <div className="h-4 w-48 bg-muted/30 rounded animate-pulse" />
      <div className="flex-1 space-y-2 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 bg-muted/20 rounded-xl animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();
  const displayName = profile?.displayName ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header — renders immediately, no waiting for widgets */}
        <div className="animate-fade-in-up">
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your productivity overview for today.
          </p>
        </div>

        {/* Main panels grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Habit Tracker */}
          <div className="p-5 rounded-2xl bg-card card-glow min-h-80">
            <Suspense fallback={<CardSkeleton />}>
              <HabitTracker />
            </Suspense>
          </div>

          {/* Task Manager */}
          <div className="p-5 rounded-2xl bg-card card-glow min-h-80">
            <Suspense fallback={<CardSkeleton />}>
              <TaskManager />
            </Suspense>
          </div>

          {/* Cashflow System */}
          <div className="p-5 rounded-2xl bg-card card-glow min-h-80 md:col-span-2 xl:col-span-1">
            <Suspense fallback={<CardSkeleton />}>
              <CashflowSystem />
            </Suspense>
          </div>
        </div>

        {/* Wealth Goal — full width */}
        <Suspense
          fallback={
            <div className="h-24 bg-muted/20 rounded-2xl animate-pulse" />
          }
        >
          <WealthGoal />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
