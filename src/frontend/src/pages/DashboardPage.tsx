import CashflowSystem from "../components/CashflowSystem";
import Footer from "../components/Footer";
import HabitTracker from "../components/HabitTracker";
import TaskManager from "../components/TaskManager";
import WealthGoal from "../components/WealthGoal";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();
  const displayName = profile?.displayName ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header */}
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
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card min-h-80">
            <HabitTracker />
          </div>

          {/* Task Manager */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card min-h-80">
            <TaskManager />
          </div>

          {/* Cashflow System */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card min-h-80 md:col-span-2 xl:col-span-1">
            <CashflowSystem />
          </div>
        </div>

        {/* Wealth Goal - full width */}
        <WealthGoal />
      </div>
      <Footer />
    </div>
  );
}
