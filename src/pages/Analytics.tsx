import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { SectionHeader, EmptyState } from "../components/ui";
import { endpoints, formatCompactINR, type FunnelStage, type TimeseriesPoint, type DashboardSummary } from "../lib/api";

export default function Analytics() {
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [series, setSeries] = useState<TimeseriesPoint[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    endpoints.funnel().then((r) => setFunnel(r.data));
    endpoints.timeseries(30).then((r) => setSeries(r.data));
    endpoints.summary().then((r) => setSummary(r.data));
  }, []);

  return (
    <div className="pb-16">
      <SectionHeader title="Analytics" subtitle="How revenue moves through the recovery funnel over time." />

      <div className="px-8 grid grid-cols-3 gap-4 mb-4">
        <MiniStat label="Recovery rate" value={summary ? `${summary.recovery_rate}%` : "—"} />
        <MiniStat label="Total recovered" value={summary ? formatCompactINR(summary.revenue_recovered) : "—"} />
        <MiniStat label="Payments analyzed" value={summary ? summary.total_payments.toLocaleString("en-IN") : "—"} />
      </div>

      <div className="px-8 grid grid-cols-12 gap-4">
        <div className="col-span-6 glass rounded-2xl p-6 shadow-glass">
          <h3 className="text-sm font-medium text-cream-200 mb-4">Recovery funnel</h3>
          {funnel.length === 0 ? <EmptyState text="No funnel data yet" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#A79E88" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "#CFC5AC" }} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#131318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" fill="#DDAB53" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="col-span-6 glass rounded-2xl p-6 shadow-glass">
          <h3 className="text-sm font-medium text-cream-200 mb-4">Recovered revenue, 30 days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A79E88" }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A79E88" }} tickFormatter={(v) => formatCompactINR(v)} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: "#131318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => formatCompactINR(Number(v))}
              />
              <Line type="monotone" dataKey="revenue_recovered" stroke="#8FBF9F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-glass">
      <div className="text-xs text-cream-500 mb-2">{label}</div>
      <div className="font-display text-2xl text-cream-100 tabular-nums">{value}</div>
    </div>
  );
}
