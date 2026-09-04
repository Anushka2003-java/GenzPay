import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import RiskCenter from "./pages/RiskCenter";
import RecoveryCases from "./pages/RecoveryCases";
import RecoveryCaseDetail from "./pages/RecoveryCaseDetail";
import AIDecisionCenter from "./pages/AIDecisionCenter";
import PaymentTimeline from "./pages/PaymentTimeline";
import Analytics from "./pages/Analytics";
import AuditTrail from "./pages/AuditTrail";
import Settings from "./pages/Settings";
import SimulateFailure from "./pages/SimulateFailure";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/risk-center" element={<RiskCenter />} />
          <Route path="/recovery-cases" element={<RecoveryCases />} />
          <Route path="/recovery-cases/:id" element={<RecoveryCaseDetail />} />
          <Route path="/ai-decisions" element={<AIDecisionCenter />} />
          <Route path="/timeline" element={<PaymentTimeline />} />
          <Route path="/simulate" element={<SimulateFailure />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audit-trail" element={<AuditTrail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
