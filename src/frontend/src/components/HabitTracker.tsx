import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Flame, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddHabit,
  useDeleteHabit,
  useGetHabits,
  useMarkHabitComplete,
} from "../hooks/useQueries";
import { calculateStreak, getDayStart, isCompletedToday } from "../lib/helpers";

export default function HabitTracker() {
  const [newHabit, setNewHabit] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: habits = [], isLoading } = useGetHabits();
  const addHabit = useAddHabit();
  const markComplete = useMarkHabitComplete();
  const deleteHabit = useDeleteHabit();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    try {
      await addHabit.mutateAsync(newHabit.trim());
      setNewHabit("");
      toast.success("Habit added!");
    } catch {
      toast.error("Failed to add habit");
    }
  };

  const handleToggle = async (
    habitId: bigint,
    currentCompletions: bigint[],
  ) => {
    const today = getDayStart(Date.now());
    const alreadyDone = isCompletedToday(currentCompletions);
    if (alreadyDone) return; // Can't uncheck in the current backend API

    try {
      await markComplete.mutateAsync({
        habitId,
        dayTimestamp: BigInt(today),
      });
    } catch {
      toast.error("Failed to mark habit");
    }
  };

  const handleDelete = async (habitId: bigint) => {
    setDeletingId(habitId);
    try {
      await deleteHabit.mutateAsync(habitId);
      toast.success("Habit removed");
    } catch {
      toast.error("Failed to delete habit");
    } finally {
      setDeletingId(null);
    }
  };

  const totalCompleted = habits.filter((h) =>
    isCompletedToday(h.completions),
  ).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg">Habit Tracker</h3>
          <p className="text-sm text-muted-foreground">
            {totalCompleted}/{habits.length} done today
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
          <Flame className="w-3.5 h-3.5 streak-flame" />
          Streaks
        </div>
      </div>

      {/* Add habit form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="New habit..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="h-9 flex-1"
          data-ocid="habit.input"
        />
        <Button
          type="submit"
          size="sm"
          className="h-9 px-3"
          disabled={!newHabit.trim() || addHabit.isPending}
          data-ocid="habit.add_button"
        >
          {addHabit.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Habit list */}
      <div className="flex-1 space-y-2 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="habit.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : habits.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 text-center"
            data-ocid="habit.empty_state"
          >
            <Flame className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No habits yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Add one above to start tracking!
            </p>
          </div>
        ) : (
          <div className="stagger-children">
            {habits.map((habit, index) => {
              const streak = calculateStreak(habit.completions);
              const doneToday = isCompletedToday(habit.completions);
              const ocidIndex = index + 1;

              return (
                <div
                  key={habit.id.toString()}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    doneToday
                      ? "bg-primary/5 border-primary/20"
                      : "bg-secondary/50 border-border hover:border-primary/20"
                  }`}
                  data-ocid={`habit.item.${ocidIndex}`}
                >
                  <Checkbox
                    checked={doneToday}
                    onCheckedChange={() =>
                      handleToggle(habit.id, habit.completions)
                    }
                    disabled={doneToday || markComplete.isPending}
                    className="flex-shrink-0"
                    data-ocid={`habit.checkbox.${ocidIndex}`}
                  />
                  <span
                    className={`flex-1 text-sm font-medium truncate ${
                      doneToday ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {habit.name}
                  </span>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-orange-500">
                      <Flame className="w-3 h-3 streak-flame" />
                      {streak}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => handleDelete(habit.id)}
                    disabled={deletingId === habit.id}
                    data-ocid={`habit.delete_button.${ocidIndex}`}
                  >
                    {deletingId === habit.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's progress bar */}
      {habits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Today's progress</span>
            <span>{Math.round((totalCompleted / habits.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full progress-bar-fill rounded-full"
              style={{ width: `${(totalCompleted / habits.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
