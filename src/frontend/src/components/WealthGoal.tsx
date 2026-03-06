import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetWealthProgress, useSetWealthGoal } from "../hooks/useQueries";
import { clamp, formatINR } from "../lib/helpers";

export default function WealthGoal() {
  const { data: progress, isLoading } = useGetWealthProgress();
  const setGoal = useSetWealthGoal();
  const [goalInput, setGoalInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (progress?.goal && progress.goal > 0) {
      setGoalInput(progress.goal.toString());
    }
  }, [progress?.goal]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(goalInput);
    if (Number.isNaN(amount) || amount <= 0) return;
    try {
      await setGoal.mutateAsync(amount);
      setIsEditing(false);
      toast.success("Wealth goal updated!");
    } catch {
      toast.error("Failed to save goal");
    }
  };

  const goal = progress?.goal ?? 0;
  const currentSavings = progress?.currentSavings ?? 0;
  const percentage = clamp(progress?.percentage ?? 0, 0, 100);
  const hasGoal = goal > 0;

  const milestones = [25, 50, 75, 100];

  return (
    <div
      data-ocid="wealth.progress_panel"
      className="p-6 rounded-2xl bg-card border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Wealth Goal</h3>
            <p className="text-sm text-muted-foreground">
              {hasGoal
                ? `${formatINR(currentSavings)} saved toward your goal`
                : "Set a financial goal to track progress"}
            </p>
          </div>
        </div>

        {hasGoal && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-xs"
          >
            Edit Goal
          </Button>
        )}
      </div>

      {/* Goal setting form */}
      {(!hasGoal || isEditing) && (
        <form onSubmit={handleSave} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              ₹
            </span>
            <Input
              type="number"
              placeholder="1000000"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="pl-7 h-10"
              min="1"
              data-ocid="wealth.goal_input"
            />
          </div>
          <Button
            type="submit"
            className="h-10"
            disabled={!goalInput || setGoal.isPending}
            data-ocid="wealth.save_button"
          >
            {setGoal.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Update"
            ) : (
              "Set Goal"
            )}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
        </form>
      )}

      {/* Progress display */}
      {hasGoal && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-display font-bold text-foreground">
                {formatINR(currentSavings)}
              </div>
              <div className="text-xs text-muted-foreground">
                Current Savings
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-xl font-display font-bold"
                style={{ color: "oklch(var(--gold))" }}
              >
                {percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-display font-bold text-foreground">
                {formatINR(goal)}
              </div>
              <div className="text-xs text-muted-foreground">Goal</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
              {isLoading ? (
                <div className="h-full w-1/3 bg-muted animate-pulse rounded-full" />
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.55 0.18 264), oklch(0.76 0.17 72))",
                    boxShadow:
                      percentage > 0
                        ? "0 0 12px oklch(0.76 0.17 72 / 0.4)"
                        : "none",
                  }}
                />
              )}
            </div>

            {/* Milestone markers */}
            <div className="relative h-4">
              {milestones.map((m) => (
                <div
                  key={m}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${m}%`, transform: "translateX(-50%)" }}
                >
                  <div
                    className={`w-0.5 h-2 rounded-full transition-colors ${
                      percentage >= m ? "bg-primary" : "bg-border"
                    }`}
                  />
                  <span
                    className={`text-[10px] ${percentage >= m ? "text-primary font-medium" : "text-muted-foreground"}`}
                  >
                    {m}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {percentage >= 100 && (
            <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-center">
              <span
                className="text-sm font-semibold"
                style={{ color: "oklch(var(--gold))" }}
              >
                🎉 Congratulations! You've reached your wealth goal!
              </span>
            </div>
          )}

          {percentage >= 50 && percentage < 100 && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <span className="text-sm text-muted-foreground">
                Halfway there! Keep going 🚀
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
