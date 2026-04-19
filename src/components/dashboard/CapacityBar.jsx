export default function CapacityBar({ member }) {
  const pct = member.max_capacity > 0 ? (member.current_load / member.max_capacity) * 100 : 0;
  const statusColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500";
  const statusLabel = pct >= 90 ? "Overloaded" : pct >= 70 ? "Busy" : "Available";

  const roleLabels = {
    delivery_lead: "Delivery Lead",
    project_manager: "Project Manager",
    technical_lead: "Technical Lead",
    solutions_architect: "Solutions Architect",
    account_manager: "Account Manager",
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary">{member.name?.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-[10px] text-muted-foreground">{roleLabels[member.role] || member.role}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            pct >= 90 ? "bg-red-500/10 text-red-600" : pct >= 70 ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"
          }`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium w-12 text-right">
            {member.current_load}/{member.max_capacity}
          </span>
        </div>
      </div>
    </div>
  );
}