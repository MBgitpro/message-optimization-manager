import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HandoffCard from "../components/dashboard/HandoffCard";
import NewHandoffDialog from "../components/handoffs/NewHandoffDialog";

const phaseLabels = {
  email_confirmation: "Renewal Outreach",
  initial_meeting: "Renewal Discovery",
  contracting_vendors: "Proposal & Pricing",
  legal_security: "Negotiation & Approval",
  data_collection: "Decision Ready",
  completed: "Contract Expires",
};

const phaseColors = {
  email_confirmation: "border-t-blue-500",
  initial_meeting: "border-t-purple-500",
  contracting_vendors: "border-t-amber-500",
  legal_security: "border-t-red-500",
  data_collection: "border-t-emerald-500",
  completed: "border-t-green-500",
};

export default function HandoffPipeline() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("pipeline"); // pipeline or list

  const { data: handoffs = [], isLoading, refetch } = useQuery({
    queryKey: ["handoffs"],
    queryFn: () => base44.entities.Handoff.list("-created_date", 100),
  });

  const filtered = handoffs.filter(
    (h) =>
      h.deal_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      h.sales_rep?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {};
  Object.keys(phaseLabels).forEach((phase) => {
    grouped[phase] = filtered.filter((h) => h.current_phase === phase);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Renewal Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">{handoffs.length} active renewal accounts — track each to renewal decision date</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Handoff
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by account, client, or specialist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("pipeline")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "pipeline" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            List
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : viewMode === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([phase, items]) => (
            <div key={phase} className={`bg-card/50 rounded-xl border border-border border-t-4 ${phaseColors[phase]} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  {phaseLabels[phase]}
                </h3>
                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((h) => (
                  <HandoffCard key={h.id} handoff={h} />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No accounts in this stage</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => (
            <HandoffCard key={h.id} handoff={h} />
          ))}
        </div>
      )}

      <NewHandoffDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={refetch} />
    </div>
  );
}