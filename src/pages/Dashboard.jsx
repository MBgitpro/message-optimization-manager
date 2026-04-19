import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowRightLeft, Clock, Star, AlertTriangle, CheckCircle2,
  Zap, DollarSign, TrendingUp, Building2, Flame
} from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import HandoffCard from "../components/dashboard/HandoffCard";
import CapacityBar from "../components/dashboard/CapacityBar";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: handoffs = [], isLoading } = useQuery({
    queryKey: ["handoffs"],
    queryFn: () => base44.entities.Handoff.list("-created_date", 50),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const activeHandoffs = handoffs.filter((h) => h.status !== "completed");
  const atRiskHandoffs = handoffs.filter((h) => h.status === "at_risk" || h.status === "blocked");
  const completedHandoffs = handoffs.filter((h) => h.status === "completed");
  const pendingHandoffs = handoffs.filter((h) => h.status === "pending");

  const totalPipelineValue = activeHandoffs.reduce((s, h) => s + (h.deal_value || 0), 0);
  const closedValue = completedHandoffs.reduce((s, h) => s + (h.deal_value || 0), 0);

  const avgTTFV = completedHandoffs.filter((h) => h.time_to_first_value_days).length > 0
    ? Math.round(completedHandoffs.reduce((s, h) => s + (h.time_to_first_value_days || 0), 0) /
        completedHandoffs.filter((h) => h.time_to_first_value_days).length)
    : 0;

  const avgOnboarding = completedHandoffs.filter((h) => h.onboarding_rating).length > 0
    ? (completedHandoffs.reduce((s, h) => s + (h.onboarding_rating || 0), 0) /
        completedHandoffs.filter((h) => h.onboarding_rating).length).toFixed(1)
    : "N/A";

  const phaseLabels = {
    email_confirmation: "Outreach", initial_meeting: "Discovery",
    contracting_vendors: "Proposal", legal_security: "Negotiate",
    data_collection: "Decision", completed: "Expires",
  };
  const phaseCounts = {};
  activeHandoffs.forEach((h) => {
    const label = phaseLabels[h.current_phase] || h.current_phase;
    phaseCounts[label] = (phaseCounts[label] || 0) + 1;
  });
  const phaseData = Object.entries(phaseCounts).map(([name, value]) => ({ name, value }));

  const criticalHandoffs = handoffs.filter((h) => h.priority === "critical" && h.status !== "completed");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Microsoft Sales Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0078d4] via-[#106ebe] to-[#005a9e] p-6 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">Microsoft Solutions Specialist</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">
              Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              Contract Renewal & Churn Prevention Command Center — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-heading font-bold">${(totalPipelineValue / 1_000_000).toFixed(1)}M</p>
              <p className="text-xs text-blue-200">At-Risk Renewal ARR</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-2xl font-heading font-bold">{activeHandoffs.length}</p>
              <p className="text-xs text-blue-200">Active Renewals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {(atRiskHandoffs.length > 0 || criticalHandoffs.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">Churn Risk — Immediate Attention Required</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {[...atRiskHandoffs, ...criticalHandoffs.filter(h => h.status !== "at_risk")]
              .slice(0, 4)
              .map((h) => (
              <Link
                key={h.id}
                to={`/handoffs/${h.id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 transition-colors"
              >
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-800 truncate">{h.deal_name}</p>
                  <p className="text-[10px] text-red-500 capitalize">{h.status.replace(/_/g, " ")} · {h.current_phase?.replace(/_/g, " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="At-Risk Renewal ARR"
          value={`$${(totalPipelineValue / 1_000_000).toFixed(1)}M`}
          subtitle="Revenue at risk of churn"
          icon={DollarSign}
          color="blue"
          trend="up"
          trendValue="+2 this month"
        />
        <StatCard
          title="Avg Time to Renewal Close"
          value={`${avgTTFV || "—"}d`}
          subtitle="Target: <14 days"
          icon={Clock}
          color="green"
          trend="up"
          trendValue="12% faster"
        />
        <StatCard
          title="Customer Health Score"
          value={avgOnboarding}
          subtitle="NRR satisfaction proxy, out of 10"
          icon={Star}
          color="purple"
          trend="up"
          trendValue="+0.3"
        />
        <StatCard
          title="Churn Risk Accounts"
          value={atRiskHandoffs.length}
          subtitle={atRiskHandoffs.length > 0 ? "Requires immediate outreach" : "All clear"}
          icon={AlertTriangle}
          color={atRiskHandoffs.length > 0 ? "red" : "green"}
          trend={atRiskHandoffs.length > 5 ? "up" : "down"} 
          trendValue={atRiskHandoffs.length > 0 ? `${atRiskHandoffs.length} total` : "0%"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline Phase Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-semibold text-sm">Renewals by Stage</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active renewal contracts across all NRR pipeline stages</p>
            </div>
            <Link to="/handoffs" className="text-[11px] text-primary font-medium hover:underline">View pipeline →</Link>
          </div>
          {phaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={phaseData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" fill="#0078d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No active handoffs</div>
          )}
        </div>

        {/* Delivery Capacity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-heading font-semibold text-sm">Delivery Capacity</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Assign handoffs wisely</p>
            </div>
            <Link to="/team-capacity" className="text-[10px] text-primary font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {teamMembers.slice(0, 5).map((m) => (
              <CapacityBar key={m.id} member={m} />
            ))}
            {teamMembers.length === 0 && (
              <p className="text-xs text-muted-foreground py-8 text-center">No team members configured</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "High Churn Risk", value: criticalHandoffs.length, color: "text-red-600 bg-red-50 border-red-100", icon: Flame },
          { label: "Pending Renewal", value: pendingHandoffs.length, color: "text-amber-600 bg-amber-50 border-amber-100", icon: Zap },
          { label: "Renewed (Won)", value: completedHandoffs.length, color: "text-green-600 bg-green-50 border-green-100", icon: CheckCircle2 },
          { label: "NRR Retained", value: `$${(closedValue / 1_000_000).toFixed(1)}M`, color: "text-blue-600 bg-blue-50 border-blue-100", icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-3 flex items-center gap-3 ${color}`}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-lg font-heading font-bold leading-none">{value}</p>
              <p className="text-[10px] font-medium mt-0.5 opacity-70">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Handoffs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-semibold text-sm">My Active Renewals</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Clients currently in the renewal pipeline — monitor for churn signals</p>
          </div>
          <Link to="/handoffs" className="text-xs text-primary font-medium hover:underline">Full pipeline →</Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {handoffs.slice(0, 6).map((h) => (
            <HandoffCard key={h.id} handoff={h} />
          ))}
          {handoffs.length === 0 && (
            <div className="col-span-full text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No handoffs yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Start by creating a handoff from the pipeline page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}