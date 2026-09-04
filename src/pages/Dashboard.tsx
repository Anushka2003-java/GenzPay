import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, TrendingUp, Zap, AlertTriangle, Sparkles, ShieldCheck, CheckCircle2, Radar } from "lucide-react";
import { Link } from "react-router-dom";
import RevenueOrb from "../components/3d/RevenueOrb";
import { StatCard, Badge, EmptyState, LoadingState, ErrorState, CountUp } from "../components/ui";
import {
  endpoints, formatCompactINR, timeAgo, actionLabels,
  type DashboardSummary, type TimeseriesPoint, type RecoveryCase, type AuditLogEntry, type FailureReasonCount,
} from "../lib/api";

const EVENT_ICON: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  "recovery_case.created": { icon: AlertTriangle, color: "text-clay-400" },
  "policy.evaluated": { icon: ShieldCheck, color: "text-sage-400" },
  "recovery_action.executed": { icon: CheckCircle2, color: "text-amber-300" },
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [series, setSeries] = useState<TimeseriesPoint[]>([]);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [activity, setActivity] = useState<AuditLogEntry[]>([]);
  const [failures, setFailures] = useState<FailureReasonCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      endpoints.summary().then((r) => setSummary(r.data)),
      endpoints.timeseries(21).then((r) => setSeries(r.data)),
      endpoints.cases("limit=6").then((r) => setCases(r.data)),
      endpoints.aiActivity(10).then((r) => setActivity(r.data)),
      endpoints.failureReasons().then((r) => setFailures(r.data.slice(0, 5))),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="pb-16">
      <div className="px-8 pt-8 pb-2 flex items-start justify-between">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-amber-400/80 mb-1.5">GENZPAY · AI REVENUE RECOVERY</div>
          <h1 className="font-display text-2xl text-cream-100">Revenue Recovery Command Center</h1>
          <p className="text-sm text-cream-500 mt-1">Lumen Fitness Studios · recovery intelligence synced moments ago</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/simulate"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-ink-950 text-xs font-medium hover:bg-amber-300 transition-colors shadow-glow"
          >
            <Zap size={13} /> Simulate revenue loss
          </Link>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full glass text-xs text-sage-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
            Recovery agent active
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading recovery intelligence" />
      ) : error ? (
        <ErrorState text="Couldn't reach GenzPay's API. Check the backend is running." onRetry={load} />
      ) : (
        <>
          {/* Hero: orb + primary stats */}
          <div className="px-8 grid grid-cols-12 gap-4 mt-6">
            <div className="col-span-4 glass rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-glass">
              <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 50% 40%, rgba(221,171,83,0.12), transparent 65%)" }} />
              <div className="w-full h-48 relative z-10">
                <RevenueOrb recoveryRate={summary?.recovery_rate ?? 0} activeCases={summary?.active_cases ?? 0} />
              </div>
              <div className="relative z-10 text-center mt-2">
                <div className="font-display text-3xl text-amber-300 tabular-nums">
                  <CountUp value={summary?.recovery_rate ?? 0} format={(n) => `${n.toFixed(1)}%`} />
                </div>
                <div className="text-xs text-cream-500 mt-1">Recovery core · {summary?.active_cases ?? 0} active cases</div>
              </div>
            </div>

            <div className="col-span-8 grid grid-cols-2 gap-4">
              <StatCard
                label="Money at risk"
                value={<CountUp value={summary?.revenue_at_risk ?? 0} format={formatCompactINR} />}
                sub="Across open & in-progress cases"
                accent="clay"
              />
              <StatCard
                label="Revenue recovered"
                value={<CountUp value={summary?.revenue_recovered ?? 0} format={formatCompactINR} />}
                sub="Cumulative, all time"
                accent="sage"
              />
              <StatCard
                label="Payments analyzed"
                value={<CountUp value={summary?.total_payments ?? 0} format={(n) => Math.round(n).toLocaleString("en-IN")} />}
                sub={summary ? `${summary.total_failed_payments} failed or abandoned` : ""}
                accent="cream"
              />
              <StatCard
                label="Intervention queue"
                value={<CountUp value={summary?.active_cases ?? 0} format={(n) => Math.round(n).toLocaleString("en-IN")} />}
                sub="Currently being worked"
                accent="amber"
              />
            </div>
          </div>

          {/* Chart + failure reasons */}
          <div className="px-8 grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-8 glass rounded-2xl p-6 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-cream-200">Revenue recovery trend</h3>
                  <p className="text-xs text-cream-500 mt-0.5">At-risk vs. recovered, last 21 days</p>
                </div>
                <TrendingUp size={16} className="text-sage-400" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={series} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97A66" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#D97A66" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DDAB53" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#DDAB53" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A79E88" }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#A79E88" }} tickFormatter={(v) => formatCompactINR(v)} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: "#131318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "#CFC5AC" }}
                    formatter={(v) => formatCompactINR(Number(v))}
                  />
                  <Area type="monotone" dataKey="revenue_at_risk" name="At risk" stroke="#D97A66" fill="url(#riskGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="revenue_recovered" name="Recovered" stroke="#DDAB53" fill="url(#recGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-4 glass rounded-2xl p-6 shadow-glass">
              <h3 className="text-sm font-medium text-cream-200 mb-4">Top failure reasons</h3>
              <div className="space-y-3">
                {failures.length === 0 && <EmptyState text="No failures recorded yet" />}
                {failures.map((f) => (
                  <div key={f.failure_reason} className="flex items-center justify-between text-sm">
                    <span className="text-cream-400 capitalize">{f.failure_reason.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-cream-500 text-xs tabular-nums">{f.count}</span>
                      <span className="text-amber-400 text-xs tabular-nums w-16 text-right">{formatCompactINR(f.revenue_at_risk)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent cases + AI activity feed */}
          <div className="px-8 grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-7 glass rounded-2xl p-6 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-cream-200">Intervention queue</h3>
                <Link to="/recovery-cases" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>
              <div className="space-y-1">
                {cases.length === 0 && <EmptyState text="No recovery cases yet" icon={<Radar size={18} className="text-cream-500/60" />} />}
                {cases.map((c) => (
                  <Link
                    to={`/recovery-cases/${c.id}`}
                    key={c.id}
                    className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-cream-200 truncate">{c.payment?.customer?.name ?? "Customer"}</div>
                      <div className="text-xs text-cream-500">
                        {c.recommended_action ? actionLabels[c.recommended_action] : "Awaiting recommendation"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs tabular-nums text-cream-400">{formatCompactINR(c.revenue_at_risk)}</span>
                      <Badge tone={c.status === "recovered" ? "sage" : c.status === "escalated" ? "clay" : "amber"}>
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="col-span-5 glass rounded-2xl p-6 shadow-glass">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-amber-400" />
                <h3 className="text-sm font-medium text-cream-200">Recovery intelligence stream</h3>
              </div>
              <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                {activity.length === 0 && <EmptyState text="No activity yet" />}
                {activity.map((a, i) => {
                  const meta = EVENT_ICON[a.event] ?? { icon: Zap, color: "text-cream-400" };
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-2.5 py-2 border-b border-white/[0.03] last:border-0"
                    >
                      <Icon size={13} className={`${meta.color} mt-0.5 shrink-0`} />
                      <div className="min-w-0">
                        <div className="text-xs text-cream-300 leading-relaxed">{a.reason || a.action}</div>
                        <div className="text-[11px] text-cream-500 mt-0.5">{a.actor} · {timeAgo(a.timestamp)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
