import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Cpu, WifiOff } from "lucide-react";
import { SectionHeader, Badge, ConfidenceBar, EmptyState, LoadingState, ErrorState } from "../components/ui";
import { endpoints, formatCompactINR, timeAgo, actionLabels, type RecoveryCase } from "../lib/api";

export default function AIDecisionCenter() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [provider, setProvider] = useState<{ ai_provider: string; payment_provider: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      endpoints.cases("limit=30").then((r) => setCases(r.data.filter((c) => c.recommended_action))),
      endpoints.policySettings().then((r) => setProvider(r.data as { ai_provider: string; payment_provider: string })),
    ])
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const fallbackCount = cases.filter((c) =>
    c.ai_recommendations?.some((r) => r.fallback_used)
  ).length;

  return (
    <div className="pb-16">
      <SectionHeader
        title="AI Decision Center"
        subtitle="Every recommendation the reasoning layer has produced, with its confidence and outcome."
        right={
          provider && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-cream-400">
              <Cpu size={12} className="text-amber-400" />
              Provider: {provider.ai_provider}
            </div>
          )
        }
      />

      {fallbackCount > 0 && (
        <div className="px-8 mb-4">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-400/[0.06] border border-amber-400/20 text-xs text-amber-300">
            <WifiOff size={14} />
            {fallbackCount} recommendation{fallbackCount === 1 ? "" : "s"} used the deterministic fallback reasoner —
            the primary AI provider was unavailable or returned an invalid response, and GenzPay never left a case unhandled because of it.
          </div>
        </div>
      )}

      <div className="px-8 space-y-3">
        {loading && <LoadingState label="Loading AI recommendations" />}
        {!loading && error && <ErrorState onRetry={load} />}
        {!loading && !error && cases.length === 0 && <EmptyState text="No AI recommendations recorded yet" />}
        {!loading && !error && cases.map((c) => {
          const rec = c.ai_recommendations?.[c.ai_recommendations.length - 1];
          return (
            <Link
              to={`/recovery-cases/${c.id}`}
              key={c.id}
              className="block glass rounded-2xl p-5 shadow-glass hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-amber-400" />
                    <span className="text-sm text-cream-200">{c.payment?.customer?.name ?? "Customer"}</span>
                    <span className="text-xs text-cream-500">· {formatCompactINR(c.revenue_at_risk)} at risk</span>
                    {rec?.fallback_used && <Badge tone="amber">fallback used</Badge>}
                  </div>
                  <p className="text-sm text-cream-400 leading-relaxed line-clamp-2">
                    {rec?.diagnosis || rec?.reasoning || "Reasoning unavailable"}
                  </p>
                </div>
                <div className="shrink-0 text-right space-y-2">
                  <Badge tone="amber">{c.recommended_action ? actionLabels[c.recommended_action] : "—"}</Badge>
                  {rec && <ConfidenceBar value={rec.confidence} />}
                  <div className="text-[11px] text-cream-500">{rec ? timeAgo(rec.generated_at) : ""}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
