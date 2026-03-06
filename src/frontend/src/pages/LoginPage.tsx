import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, TrendingUp, Users, Zap } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    setError(null);
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Login failed";
        if (message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          setError(message);
        }
      }
    }
  };

  const features = [
    { icon: CheckCircle2, label: "Habit Tracker", desc: "Build daily streaks" },
    {
      icon: TrendingUp,
      label: "Cashflow System",
      desc: "Track income & expenses",
    },
    { icon: Zap, label: "Task Manager", desc: "Stay productive" },
    { icon: Users, label: "Community", desc: "Connect with others" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-sidebar relative overflow-hidden">
        {/* Background mesh */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, oklch(0.58 0.18 264) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, oklch(0.55 0.2 280) 0%, transparent 50%),
              radial-gradient(circle at 60% 40%, oklch(0.75 0.17 70) 0%, transparent 40%)
            `,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-sidebar-foreground">
              Elite Flow
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold text-sidebar-foreground leading-tight mb-6">
            Master your
            <br />
            <span className="text-gradient-brand">daily flow</span>
          </h1>
          <p className="text-sidebar-foreground/60 text-lg leading-relaxed max-w-sm">
            Track habits, manage tasks, control your cashflow — all in one
            powerful productivity platform.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/50 backdrop-blur-sm"
            >
              <Icon
                className="w-5 h-5 text-primary mb-2"
                style={{ color: "oklch(0.65 0.18 264)" }}
              />
              <div className="font-display font-semibold text-sidebar-foreground text-sm">
                {label}
              </div>
              <div className="text-sidebar-foreground/50 text-xs mt-0.5">
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Elite Flow</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to continue your journey
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold shadow-primary"
              data-ocid="auth.login_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>

            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant="outline"
              className="w-full h-12 text-base"
              data-ocid="auth.signup_button"
            >
              Create new account
            </Button>
          </div>

          {error && (
            <div
              className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              data-ocid="auth.error_state"
            >
              {error}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Secured by Internet Identity — no passwords needed
          </p>
        </div>
      </div>
    </div>
  );
}
