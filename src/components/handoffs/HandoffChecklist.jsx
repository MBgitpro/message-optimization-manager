import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * @typedef {Object} ChecklistItem
 * @property {string} key
 * @property {string} label
 * @property {string} phase
 */

/**
 * @typedef {Object} HandoffChecklistProps
 * @property {Object} handoff
 * @property {string} handoff.id
 * @property {() => void} [onUpdate]
 */

/** @type {ChecklistItem[]} */
const checklistItems = [
  { key: "checklist_email_confirmation", label: "Renewal outreach sent to client", phase: "email_confirmation" },
  { key: "checklist_initial_meeting", label: "Discovery call scheduled", phase: "initial_meeting" },
  { key: "checklist_kickoff_complete", label: "Client needs & expansion goals documented", phase: "initial_meeting" },
  { key: "checklist_contracts_signed", label: "Renewal proposal delivered", phase: "contracting_vendors" },
  { key: "checklist_vendors_confirmed", label: "Pricing & expansion options presented", phase: "contracting_vendors" },
  { key: "checklist_legal_approved", label: "Terms negotiated & legal approved", phase: "legal_security" },
  { key: "checklist_security_cleared", label: "Internal approval obtained", phase: "legal_security" },
  { key: "checklist_data_collected", label: "Client committed to renewal decision", phase: "data_collection" },
];

const phaseLabels = {
  email_confirmation: "Step 1 · Renewal Outreach",
  initial_meeting: "Step 2 · Renewal Discovery",
  contracting_vendors: "Step 3 · Proposal & Pricing",
  legal_security: "Step 4 · Negotiation & Approval",
  data_collection: "Step 5 · Decision Ready",
};

/**
 * @param {HandoffChecklistProps} props
 * @returns {JSX.Element}
 */
export default function HandoffChecklist({ handoff, onUpdate }) {
  /**
   * @param {string} key
   * @param {boolean} checked
   * @returns {Promise<void>}
   */
  const handleToggle = async (key, checked) => {
    await base44.entities.Handoff.update(handoff.id, { [key]: checked });
    onUpdate?.();
    toast.success(checked ? "Item completed" : "Item unchecked");
  };

  const grouped = {};
  checklistItems.forEach((item) => {
    if (!grouped[item.phase]) grouped[item.phase] = [];
    grouped[item.phase].push(item);
  });

  const totalDone = checklistItems.filter((item) => handoff[item.key]).length;
  const pct = Math.round((totalDone / checklistItems.length) * 100);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-sm">Renewal Checklist</h3>
        <span className="text-xs font-medium text-muted-foreground">{totalDone}/{checklistItems.length} ({pct}%)</span>
      </div>

      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([phase, items]) => (
          <div key={phase}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              {phaseLabels[phase]}
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <label key={item.key} className="flex items-center gap-2.5 cursor-pointer group">
                  <Checkbox
                    checked={!!handoff[item.key]}
                    onCheckedChange={(checked) => handleToggle(item.key, checked)}
                  />
                  <span className={`text-xs transition-all ${handoff[item.key] ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}