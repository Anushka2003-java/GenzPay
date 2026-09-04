import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, animate } from "framer-motion";
import { AlertCircle, Inbox, Loader2, WifiOff, Sparkles } from "lucide-react";

// ---------- Animated numbers ----------
// Counts up from 0 to `value` once on mount / whenever value changes meaningfully.
// Respects prefers-reduced-motion (jumps straight to the final value).
export function CountUp({
  value, format, duration = 1.1,
}: { value: number; format: (n: number) => string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();
  const prevTarget = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const from = prevTarget.current ?? 0;
    prevTarget.current = value;
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{format(display)}</>;
}

// ---------- Stat card ----------
export function StatCard({
  label, value, sub, accent = "cream", icon,
}: { label: string; value: ReactNode; sub?: string; accent?: "cream" | "amber" | "sage" | "clay"; icon?: ReactNode }) {
  const accentColor = {
    cream: "text-cream-200",
    amber: "text-amber-300",
    sage: "text-sage-400",
    clay: "text-clay-400",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5 shadow-glass"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-cream-500 tracking-wide uppercase">{label}</span>
        {icon && <span className="text-cream-500">{icon}</span>}
      </div>
      <div className={`font-display text-3xl tabular-nums ${accentColor}`}>{value}</div>
      {sub && <div className="text-xs text-cream-500 mt-1.5">{sub}</div>}
    </motion.div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "amber" | "sage" | "clay" | "cream" }) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.06] text-cream-400",
    amber: "bg-amber-400/10 text-amber-300",
    sage: "bg-sage-400/10 text-sage-400",
    clay: "bg-clay-400/10 text-clay-400",
    cream: "bg-cream-400/10 text-cream-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "#8FBF9F" : pct >= 45 ? "#DDAB53" : "#D97A66";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums text-cream-400">{pct}%</span>
    </div>
  );
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between px-8 pt-8 pb-6">
      <div>
        <h1 className="font-display text-2xl text-cream-100">{title}</h1>
        {subtitle && <p className="text-sm text-cream-500 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// ---------- State components: loading / empty / error ----------
// One vocabulary used everywhere so the product never shows a blank screen.

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-cream-500">
      <Loader2 size={20} className="animate-spin text-amber-400" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-cream-500">
      {icon ?? <Inbox size={18} className="text-cream-500/60" />}
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function ErrorState({ text = "Something went wrong talking to GenzPay's API.", onRetry }: { text?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertCircle size={20} className="text-clay-400" />
      <span className="text-sm text-cream-400 max-w-xs">{text}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-full glass">
          Try again
        </button>
      )}
    </div>
  );
}

export function AIUnavailableState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <WifiOff size={20} className="text-amber-400" />
      <span className="text-sm text-cream-300 max-w-sm">
        The AI reasoning provider is unavailable — GenzPay has fallen back to its deterministic
        recovery rules so nothing stalls.
      </span>
    </div>
  );
}

export function AIProcessingIndicator({ label = "GenzPay is thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-amber-300">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
      >
        <Sparkles size={15} />
      </motion.span>
      <span className="text-sm">{label}…</span>
    </div>
  );
}

// ---------- Recovery journey stage tracker ----------
// Shared between Recovery Case Detail and the Simulate panel so the same
// visual vocabulary for "where is this case right now" appears everywhere.
export type JourneyStageStatus = "done" | "active" | "pending" | "failed";

export function JourneyStages({
  stages,
}: { stages: { label: string; status: JourneyStageStatus; detail?: string }[] }) {
  return (
    <div className="flex items-start">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${
                stage.status === "done"
                  ? "bg-sage-500/15 border-sage-400/40 text-sage-400"
                  : stage.status === "active"
                  ? "bg-amber-400/15 border-amber-400/50 text-amber-300"
                  : stage.status === "failed"
                  ? "bg-clay-500/15 border-clay-400/40 text-clay-400"
                  : "bg-white/[0.03] border-white/10 text-cream-500"
              }`}
            >
              {stage.status === "done" ? "✓" : i + 1}
            </motion.div>
            <div className="text-center">
              <div className={`text-[11px] font-medium tracking-wide uppercase ${stage.status === "pending" ? "text-cream-500" : "text-cream-200"}`}>
                {stage.label}
              </div>
              {stage.detail && <div className="text-[10px] text-cream-500 mt-0.5 max-w-[90px]">{stage.detail}</div>}
            </div>
          </div>
          {i < stages.length - 1 && (
            <div className="flex-1 h-px mx-1 mt-[-20px] bg-gradient-to-r from-white/10 to-white/5" />
          )}
        </div>
      ))}
    </div>
  );
}
