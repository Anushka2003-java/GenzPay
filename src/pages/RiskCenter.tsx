import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Link } from "react-router-dom";
import { SectionHeader, Badge, EmptyState } from "../components/ui";
import { endpoints, formatCompactINR, riskColors, type RiskBucket } from "../lib/api";

interface RiskRow {
  id: string;
  payment_id: string;
  risk_score: number;
  risk_level: string;
  revenue_at_risk: number;
  recovery_probability: number;
  created_at: string;
}

export default function RiskCenter() {
  const [buckets, setBuckets] = useState<RiskBucket[]>([]);
  const [rows, setRows] = useState<RiskRow[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    endpoints.riskDistribution().then((r) => setBuckets(r.data));
  }, []);

  useEffect(() => {
    endpoints.risks(filter ? `risk_level=${filter}&limit=40` : "limit=40").then((r) => setRows(r.data));
  }, [filter]);

  const pieData = buckets.map((b) => ({ name: b.risk_level, value: b.count }));

  return (
    <div className="pb-16">
      <SectionHeader title="Revenue Risk Center" subtitle="Every payment scored by the deterministic risk engine, ranked by exposure." />

      <div className="px-8 grid grid-cols-12 gap-4">
        <div className="col-span-4 glass rounded-2xl p-6 shadow-glass">
          <h3 className="text-sm font-medium text-cream-200 mb-2">Risk distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {pieData.map((d) => (
                  <Cell key={d.name} fill={riskColors[d.name] ?? "#A79E88"} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#131318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ color: "#CFC5AC", fontSize: 12, textTransform: "capitalize" }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-8 glass rounded-2xl p-6 shadow-glass">
          <h3 className="text-sm font-medium text-cream-200 mb-4">Exposure by risk level</h3>
          <div className="space-y-4">
            {buckets.map((b) => (
              <button
                key={b.risk_level}
                onClick={() => setFilter(filter === b.risk_level ? null : b.risk_level)}
                className={`w-full text-left ${filter === b.risk_level ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
              >
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="capitalize text-cream-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: riskColors[b.risk_level] }} />
                    {b.risk_level} · {b.count} payments
                  </span>
                  <span className="tabular-nums text-cream-400">{formatCompactINR(b.revenue_at_risk)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (b.revenue_at_risk / (buckets[0]?.revenue_at_risk || 1)) * 100)}%`,
                      backgroundColor: riskColors[b.risk_level],
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 mt-4">
        <div className="glass rounded-2xl shadow-glass overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-medium text-cream-200">
              At-risk payments {filter && <span className="text-cream-500">· filtered: {filter}</span>}
            </h3>
            {filter && (
              <button onClick={() => setFilter(null)} className="text-xs text-amber-400 hover:text-amber-300">
                Clear filter
              </button>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cream-500 border-b border-white/[0.06]">
                <th className="px-6 py-3 font-normal">Risk score</th>
                <th className="px-6 py-3 font-normal">Level</th>
                <th className="px-6 py-3 font-normal">Revenue at risk</th>
                <th className="px-6 py-3 font-normal">Recovery probability</th>
                <th className="px-6 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5}><EmptyState text="No at-risk payments match this filter" /></td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5 tabular-nums text-cream-200">{r.risk_score.toFixed(1)}</td>
                  <td className="px-6 py-3.5">
                    <Badge tone={r.risk_level === "low" ? "sage" : r.risk_level === "critical" ? "clay" : "amber"}>
                      {r.risk_level}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 tabular-nums text-cream-300">{formatCompactINR(r.revenue_at_risk)}</td>
                  <td className="px-6 py-3.5 tabular-nums text-cream-400">{Math.round(r.recovery_probability * 100)}%</td>
                  <td className="px-6 py-3.5 text-right">
                    <Link to={`/timeline?payment=${r.payment_id}`} className="text-xs text-amber-400 hover:text-amber-300">
                      View payment
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
