import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader, Badge } from "../components/ui";
import { endpoints, formatINR, failureTypeOptions, type SimulateFailureResult, type TimelineStep } from "../lib/api";

const STAGE_ICONS: Record<string, string> = {
  DETECTING: "🔍",
  ANALYZING: "📊",
  DIAGNOSING: "🩺",
  SELECTING_INTERVENTION: "🎯",
  VALIDATING_POLICY: "🛡️",
  EXECUTING_RECOVERY: "⚡",
  RECOVERED: "✅",
  OUTCOME: "📋",
};

export default function SimulateFailure() {
  const [amount, setAmount] = useState(2499);
  const [failureType, setFailureType] = useState("temporary_card_decline");
  const [method, setMethod] = useState("card");
  const [running, setRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<TimelineStep[]>([]);
  const [result, setResult] = useState<SimulateFailureResult | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    setVisibleSteps([]);
    try {
      const { data } = await endpoints.simulateFailure({
        amount, currency: "INR", failure_type: failureType, payment_method: method,
      });
      // Real backend steps, played back at a natural pace — not a fabricated animation.
      for (let i = 0; i < data.steps.length; i++) {
        await new Promise((r) => setTimeout(r, 550));
        setVisibleSteps((prev) => [...prev, data.steps[i]]);
      }
      setResult(data);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="pb-16">
      <SectionHeader
        title="Simulate Revenue Loss"
        subtitle="Trigger a real payment failure and watch GenzPay's actual recovery pipeline react — every step below is a genuine backend response, never a fabricated animation."
      />

      <div className="px-8 grid grid-cols-12 gap-4">
        <div className="col-span-5 glass rounded-2xl p-6 shadow-glass h-fit">
          <h3 className="text-sm font-medium text-cream-200 mb-5">Payment details</h3>

          <label className="block text-xs text-cream-500 mb-1.5">Amount (INR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full mb-4 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-cream-100 text-sm outline-none focus:border-amber-400/50"
          />

          <label className="block text-xs text-cream-500 mb-1.5">Payment method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-cream-100 text-sm outline-none focus:border-amber-400/50"
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Netbanking</option>
            <option value="wallet">Wallet</option>
          </select>

          <label className="block text-xs text-cream-500 mb-1.5">Failure type</label>
          <div className="space-y-1.5 mb-6">
            {failureTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFailureType(opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  failureType === opt.value ? "bg-amber-400/15 text-amber-300 border border-amber-400/30" : "bg-white/[0.03] text-cream-400 border border-transparent hover:bg-white/[0.05]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={running}
            className="w-full px-4 py-3 rounded-full bg-amber-400 text-ink-950 text-sm font-medium hover:bg-amber-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {running ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {running ? "Running GenzPay…" : "Run GenzPay"}
          </button>
          <p className="text-[11px] text-cream-500 mt-3 text-center">
            Runs against an existing loyal demo customer profile so risk scoring has real history to reason over.
          </p>
        </div>

        <div className="col-span-7 glass rounded-2xl p-6 shadow-glass min-h-[400px]">
          <h3 className="text-sm font-medium text-cream-200 mb-5">Live recovery pipeline</h3>

          {visibleSteps.length === 0 && !running && (
            <div className="flex items-center justify-center h-64 text-sm text-cream-500">
              Configure a failure and press "Run GenzPay" to watch it work.
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {visibleSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-lg leading-none">{STAGE_ICONS[step.stage] ?? "•"}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-cream-200">{step.label}</div>
                    <div className="text-xs text-cream-500 mt-0.5">{step.detail}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {result && !running && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="mt-6 p-6 rounded-2xl border text-center relative overflow-hidden"
              style={{
                borderColor: result.recovered ? "rgba(143,191,159,0.3)" : "rgba(217,122,102,0.3)",
                background: result.recovered ? "rgba(143,191,159,0.06)" : "rgba(217,122,102,0.06)",
              }}
            >
              {result.recovered && (
                <motion.div
                  initial={{ opacity: 0.5, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2.2 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "radial-gradient(circle, rgba(143,191,159,0.35), transparent 70%)" }}
                />
              )}
              <div className="relative">
                {result.recovered ? (
                  <CheckCircle2 size={30} className="text-sage-400 mx-auto mb-3" />
                ) : (
                  <XCircle size={30} className="text-clay-400 mx-auto mb-3" />
                )}
                <div className="font-display text-3xl text-cream-100 tabular-nums">
                  {result.recovered ? `${formatINR(result.recovered_amount)} RECOVERED` : "Not recovered yet"}
                </div>
                {!result.recovered && (
                  <p className="text-xs text-cream-500 mt-2 max-w-xs mx-auto">
                    GenzPay's policy engine routed this case to <span className="text-cream-300">{result.final_status.replace(/_/g, " ")}</span> instead
                    of auto-recovering it — see the full case for exactly why.
                  </p>
                )}
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Badge tone={result.recovered ? "sage" : "amber"}>{result.final_status.replace(/_/g, " ")}</Badge>
                  {result.recovery_case_id && (
                    <Link to={`/recovery-cases/${result.recovery_case_id}`} className="text-xs text-amber-400 hover:text-amber-300">
                      View full case detail →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
