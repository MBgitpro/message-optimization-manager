import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import StatCard from "../components/dashboard/StatCard";
import { Clock, Star, TrendingUp, CheckCircle2, AlertTriangle, ArrowRightLeft } from "lucide-react";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Reports() {
  const { data: handoffs = [], isLoading } = useQuery({
    queryKey: ["handoffs"],
    queryFn: () => base44.entities.Handoff.list("-created_date", 200),
  });

  const { data: comms = [] } = useQuery({
    queryKey: ["allComms"],
    queryFn: () => base44.entities.Communication.list("-created_date", 500),
  });

  const completed = handoffs.filter((h) => h.status === "completed");
  const active = handoffs.filter((h) => h.status !== "completed");
  const atRisk = handoffs.filter((h) => h.status === "at_risk" || h.status === "blocked");

  // TTFV data
  const ttfvData = completed
    .filter((h) => h.time_to_first_value_days)
    .map((h) => ({ name: h.deal_name?.substring(0, 12), days: h.time_to_first_value_days }))
    .slice(0, 10);

  const avgTTFV = ttfvData.length > 0 ? Math.round(ttfvData.reduce((s, d) => s + d.days, 0) / ttfvData.length) : 0;

  // Onboarding ratings
  const ratingData = completed
    .filter((h) => h.onboarding_rating)
    .map((h) => ({ name: h.deal_name?.substring(0, 12), rating: h.onboarding_rating }))
    .slice(0, 10);

  const avgRating = ratingData.length > 0 ? (ratingData.reduce((s, d) => s + d.rating, 0) / ratingData.length).toFixed(1) : "N/A";

  // Status distribution
  const statusCounts = {};
  handoffs.forEach((h) => { statusCounts[h.status] = (statusCounts[h.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));

  // Channel distribution
  const channelCounts = {};
  comms.forEach((c) => { channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1; });
  const channelData = Object.entries(channelCounts).map(([name, value]) => ({ name, value }));

  // Phase bottleneck
  const phaseCounts = {};
  active.forEach((h) => {
    const label = h.current_phase?.replace(/_/g, " ") || "unknown";
    phaseCounts[label] = (phaseCounts[label] || 0) + 1;
  });
  const phaseData = Object.entries(phaseCounts).map(([name, value]) => ({ name, value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics and handoff intelligence</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/*@ts-ignore */}
        <StatCard title="Total Handoffs" value={handoffs.length} icon={ArrowRightLeft} color="blue" />
        {/*@ts-ignore */}
        <StatCard title="Avg Time to First Value" value={`${avgTTFV}d`} subtitle="Target: <14 days" icon={Clock} color="green" />
        {/*@ts-ignore */}
        <StatCard title="Avg Onboarding Rating" value={avgRating} subtitle="Out of 10" icon={Star} color="purple" />
        {/*@ts-ignore */}   
        <StatCard title="Completion Rate" value={handoffs.length > 0 ? `${Math.round((completed.length / handoffs.length) * 100)}%` : "0%"} icon={CheckCircle2} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* TTFV Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Time to First Value (Days)</h3>
          {ttfvData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ttfvData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="days" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No completed handoffs with TTFV data</div>
          )}
        </div>

        {/* Onboarding Rating Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Onboarding Ratings</h3>
          {ratingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="rating" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No rating data yet</div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
          )}
        </div>

        {/* Phase Bottleneck */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Active Handoffs by Phase (Bottleneck View)</h3>
          {phaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={phaseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No active handoffs</div>
          )}
        </div>

        {/* Channel Distribution */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h3 className="font-heading font-semibold text-sm mb-4">Communication Channel Distribution</h3>
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No communication data</div>
          )}
        </div>
      </div>
    </div>
  );
}