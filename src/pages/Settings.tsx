import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { endpoints } from "../lib/api";

interface PolicySettings {
  max_retry_attempts: number;
  min_retry_interval_minutes: number;
  max_recovery_amount: number;
  max_auto_approve_confidence_threshold: number;
  ai_provider: string;
  payment_provider: string;
}

export default function Settings() {
  const [policy, setPolicy] = useState<PolicySettings | null>(null);

  useEffect(() => {
    endpoints.policySettings().then((r) => setPolicy(r.data as PolicySettings));
  }, []);

  return (
    <div className="pb-16">
      <SectionHeader title="Settings & Integrations" subtitle="Recovery Policy Engine configuration and connected providers." />

      <div className="px-8 grid grid-cols-12 gap-4">
        <div className="col-span-7 glass rounded-2xl p-6 shadow-glass">
          <h3 className="text-sm font-medium text-cream-200 mb-1">Recovery Policy Engine — guardrails</h3>
          <p className="text-xs text-cream-500 mb-5">
            These limits are enforced in code before any recovery action executes. The AI cannot override them.
          </p>
          {policy && (
            <div className="grid grid-cols-2 gap-4">
              <PolicyRow label="Max retry attempts" value={policy.max_retry_attempts} />
              <PolicyRow label="Min retry interval" value={`${policy.min_retry_interval_minutes} min`} />
              <PolicyRow label="Max autonomous recovery amount" value={`₹${policy.max_recovery_amount.toLocaleString("en-IN")}`} />
              <PolicyRow label="Min confidence for auto-approve" value={`${Math.round(policy.max_auto_approve_confidence_threshold * 100)}%`} />
            </div>
          )}
        </div>

        <div className="col-span-5 space-y-4">
          <div className="glass rounded-2xl p-6 shadow-glass">
            <h3 className="text-sm font-medium text-cream-200 mb-4">Connected providers</h3>
            <div className="space-y-3">
              <ProviderRow name="AI reasoning provider" value={policy?.ai_provider ?? "—"} />
              <ProviderRow name="Payment provider" value={policy?.payment_provider ?? "—"} />
            </div>
          </div>
          <div className="glass rounded-2xl p-6 shadow-glass">
            <h3 className="text-sm font-medium text-cream-200 mb-2">Architecture note</h3>
            <p className="text-xs text-cream-500 leading-relaxed">
              AI never calls the payment provider directly. Every recommendation passes through the policy
              engine first — recommend, validate, execute, audit, in that order, every time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="text-xs text-cream-500 mb-1.5">{label}</div>
      <div className="font-display text-lg text-cream-100 tabular-nums">{value}</div>
    </div>
  );
}

function ProviderRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-cream-400">{name}</span>
      <span className="flex items-center gap-1.5 text-xs text-sage-400 capitalize">
        <CheckCircle2 size={13} /> {value}
      </span>
    </div>
  );
}
