import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronDown, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { SectionHeader, Badge, EmptyState, LoadingState } from "../components/ui";
import { endpoints, type AuditLogEntry } from "../lib/api";

const EVENT_META: Record<string, { tone: "amber" | "sage" | "clay" | "cream"; icon: typeof ShieldCheck }> = {
  "recovery_case.created": { tone: "clay", icon: AlertTriangle },
  "policy.evaluated": { tone: "amber", icon: ShieldCheck },
  "policy.deferred": { tone: "amber", icon: ShieldCheck },
  "policy.rejected": { tone: "clay", icon: ShieldCheck },
  "policy.no_action": { tone: "cream", icon: ShieldCheck },
  "recovery_action.executed": { tone: "sage", icon: CheckCircle2 },
  "recovery_action.failed": { tone: "clay", icon: AlertTriangle },
  "recovery_action.manual_override": { tone: "cream", icon: Sparkles },
  "ai_provider.fallback": { tone: "amber", icon: Sparkles },
};

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    endpoints.auditLogs("limit=150").then((r) => setLogs(r.data)).finally(() => setLoading(false));
  }, []);

  let lastDay = "";

  return (
    <div className="pb-16">
      <SectionHeader
        title="Audit Trail"
        subtitle="An immutable, append-only record of every decision and action GenzPay has taken. Click an event for its metadata."
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-cream-400">
            <ShieldCheck size={12} className="text-sage-400" /> {logs.length} events
          </div>
        }
      />

      <div className="px-8">
        {loading && <LoadingState label="Loading audit trail" />}
        {!loading && logs.length === 0 && <EmptyState text="No audit events recorded yet" />}

        <div className="relative">
          {!loading && logs.length > 0 && (
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.08]" />
          )}
          <div className="space-y-1">
            {logs.map((log, i) => {
              const meta = EVENT_META[log.event] ?? { tone: "cream" as const, icon: ShieldCheck };
              const Icon = meta.icon;
              const day = formatDay(log.timestamp);
              const showDayDivider = day !== lastDay;
              lastDay = day;
              const isOpen = expanded === log.id;

              return (
                <div key={log.id}>
                  {showDayDivider && (
                    <div className="text-[11px] text-cream-500 tracking-wide uppercase pl-9 pt-4 pb-1">{day}</div>
                  )}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i, 20) * 0.015 }}
                    onClick={() => setExpanded(isOpen ? null : log.id)}
                    className="w-full text-left flex items-start gap-3 py-2.5 relative"
                  >
                    <div className="w-8 flex justify-center shrink-0 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-ink-900 ${
                        meta.tone === "sage" ? "bg-sage-400/20" : meta.tone === "clay" ? "bg-clay-400/20" : meta.tone === "amber" ? "bg-amber-400/20" : "bg-cream-400/20"
                      }`}>
                        <Icon size={11} className={
                          meta.tone === "sage" ? "text-sage-400" : meta.tone === "clay" ? "text-clay-400" : meta.tone === "amber" ? "text-amber-400" : "text-cream-400"
                        } />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 -mt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] tabular-nums text-cream-500">{formatClock(log.timestamp)}</span>
                        <Badge tone={meta.tone}>{log.event}</Badge>
                        <span className="text-[11px] text-cream-500">{log.actor}</span>
                      </div>
                      <p className="text-sm text-cream-300">{log.reason ?? log.action}</p>
                    </div>
                    <ChevronDown size={14} className={`text-cream-500 mt-1 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </motion.button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-11"
                      >
                        <pre className="text-[11px] text-cream-500 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 mb-3 overflow-x-auto">
{JSON.stringify({ entity_type: log.entity_type, entity_id: log.entity_id, ...log.log_metadata }, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
