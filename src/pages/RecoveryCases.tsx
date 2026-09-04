import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader, Badge, EmptyState, LoadingState } from "../components/ui";
import { endpoints, formatCompactINR, timeAgo, actionLabels, type RecoveryCase } from "../lib/api";

const statuses = ["all", "open", "in_progress", "recovered", "escalated", "unrecoverable"];

export default function RecoveryCases() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = status === "all" ? "limit=100" : `status=${status}&limit=100`;
    endpoints.cases(params).then((r) => {
      setCases(r.data);
      setLoading(false);
    });
  }, [status]);

  return (
    <div className="pb-16">
      <SectionHeader
        title="Recovery Cases"
        subtitle="Every payment currently being worked by the recovery pipeline."
        right={
          <div className="flex gap-1 glass rounded-full p-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${
                  status === s ? "bg-amber-400 text-ink-950" : "text-cream-400 hover:text-cream-200"
                }`}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-8">
        <div className="glass rounded-2xl shadow-glass overflow-hidden">
          {loading ? (
            <LoadingState label="Loading recovery cases" />
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cream-500 border-b border-white/[0.06]">
                <th className="px-6 py-3 font-normal">Customer</th>
                <th className="px-6 py-3 font-normal">Risk</th>
                <th className="px-6 py-3 font-normal">Revenue at risk</th>
                <th className="px-6 py-3 font-normal">Recommended action</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 font-normal">Opened</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 && (
                <tr><td colSpan={6}><EmptyState text="No cases match this status" /></td></tr>
              )}
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer">
                  <td className="px-0 py-0" colSpan={6}>
                    <Link to={`/recovery-cases/${c.id}`} className="grid grid-cols-6 items-center px-0 py-0 w-full">
                      <span className="px-6 py-3.5 text-cream-200 truncate">{c.payment?.customer?.name ?? "Customer"}</span>
                      <span className="px-6 py-3.5 tabular-nums text-cream-400">{c.risk_score.toFixed(0)}</span>
                      <span className="px-6 py-3.5 tabular-nums text-cream-300">{formatCompactINR(c.revenue_at_risk)}</span>
                      <span className="px-6 py-3.5 text-cream-400">
                        {c.recommended_action ? actionLabels[c.recommended_action] : "—"}
                      </span>
                      <span className="px-6 py-3.5">
                        <Badge tone={c.status === "recovered" ? "sage" : c.status === "escalated" || c.status === "unrecoverable" ? "clay" : "amber"}>
                          {c.status.replace(/_/g, " ")}
                        </Badge>
                      </span>
                      <span className="px-6 py-3.5 text-cream-500 text-xs">{timeAgo(c.created_at)}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
