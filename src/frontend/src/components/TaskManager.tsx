import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddTask,
  useCompleteTask,
  useDeleteTask,
  useGetTasks,
} from "../hooks/useQueries";

export default function TaskManager() {
  const [newTask, setNewTask] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: tasks = [], isLoading } = useGetTasks();
  const addTask = useAddTask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const completionRate =
    tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await addTask.mutateAsync(newTask.trim());
      setNewTask("");
      toast.success("Task added!");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const handleComplete = async (taskId: bigint) => {
    try {
      await completeTask.mutateAsync(taskId);
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const handleDelete = async (taskId: bigint) => {
    setDeletingId(taskId);
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task removed");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const allTasks = [...incomplete, ...completed];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg">Task Manager</h3>
          <p className="text-sm text-muted-foreground">
            {completed.length} of {tasks.length} tasks completed (
            {completionRate}%)
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
          <Target className="w-3.5 h-3.5" />
          {completionRate}%
        </div>
      </div>

      {/* Add task form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="h-9 flex-1"
          data-ocid="task.input"
        />
        <Button
          type="submit"
          size="sm"
          className="h-9 px-3"
          disabled={!newTask.trim() || addTask.isPending}
          data-ocid="task.add_button"
        >
          {addTask.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Task list */}
      <div className="flex-1 space-y-2 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="task.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : allTasks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 text-center"
            data-ocid="task.empty_state"
          >
            <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Add a task to get started!
            </p>
          </div>
        ) : (
          <div className="stagger-children">
            {allTasks.map((task, index) => {
              const ocidIndex = index + 1;
              return (
                <div
                  key={task.id.toString()}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    task.completed
                      ? "bg-secondary/30 border-border/50 opacity-60"
                      : "bg-secondary/50 border-border hover:border-primary/20"
                  }`}
                  data-ocid={`task.item.${ocidIndex}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() =>
                      !task.completed && handleComplete(task.id)
                    }
                    disabled={task.completed || completeTask.isPending}
                    className="flex-shrink-0"
                    data-ocid={`task.checkbox.${ocidIndex}`}
                  />
                  <span
                    className={`flex-1 text-sm font-medium truncate ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    data-ocid={`task.delete_button.${ocidIndex}`}
                  >
                    {deletingId === task.id ? (
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

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Productivity</span>
            <span>{completionRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRate}%`,
                background:
                  "linear-gradient(90deg, oklch(0.64 0.26 352), oklch(0.50 0.27 293))",
                boxShadow:
                  completionRate > 0
                    ? "0 0 8px oklch(0.64 0.26 352 / 0.45)"
                    : "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
