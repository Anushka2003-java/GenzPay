import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL: API_BASE });

// ---- Types ----
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_successful_payments: number;
  total_failed_payments: number;
  lifetime_value: number;
  is_subscriber: boolean;
}

export interface PaymentAttempt {
  id: string;
  attempt_number: number;
  status: string;
  failure_reason: string;
  initiated_by: string;
  created_at: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  failure_reason: string;
  payment_method: string;
  is_subscription: boolean;
  recovered_amount: number;
  created_at: string;
  customer?: Customer;
  attempts?: PaymentAttempt[];
}

export interface AIRecommendation {
  id: string;
  diagnosis: string;
  reasoning: string;
  confidence: number;
  recommended_action: string;
  expected_recovery: number;
  risk_flags: string[];
  requires_human_review: boolean;
  factors: { key_factors?: string[]; context?: Record<string, unknown> };
  model_name: string;
  provider: string;
  fallback_used: boolean;
  fallback_reason?: string | null;
  generated_at: string;
}

export interface RecoveryActionRecord {
  id: string;
  action_type: string;
  status: string;
  policy_decision: string;
  policy_checks: { rule: string; passed: boolean; detail: string }[];
  policy_passed: boolean;
  rejection_reason?: string | null;
  result?: Record<string, unknown> | null;
  created_at: string;
  executed_at?: string | null;
}

export interface RecoveryCase {
  id: string;
  payment_id: string;
  risk_score: number;
  revenue_at_risk: number;
  recommended_action?: string | null;
  action_status: string;
  recovery_probability: number;
  recovered_amount: number;
  status: string;
  retry_count: number;
  created_at: string;
  resolved_at?: string | null;
  payment?: Payment;
  diagnosis?: string;
  ai_recommendations?: AIRecommendation[];
  actions?: RecoveryActionRecord[];
}

export interface DashboardSummary {
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  active_cases: number;
  payments_analyzed: number;
  total_payments: number;
  total_failed_payments: number;
  average_recovery_time_minutes?: number | null;
  recovery_attempts: number;
  successful_recoveries: number;
  failed_recoveries: number;
  escalations: number;
  stopped_recoveries: number;
  deferred_cases: number;
  human_review_cases: number;
}

export interface TimeseriesPoint {
  date: string;
  revenue_at_risk: number;
  revenue_recovered: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface RiskBucket {
  risk_level: string;
  count: number;
  revenue_at_risk: number;
}

export interface FailureReasonCount {
  failure_reason: string;
  count: number;
  revenue_at_risk: number;
}

export interface AuditLogEntry {
  id: string;
  event: string;
  actor: string;
  action: string;
  reason?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  log_metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface TimelineStep {
  stage: string;
  label: string;
  detail: string;
  timestamp: string;
}

export interface WhatIf {
  case_id: string;
  payment_amount: number;
  currency: string;
  without_intervention_loss: number;
  with_genzpay_recovered: number;
  estimated_impact: number;
  recovered: boolean;
}

export interface SimulateFailureResult {
  payment_id: string;
  recovery_case_id?: string | null;
  steps: TimelineStep[];
  recovered: boolean;
  recovered_amount: number;
  final_status: string;
}

// ---- Endpoints ----
export const endpoints = {
  summary: () => api.get<DashboardSummary>("/analytics/summary"),
  dashboard: () => api.get("/analytics/dashboard"),
  timeseries: (days = 14) => api.get<TimeseriesPoint[]>(`/analytics/timeseries?days=${days}`),
  funnel: () => api.get<FunnelStage[]>("/analytics/funnel"),
  failureReasons: () => api.get<FailureReasonCount[]>("/analytics/failure-reasons"),
  aiActivity: (limit = 20) => api.get<AuditLogEntry[]>(`/analytics/ai-activity?limit=${limit}`),
  riskDistribution: () => api.get<RiskBucket[]>("/revenue-risk/distribution"),
  risks: (params?: string) => api.get(`/revenue-risk${params ? `?${params}` : ""}`),
  payments: (params?: string) => api.get<Payment[]>(`/payments${params ? `?${params}` : ""}`),
  payment: (id: string) => api.get<Payment>(`/payments/${id}`),
  cases: (params?: string) => api.get<RecoveryCase[]>(`/recovery-cases${params ? `?${params}` : ""}`),
  case: (id: string) => api.get<RecoveryCase>(`/recovery-cases/${id}`),
  analyzePayment: (paymentId: string) => api.post<RecoveryCase>(`/recovery-cases/${paymentId}/analyze`),
  executeCase: (caseId: string) => api.post<RecoveryCase>(`/recovery-cases/${caseId}/execute`),
  caseTimeline: (caseId: string) => api.get<{ case_id: string; steps: TimelineStep[] }>(`/recovery-cases/${caseId}/timeline`),
  caseWhatIf: (caseId: string) => api.get<WhatIf>(`/recovery-cases/${caseId}/what-if`),
  manualAction: (caseId: string, action: string, note?: string) =>
    api.post(`/recovery-cases/${caseId}/manual-action`, { action, note }),
  simulateFailure: (payload: { amount: number; currency?: string; failure_type: string; payment_method?: string }) =>
    api.post<SimulateFailureResult>("/simulate/payment-failure", payload),
  auditLogs: (params?: string) => api.get<AuditLogEntry[]>(`/audit${params ? `?${params}` : ""}`),
  policySettings: () => api.get("/merchants/settings/policy"),
  merchantMe: () => api.get("/merchants/me"),
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const actionLabels: Record<string, string> = {
  RETRY_PAYMENT: "Retry payment",
  SEND_PAYMENT_LINK: "Send payment link",
  SEND_REMINDER: "Send reminder",
  MARK_FOR_REVIEW: "Mark for review",
  ESCALATE: "Escalate",
  STOP_RECOVERY: "Stop recovery",
};

export const policyDecisionLabels: Record<string, string> = {
  APPROVED: "Approved",
  NO_ACTION: "No action needed",
  STOP_RECOVERY: "Stopped — retry ceiling reached",
  DEFER_ACTION: "Deferred — cooldown active",
  ESCALATE: "Escalated — exceeds autonomous ceiling",
  HUMAN_REVIEW: "Routed to human review",
  REJECT: "Rejected — duplicate action",
};

export const failureTypeOptions = [
  { value: "temporary_card_decline", label: "Temporary card decline" },
  { value: "insufficient_funds", label: "Insufficient funds" },
  { value: "network_timeout", label: "Network timeout" },
  { value: "expired_card", label: "Expired card" },
  { value: "recurring_payment_failure", label: "Recurring payment failure" },
];

export const statusColors: Record<string, string> = {
  open: "text-cream-400 bg-cream-400/10",
  in_progress: "text-amber-400 bg-amber-400/10",
  recovered: "text-sage-400 bg-sage-400/10",
  escalated: "text-clay-400 bg-clay-400/10",
  stopped: "text-cream-500 bg-cream-500/10",
  unrecoverable: "text-clay-500 bg-clay-500/10",
  deferred: "text-amber-300 bg-amber-300/10",
};

export const riskColors: Record<string, string> = {
  low: "#8FBF9F",
  medium: "#DDAB53",
  high: "#D97A66",
  critical: "#C25F49",
};
