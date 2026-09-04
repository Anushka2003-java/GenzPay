import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, Zap, TrendingDown, Clock, Brain } from "lucide-react";
import { Badge, ConfidenceBar, EmptyState, LoadingState, JourneyStages, AIProcessingIndicator, AIUnavailableState, type JourneyStageStatus } from "../components/ui";
import { endpoints, formatINR, timeAgo, actionLabels, policyDecisionLabels, type RecoveryCase, type WhatIf, type TimelineStep } from "../lib/api";
import { settingsCache } from "../lib/policyCache";

export default function RecoveryCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [c, setCase] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [whatIf, setWhatIf] = useState<WhatIf | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [maxRetries, setMaxRetries] = useState<number | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);

  const load = () => {
    if (!id) return;
    endpoints.case(id).then((r) => setCase(r.data)).finally(() => setLoading(false));
    endpoints.caseWhatIf(id).then((r) => setWhatIf(r.data)).catch(() => setWhatIf(null));
    endpoints.caseTimeline(id).then((r) => setTimeline(r.data.steps)).catch(() => setTimeline([]));
    settingsCache().then((s) => setMaxRetries(s?.max_retry_attempts ?? null));
  };

  useEffect(load, [id]);

  const runAnalysis = async () => {
    if (!c) return;
    setBusy(true);
    setAnalysisFailed(false);
    try {
      await endpoints.analyzePayment(c.payment_id);
      load();
    } catch {
      // The backend itself falls back to a deterministic reasoner on AI
      // failure — a thrown error here means the request never even reached
      // that far (network/API down), which is worth surfacing distinctly.
      setAnalysisFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const manualAction = async (action: string) => {
    if (!c) return;
    setBusy(true);
    try {
      await endpoints.manualAction(c.id, action, "Manual merchant override from case detail view");
      load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading recovery case" />;
  if (!c) return <div className="p-8"><EmptyState text="Recovery case not found" /></div>;

  const latestRec = c.ai_recommendations?.[c.ai_recommendations.length - 1];
  const payment = c.payment;
  const latest = latestAction(c);

  // Journey stages: DETECTED -> DIAGNOSED -> DECISION -> GUARDRAIL -> ACTION -> RESULT
  const journey: { label: string; status: JourneyStageStatus; detail?: string }[] = [
    { label: "Detected", status: "done", detail: `Risk ${c.risk_score.toFixed(0)}` },
    { label: "Diagnosed", status: latestRec ? "done" : "active" },
    { label: "Decision", status: latestRec ? "done" : "pending", detail: latestRec ? actionLabels[latestRec.recommended_action] : undefined },
    { label: "Guardrail", status: latest ? "done" : latestRec ? "active" : "pending", detail: latest ? (policyDecisionLabels[latest.policy_decision] ?? latest.policy_decision) : undefined },
    { label: "Action", status: latest?.status === "executed" ? "done" : latest ? "active" : "pending" },
    {
      label: "Result",
      status: c.status === "recovered" ? "done" : c.status === "unrecoverable" ? "failed" : latest?.status === "executed" ? "active" : "pending",
      detail: c.status === "recovered" ? formatINR(c.recovered_amount) : undefined,
    },
  ];

  return (
    <div className="pb-16">
      <div className="px-8 pt-8">
        <Link to="/recovery-cases" className="text-xs text-cream-500 hover:text-cream-300 flex items-center gap-1.5 mb-4">
          <ArrowLeft size={13} /> Back to recovery cases
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] tracking-[0.15em] text-cream-500 mb-1.5">RECOVERY CASE · {payment?.customer?.name ?? "CUSTOMER"}</div>
            <div className="font-display text-4xl text-cream-100 tabular-nums">{payment ? formatINR(payment.amount) : "—"}</div>
            <p className="text-sm text-cream-500 mt-1">Revenue at risk · {payment?.customer?.email}</p>
          </div>
          <Badge tone={c.status === "recovered" ? "sage" : c.status === "escalated" || c.status === "unrecoverable" ? "clay" : "amber"}>
            {c.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Recovery journey */}
      <div className="px-8 mt-6">
        <div className="glass rounded-2xl p-6 shadow-glass overflow-x-auto">
          <JourneyStages stages={journey} />
        </div>
      </div>

      {/* Key stats */}
      <div className="px-8 grid grid-cols-4 gap-4 mt-4">
        {[
          { label: "Failure reason", value: payment?.failure_reason.replace(/_/g, " ") ?? "—" },
          { label: "Risk score", value: `${c.risk_score.toFixed(1)} / 100` },
          { label: "Recovery probability", value: `${Math.round(c.recovery_probability * 100)}%` },
          { label: "Retry attempts", value: `${c.retry_count}${maxRetries !== null ? ` / ${maxRetries}` : ""}` },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 shadow-glass">
            <div className="text-xs text-cream-500 mb-2">{s.label}</div>
            <div className="font-display text-xl text-cream-100 capitalize">{s.value}</div>
          </div>
        ))}
      </div>

      {/* What if GenzPay had not intervened */}
      {whatIf && (
        <div className="px-8 mt-4">
          <div className="glass rounded-2xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={15} className="text-amber-400" />
              <h3 className="text-sm font-medium text-cream-200 tracking-wide">What if GenzPay had not intervened?</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-clay-500/[0.06] border border-clay-500/20">
                <div className="text-xs text-cream-500 mb-1.5">Without GenzPay</div>
                <div className="font-display text-xl text-clay-400">{formatINR(whatIf.without_intervention_loss)} lost</div>
              </div>
              <div className="p-4 rounded-xl bg-sage-500/[0.06] border border-sage-500/20">
                <div className="text-xs text-cream-500 mb-1.5">With GenzPay</div>
                <div className="font-display text-xl text-sage-400">
                  {whatIf.recovered ? `${formatINR(whatIf.with_genzpay_recovered)} recovered` : "Not yet recovered"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                <div className="text-xs text-cream-500 mb-1.5">Revenue saved by intervention</div>
                <div className="font-display text-xl text-amber-300">{formatINR(whatIf.estimated_impact)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 grid grid-cols-12 gap-4 mt-4">
        {/* GenzPay Thinks */}
        <div className="col-span-7 glass rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={15} className="text-amber-400" />
            <h3 className="text-sm font-medium text-amber-300 tracking-[0.1em] uppercase">GenzPay thinks</h3>
          </div>
          {latestRec ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              {latestRec.diagnosis && (
                <p className="text-sm text-cream-300 mb-4 leading-relaxed">{latestRec.diagnosis}</p>
              )}
              <div className="text-xs text-cream-500 mb-2">Why?</div>
              <ul className="space-y-2 mb-5">
                {(latestRec.factors?.key_factors ?? []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-cream-300">
                    <CheckCircle2 size={14} className="text-sage-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {latestRec.risk_flags && latestRec.risk_flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {latestRec.risk_flags.map((flag) => (
                    <Badge key={flag} tone="clay">{flag.replace(/_/g, " ")}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <div className="text-xs text-cream-500 mb-1">Recommendation</div>
                  <div className="font-display text-lg text-amber-300">{actionLabels[latestRec.recommended_action]}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-cream-500 mb-1">Confidence</div>
                  <ConfidenceBar value={latestRec.confidence} />
                </div>
              </div>
              {latestRec.expected_recovery > 0 && (
                <div className="text-xs text-cream-500 mt-3">
                  Expected recovery: <span className="text-cream-300">{formatINR(latestRec.expected_recovery)}</span>
                </div>
              )}

              {/* Why this is safe */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <div className="text-xs text-cream-500 mb-2.5">Why this is safe</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-cream-500">Max retries</div>
                    <div className="text-cream-200 tabular-nums mt-0.5">{maxRetries ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-cream-500">Current retries</div>
                    <div className="text-cream-200 tabular-nums mt-0.5">{c.retry_count}</div>
                  </div>
                  <div>
                    <div className="text-cream-500">Policy</div>
                    <div className={`mt-0.5 font-medium ${latest?.policy_passed ? "text-sage-400" : "text-clay-400"}`}>
                      {latest ? (latest.policy_passed ? "PASSED" : "REVIEW") : "PENDING"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-cream-500 mt-4">
                Generated by {latestRec.model_name} ({latestRec.provider}){latestRec.fallback_used && " · AI fallback used"} · {timeAgo(latestRec.generated_at)}
              </div>
            </motion.div>
          ) : (
            <div className="mt-6">
              {analysisFailed ? (
                <AIUnavailableState />
              ) : (
                <EmptyState text="No AI recommendation yet for this case" />
              )}
              {busy ? (
                <div className="flex justify-center py-3">
                  <AIProcessingIndicator label="GenzPay is diagnosing this payment" />
                </div>
              ) : (
                <button
                  onClick={runAnalysis}
                  disabled={busy}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg bg-amber-400 text-ink-950 text-sm font-medium hover:bg-amber-300 disabled:opacity-50"
                >
                  Run AI analysis
                </button>
              )}
            </div>
          )}
        </div>

        {/* Decision pipeline */}
        <div className="col-span-5 glass rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={15} className="text-sage-400" />
            <h3 className="text-sm font-medium text-cream-200 tracking-wide">Policy status</h3>
          </div>
          <ol className="space-y-0">
            {["AI Recommendation", "Policy Validation", latest ? (policyDecisionLabels[latest.policy_decision] ?? latest.policy_decision) : "Pending", "Recovery Action", "Result"].map((stage, i, arr) => (
              <li key={stage} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5" />
                  {i < arr.length - 1 && <div className="w-px flex-1 bg-white/[0.08] my-1" />}
                </div>
                <div className="pb-6 text-sm text-cream-300">{stage}</div>
              </li>
            ))}
          </ol>

          {latest && (
            <div className="mt-2 pt-4 border-t border-white/[0.06]">
              <div className="text-xs text-cream-500 mb-2">Policy checks</div>
              <div className="space-y-1.5">
                {latest.policy_checks.map((check) => (
                  <div key={check.rule} className="flex items-start gap-2 text-xs">
                    {check.passed ? (
                      <CheckCircle2 size={13} className="text-sage-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-clay-400 mt-0.5 shrink-0" />
                    )}
                    <span className="text-cream-400">{check.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {latest?.action_type === "MARK_FOR_REVIEW" && (
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex gap-2">
              <button onClick={() => manualAction("RETRY_PAYMENT")} disabled={busy} className="flex-1 px-3 py-2 rounded-lg bg-sage-500/20 text-sage-400 text-xs hover:bg-sage-500/30 disabled:opacity-50">
                Approve retry
              </button>
              <button onClick={() => manualAction("STOP_RECOVERY")} disabled={busy} className="flex-1 px-3 py-2 rounded-lg bg-clay-500/20 text-clay-400 text-xs hover:bg-clay-500/30 disabled:opacity-50">
                Stop recovery
              </button>
            </div>
          )}

          {c.status === "deferred" && (
            <button
              onClick={runAnalysis}
              disabled={busy}
              className="w-full mt-4 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 disabled:opacity-50"
            >
              Retry now (cooldown may still apply)
            </button>
          )}
        </div>
      </div>

      {/* AI Explainability timeline */}
      {timeline.length > 0 && (
        <div className="px-8 mt-4">
          <div className="glass rounded-2xl p-6 shadow-glass">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-amber-400" />
              <h3 className="text-sm font-medium text-cream-200">Explainability timeline</h3>
            </div>
            <ol className="space-y-0">
              {timeline.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-sage-400 mt-1.5" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/[0.08] my-1" />}
                  </div>
                  <div className="pb-5">
                    <div className="text-sm text-cream-200">{step.label}</div>
                    <div className="text-xs text-cream-500 mt-0.5">{step.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Action history */}
      <div className="px-8 mt-4">
        <div className="glass rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-amber-400" />
            <h3 className="text-sm font-medium text-cream-200">Action history</h3>
          </div>
          <div className="space-y-3">
            {(c.actions ?? []).length === 0 && <EmptyState text="No actions taken yet" />}
            {(c.actions ?? []).slice().reverse().map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  <Badge tone={a.status === "executed" ? "sage" : a.status === "rejected" ? "clay" : "amber"}>{a.status}</Badge>
                  <span className="text-cream-300">{actionLabels[a.action_type] ?? a.action_type}</span>
                </div>
                <span className="text-xs text-cream-500">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function latestAction(c: RecoveryCase) {
  if (!c.actions || c.actions.length === 0) return null;
  return c.actions[c.actions.length - 1];
}
