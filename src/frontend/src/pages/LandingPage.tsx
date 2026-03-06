import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ── Floating orb decorations ─────────────────────────────────────────────────

function FloatingOrb({
  size,
  color,
  top,
  left,
  delay,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: color,
        filter: "blur(80px)",
        opacity: 0,
      }}
      animate={{
        opacity: [0.18, 0.28, 0.18],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  );
}

// ── Feature pills ────────────────────────────────────────────────────────────

const features = [
  { icon: CheckCircle, label: "Habit Tracker" },
  { icon: TrendingUp, label: "Cash Flow" },
  { icon: Target, label: "Task Manager" },
  { icon: Users, label: "Community" },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const [error, setError] = useState<string | null>(null);
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    }
  };

  return (
    <div
      data-ocid="landing.section"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.07 0.012 290)" }}
    >
      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Primary orbs */}
        <FloatingOrb
          size={600}
          color="oklch(0.64 0.26 352)"
          top="-10%"
          left="-5%"
          delay={0}
        />
        <FloatingOrb
          size={500}
          color="oklch(0.50 0.27 293)"
          top="60%"
          left="70%"
          delay={2}
        />
        <FloatingOrb
          size={400}
          color="oklch(0.56 0.265 322)"
          top="40%"
          left="30%"
          delay={4}
        />
        <FloatingOrb
          size={300}
          color="oklch(0.64 0.26 352)"
          top="80%"
          left="10%"
          delay={1}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.50 0.27 293 / 0.05) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.50 0.27 293 / 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Vignette fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, oklch(0.07 0.012 290) 100%)",
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-3xl mx-auto w-full">
        {/* Logo */}
        <motion.div
          data-ocid="landing.logo"
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-primary"
            style={{
              boxShadow:
                "0 0 24px oklch(0.64 0.26 352 / 0.50), 0 0 8px oklch(0.50 0.27 293 / 0.30)",
            }}
          >
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="font-display text-3xl font-bold tracking-tight"
            style={{ color: "oklch(0.97 0.006 290)" }}
          >
            Elite Flow
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display font-bold leading-[1.05] tracking-tight mb-6"
          style={{
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            color: "oklch(0.97 0.006 290)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          Level Up <span className="text-gradient-brand">Your Life</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
          style={{ color: "oklch(0.60 0.018 290)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          Track habits, manage tasks, control your cash flow and grow with a
          powerful system.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="landing.signup_button"
            className="w-full sm:flex-1 h-13 text-base font-semibold relative overflow-hidden group"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.64 0.26 352), oklch(0.50 0.27 293))",
              color: "oklch(0.98 0 0)",
              border: "none",
              boxShadow:
                "0 4px 24px oklch(0.64 0.26 352 / 0.45), 0 0 0 1px oklch(0.64 0.26 352 / 0.20)",
              height: "52px",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            variant="outline"
            data-ocid="landing.login_button"
            className="w-full sm:flex-1 text-base font-semibold transition-all duration-200"
            style={{
              height: "52px",
              background: "oklch(0.11 0.018 290 / 0.60)",
              border: "1px solid oklch(0.50 0.27 293 / 0.45)",
              color: "oklch(0.90 0.010 290)",
              backdropFilter: "blur(8px)",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </motion.div>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "oklch(0.62 0.23 27 / 0.12)",
                border: "1px solid oklch(0.62 0.23 27 / 0.30)",
                color: "oklch(0.80 0.18 27)",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
        >
          {features.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: "oklch(0.13 0.022 290 / 0.80)",
                border: "1px solid oklch(0.50 0.27 293 / 0.25)",
                color: "oklch(0.70 0.015 290)",
                backdropFilter: "blur(12px)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.64 0.26 352)" }}
              />
              {label}
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-24 h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.50 0.27 293 / 0.40), transparent)",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        />

        {/* Security note */}
        <motion.div
          className="flex items-center gap-2 text-xs"
          style={{ color: "oklch(0.40 0.012 290)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Shield
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.64 0.26 352 / 0.60)" }}
          />
          Secured by Internet Identity — no passwords needed
        </motion.div>
      </div>

      {/* Bottom edge fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.07 0.012 290))",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
