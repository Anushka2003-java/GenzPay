import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, AlertTriangle, Workflow, Sparkles, Clock,
  BarChart3, ShieldCheck, Settings, Radio, Zap,
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/risk-center", label: "Revenue Risk Center", icon: AlertTriangle },
  { to: "/recovery-cases", label: "Recovery Cases", icon: Workflow },
  { to: "/ai-decisions", label: "AI Decision Center", icon: Sparkles },
  { to: "/timeline", label: "Payment Timeline", icon: Clock },
  { to: "/simulate", label: "Simulate Failure", icon: Zap },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/audit-trail", label: "Audit Trail", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell() {
  return (
    <div className="min-h-screen flex bg-ink-950">
      <aside className="w-64 shrink-0 border-r border-white/[0.06] flex flex-col">
        <div className="px-6 py-7 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center">
            <span className="text-ink-950 font-display font-semibold text-sm">G</span>
          </div>
          <span className="font-display text-lg text-cream-100 tracking-tight">GenzPay</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white/[0.06] text-amber-300"
                    : "text-cream-500 hover:text-cream-200 hover:bg-white/[0.03]"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 mx-3 mb-4 rounded-xl glass">
          <div className="flex items-center gap-2 text-xs text-sage-400">
            <Radio size={12} className="animate-pulse" />
            <span>Live simulated mode</span>
          </div>
          <p className="text-[11px] text-cream-500 mt-1.5 leading-relaxed">
            Payments &amp; AI reasoning are running against demo data — no real money moves.
          </p>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
