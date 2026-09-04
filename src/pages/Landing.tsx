import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Workflow, Zap } from "lucide-react";
import RevenueOrb from "../components/3d/RevenueOrb";

const pillars = [
  {
    icon: Sparkles,
    title: "Diagnose, don't guess",
    body: "A deterministic risk engine scores every failed payment on explainable factors before AI ever sees it.",
  },
  {
    icon: Workflow,
    title: "Recommend, never execute",
    body: "The AI proposes one action. A separate policy engine has to approve it before anything happens.",
  },
  {
    icon: ShieldCheck,
    title: "Guardrails on money movement",
    body: "Retry limits, cooldowns, amount ceilings and forced escalation — enforced in code, not prompts.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 text-cream-100 overflow-x-hidden">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center">
            <span className="text-ink-950 font-display font-semibold text-sm">G</span>
          </div>
          <span className="font-display text-lg tracking-tight">GenzPay</span>
        </div>
        <Link
          to="/dashboard"
          className="text-sm px-4 py-2 rounded-full glass hover:bg-white/[0.08] transition-colors flex items-center gap-1.5"
        >
          Open Recovery Command Center <ArrowRight size={14} />
        </Link>
      </nav>

      <section className="max-w-7xl mx-auto px-8 pt-14 pb-24 grid grid-cols-12 gap-8 items-center">
        <div className="col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs glass text-amber-300">
              Razorpay AI Buildathon · Revenue Recovery Track
            </span>
            <h1 className="font-display text-5xl leading-[1.08] mt-6 max-w-xl">
              Recover the revenue<br />you almost lost.
            </h1>
            <p className="text-cream-400 mt-6 max-w-md leading-relaxed">
              GenzPay uses AI to detect payment revenue at risk, choose the right recovery
              intervention, and measure the money actually recovered.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <Link
                to="/dashboard"
                className="px-5 py-3 rounded-full bg-amber-400 text-ink-950 text-sm font-medium hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-glow"
              >
                Open Recovery Command Center <ArrowRight size={15} />
              </Link>
              <Link
                to="/simulate"
                className="px-5 py-3 rounded-full glass text-sm text-cream-200 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
              >
                <Zap size={14} className="text-amber-400" /> Run Live Simulation
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="col-span-5 h-[420px] relative">
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 45%, rgba(221,171,83,0.14), transparent 60%)" }} />
          <RevenueOrb recoveryRate={57} activeCases={28} />
        </div>
      </section>

      {/* Live-looking product preview */}
      <section className="max-w-7xl mx-auto px-8 -mt-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 shadow-glass grid grid-cols-4 gap-4"
        >
          {[
            { label: "Money at risk", value: "₹10.68L", tone: "text-clay-400" },
            { label: "Revenue recovered", value: "₹2.76L", tone: "text-sage-400" },
            { label: "Recovery rate", value: "20.5%", tone: "text-amber-300" },
            { label: "Intervention queue", value: "123", tone: "text-cream-200" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[11px] text-cream-500 uppercase tracking-wide mb-1.5">{s.label}</div>
              <div className={`font-display text-2xl tabular-nums ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div key={p.title}>
              <p.icon size={20} className="text-amber-400 mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-cream-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl mb-4">One loop, fully explainable</h2>
              <p className="text-cream-500 leading-relaxed mb-6">
                Every recovered rupee traces back through the same path — visible
                to merchants, not hidden behind a black box.
              </p>
              <div className="flex items-center gap-2 text-sm text-cream-300 flex-wrap">
                <span>Revenue at risk</span>
                <ArrowRight size={13} className="text-amber-400/60" />
                <span>AI diagnosis</span>
                <ArrowRight size={13} className="text-amber-400/60" />
                <span>Safe intervention</span>
                <ArrowRight size={13} className="text-amber-400/60" />
                <span className="text-sage-400">Money recovered</span>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                "Detect revenue at risk from failed or abandoned payments",
                "Score risk deterministically across six weighted factors",
                "AI diagnoses the failure and recommends one action",
                "Policy engine validates against hard guardrails",
                "Action executes, outcome recorded, revenue recovered",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-4 text-sm text-cream-300">
                  <span className="font-display text-amber-400/70 w-5 shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10 text-center text-xs text-cream-500">
        GenzPay — built for the Razorpay AI Buildathon. Running in simulated mode; no live payments are moved.
      </footer>
    </div>
  );
}
