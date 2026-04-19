import { Link } from "react-router-dom";
import { Clock, DollarSign, AlertTriangle, ChevronRight } from "lucide-react";
import PhaseTracker from "./PhaseTracker";
import moment from "moment";

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-200",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  at_risk: "bg-red-500/10 text-red-600 border-red-200",
  blocked: "bg-red-500/10 text-red-600 border-red-200",
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  at_risk: "At Risk",
  blocked: "Blocked",
};

const priorityStyles = {
  low: "bg-green-500/10 text-green-600",
  medium: "bg-blue-500/10 text-blue-600",
  high: "bg-amber-500/10 text-amber-600",
  critical: "bg-red-500/10 text-red-600",
};

export default function HandoffCard({ handoff }) {
  return (
    <Link
      to={`/handoffs/${handoff.id}`}
      className="block bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">
            {handoff.deal_name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{handoff.customer_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusStyles[handoff.status]}`}>
            {statusLabels[handoff.status]}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="mb-4">
        <PhaseTracker currentPhase={handoff.current_phase} compact />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{handoff.handoff_start_date ? moment(handoff.handoff_start_date).fromNow() : "Not started"}</span>
        </div>
        {handoff.deal_value && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{Number(handoff.deal_value).toLocaleString()}</span>
          </div>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityStyles[handoff.priority]}`}>
          {handoff.priority}
        </span>
        {(handoff.status === "at_risk" || handoff.status === "blocked") && (
          <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
            <span className="text-[9px] font-bold text-blue-600">{handoff.sales_rep?.charAt(0)}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{handoff.sales_rep}</span>
        </div>
        <span className="text-muted-foreground">→</span>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-purple-500/10 flex items-center justify-center">
            <span className="text-[9px] font-bold text-purple-600">{handoff.delivery_lead?.charAt(0) || "?"}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{handoff.delivery_lead || "Unassigned"}</span>
        </div>
      </div>
    </Link>
  );
}