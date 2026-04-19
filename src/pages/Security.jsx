import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import moment from "moment";

export default function Security() {
  const { data: handoffs = [], isLoading } = useQuery({
    queryKey: ["handoffs"],
    queryFn: () => base44.entities.Handoff.list("-updated_date", 100),
  });

  const { data: comms = [] } = useQuery({
    queryKey: ["allComms"],
    queryFn: () => base44.entities.Communication.list("-created_date", 200),
  });

  const criticalComms = comms.filter((c) => c.is_critical);
  const securityPendingHandoffs = handoffs.filter((h) => h.current_phase === "legal_security" && !h.checklist_security_cleared);
  const legalPendingHandoffs = handoffs.filter((h) => h.current_phase === "legal_security" && !h.checklist_legal_approved);

  // Build audit trail from recent handoff updates
  const recentActivity = handoffs
    .filter((h) => h.updated_date)
    .sort((a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())
    .slice(0, 20);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Security & Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Data integrity, compliance tracking, and audit trail</p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-600 w-fit mb-3">
            <Shield className="h-5 w-5" />
          </div>
          <p className="text-2xl font-heading font-bold">{handoffs.filter((h) => h.checklist_security_cleared).length}</p>
          <p className="text-xs text-muted-foreground">Security Cleared</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 w-fit mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <p className="text-2xl font-heading font-bold">{securityPendingHandoffs.length}</p>
          <p className="text-xs text-muted-foreground">Pending Security Review</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 w-fit mb-3">
            <Eye className="h-5 w-5" />
          </div>
          <p className="text-2xl font-heading font-bold">{handoffs.filter((h) => h.checklist_legal_approved).length}</p>
          <p className="text-xs text-muted-foreground">Legal Approved</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-600 w-fit mb-3">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-2xl font-heading font-bold">{criticalComms.length}</p>
          <p className="text-xs text-muted-foreground">Critical Communications</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Security Pending */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Pending Security Clearance</h3>
          <div className="space-y-3">
            {securityPendingHandoffs.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="text-xs font-medium">{h.deal_name}</p>
                  <p className="text-[10px] text-muted-foreground">{h.customer_name}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-medium">Pending</span>
                </div>
              </div>
            ))}
            {securityPendingHandoffs.length === 0 && (
              <div className="flex items-center gap-2 justify-center py-6 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">All cleared</span>
              </div>
            )}
          </div>
        </div>

        {/* Legal Pending */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">Pending Legal Approval</h3>
          <div className="space-y-3">
            {legalPendingHandoffs.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div>
                  <p className="text-xs font-medium">{h.deal_name}</p>
                  <p className="text-[10px] text-muted-foreground">{h.customer_name}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-medium">Pending</span>
                </div>
              </div>
            ))}
            {legalPendingHandoffs.length === 0 && (
              <div className="flex items-center gap-2 justify-center py-6 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">All approved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-4">Recent Activity Audit Trail</h3>
        <div className="space-y-2">
          {recentActivity.map((h) => (
            <div key={h.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-medium">{h.deal_name}</span>
                  <span className="text-muted-foreground"> — Phase: {h.current_phase?.replace(/_/g, " ")} — Status: {h.status}</span>
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {moment(h.updated_date).fromNow()}
              </span>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}