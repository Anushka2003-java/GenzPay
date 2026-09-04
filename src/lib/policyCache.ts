import { endpoints } from "./api";

interface PolicySettings {
  max_retry_attempts: number;
  min_retry_interval_minutes: number;
  max_recovery_amount: number;
  max_auto_approve_confidence_threshold: number;
  ai_provider: string;
  payment_provider: string;
}

let cached: PolicySettings | null = null;
let inflight: Promise<PolicySettings | null> | null = null;

export function settingsCache(): Promise<PolicySettings | null> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = endpoints
    .policySettings()
    .then((r) => {
      cached = r.data as PolicySettings;
      return cached;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
