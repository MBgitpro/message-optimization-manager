import { Mail, Users, FileText, Shield, Database, CheckCircle2 } from "lucide-react";

const phases = [
  { key: "email_confirmation", label: "Renewal Outreach", icon: Mail, short: "Outreach" },
  { key: "initial_meeting", label: "Renewal Discovery", icon: Users, short: "Discovery" },
  { key: "contracting_vendors", label: "Proposal & Pricing", icon: FileText, short: "Proposal" },
  { key: "legal_security", label: "Negotiation & Approval", icon: Shield, short: "Negotiate" },
  { key: "data_collection", label: "Decision Ready", icon: Database, short: "Decision" },
  { key: "completed", label: "Contract Expires", icon: CheckCircle2, short: "Expires" },
];

export default function PhaseTracker({ currentPhase, compact = false }) {
  const currentIndex = phases.findIndex((p) => p.key === currentPhase);

  return (
    <div className="flex items-center gap-1 w-full">
      {phases.map((phase, i) => {
        const isActive = i === currentIndex;
        const isComplete = i < currentIndex;
        const Icon = phase.icon;

        return (
          <div key={phase.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {!compact && (
                <span className={`text-[10px] mt-1.5 text-center leading-tight ${
                  isActive ? "font-semibold text-primary" : isComplete ? "text-green-600 font-medium" : "text-muted-foreground"
                }`}>
                  {phase.short}
                </span>
              )}
            </div>
            {i < phases.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[8px] -mx-0.5 ${isComplete ? "bg-green-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { phases };