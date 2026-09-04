import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock3, Search } from "lucide-react";
import { SectionHeader, Badge, EmptyState } from "../components/ui";
import { endpoints, formatINR, timeAgo, type Payment } from "../lib/api";

export default function PaymentTimeline() {
  const [params] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    endpoints.payments("limit=100").then((r) => {
      setPayments(r.data);
      const pid = params.get("payment");
      if (pid) {
        endpoints.payment(pid).then((res) => setSelected(res.data));
      } else if (r.data.length) {
        endpoints.payment(r.data[0].id).then((res) => setSelected(res.data));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = payments.filter((p) =>
    (p.customer?.name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="pb-16">
      <SectionHeader title="Payment Timeline" subtitle="Every attempt on a payment, in order — the raw trail behind each risk score." />

      <div className="px-8 grid grid-cols-12 gap-4">
        <div className="col-span-4 glass rounded-2xl shadow-glass overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04]">
              <Search size={14} className="text-cream-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by customer"
                className="bg-transparent text-sm outline-none flex-1 text-cream-200 placeholder:text-cream-500"
              />
            </div>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => endpoints.payment(p.id).then((r) => setSelected(r.data))}
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                  selected?.id === p.id ? "bg-white/[0.05]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cream-200">{p.customer?.name ?? "Customer"}</span>
                  <span className="text-xs tabular-nums text-cream-400">{formatINR(p.amount)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone={p.status === "success" || p.status === "recovered" ? "sage" : p.status === "failed" ? "clay" : "cream"}>
                    {p.status}
                  </Badge>
                  <span className="text-[11px] text-cream-500">{timeAgo(p.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-8 glass rounded-2xl p-6 shadow-glass">
          {!selected ? (
            <EmptyState text="Select a payment to see its timeline" />
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl text-cream-100">{selected.customer?.name}</h3>
                  <p className="text-sm text-cream-500 mt-1">
                    {formatINR(selected.amount)} · {selected.payment_method} · {selected.currency}
                  </p>
                </div>
                <Badge tone={selected.status === "success" || selected.status === "recovered" ? "sage" : "clay"}>
                  {selected.status}
                </Badge>
              </div>

              <ol className="space-y-0">
                <TimelineEntry
                  icon={<Clock3 size={14} className="text-cream-400" />}
                  title="Payment initiated"
                  time={selected.created_at}
                  last={!selected.attempts?.length}
                />
                {(selected.attempts ?? []).map((a, i) => (
                  <TimelineEntry
                    key={a.id}
                    icon={a.status === "success" ? <CheckCircle2 size={14} className="text-sage-400" /> : <XCircle size={14} className="text-clay-400" />}
                    title={`Attempt ${a.attempt_number} · ${a.status}${a.failure_reason !== "none" ? ` (${a.failure_reason.replace(/_/g, " ")})` : ""}`}
                    sub={`Initiated by ${a.initiated_by.replace(/_/g, " ")}`}
                    time={a.created_at}
                    last={i === (selected.attempts?.length ?? 1) - 1}
                  />
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ icon, title, sub, time, last }: { icon: React.ReactNode; title: string; sub?: string; time: string; last?: boolean }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">{icon}</div>
        {!last && <div className="w-px flex-1 bg-white/[0.08] my-1" />}
      </div>
      <div className="pb-6">
        <div className="text-sm text-cream-200 capitalize">{title}</div>
        {sub && <div className="text-xs text-cream-500 mt-0.5 capitalize">{sub}</div>}
        <div className="text-[11px] text-cream-500 mt-0.5">{timeAgo(time)}</div>
      </div>
    </li>
  );
}
