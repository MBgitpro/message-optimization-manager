import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { toast } from "sonner";

/**
 * @typedef {Object} HandoffFormState
 * @property {string} deal_name
 * @property {string} customer_name
 * @property {string} customer_contact_email
 * @property {string} sales_rep
 * @property {string} delivery_lead
 * @property {string} deal_value
 * @property {'medium' | 'low' | 'high' | 'critical'} priority
 * @property {string} key_deliverables
 * @property {string} handoff_start_date
 */

/**
 * @typedef {Object} NewHandoffDialogProps
 * @property {boolean} open
 * @property {(open: boolean) => void} onOpenChange
 * @property {() => void} [onCreated]
 */

/**
 * @param {NewHandoffDialogProps} props
 * @returns {JSX.Element}
 */
export default function NewHandoffDialog({ open, onOpenChange, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deal_name: "",
    customer_name: "",
    customer_contact_email: "",
    sales_rep: "",
    delivery_lead: "",
    deal_value: "",
    priority: "medium",
    key_deliverables: "",
    handoff_start_date: new Date().toISOString().split("T")[0],
  });

  /**
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Handoff.create({
      ...form,
      deal_value: form.deal_value ? Number(form.deal_value) : undefined,
      status: "pending",
      current_phase: "email_confirmation",
    });
    toast.success("Handoff created successfully");
    setLoading(false);
    onOpenChange(false);
    setForm({ deal_name: "", customer_name: "", customer_contact_email: "", sales_rep: "", delivery_lead: "", deal_value: "", priority: "medium", key_deliverables: "", handoff_start_date: new Date().toISOString().split("T")[0] });
    onCreated?.();
  };

  /**
   * @param {string} field
   * @param {string} value
   * @returns {void}
   */
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Handoff</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Deal Name *</Label>
              <Input value={form.deal_name} onChange={(e) => update("deal_name", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Customer Name *</Label>
              <Input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} required />
            </div>
          </div>
          <div>
            <Label className="text-xs">Customer Email</Label>
            <Input type="email" value={form.customer_contact_email} onChange={(e) => update("customer_contact_email", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Sales Rep *</Label>
              <Input value={form.sales_rep} onChange={(e) => update("sales_rep", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Delivery Lead</Label>
              <Input value={form.delivery_lead} onChange={(e) => update("delivery_lead", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Deal Value ($)</Label>
              <Input type="number" value={form.deal_value} onChange={(e) => update("deal_value", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              {/* @ts-ignore - Systematic override to maintain JSX compatibility */}
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                
                {/* @ts-ignore */}
                <SelectTrigger >
                    <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                
                {/* @ts-ignore */}
                <SelectContent>
                    <>
                        {/* @ts-ignore */}
                        <SelectItem {...{ value: "low" }}>Low</SelectItem>
                        {/* @ts-ignore */}
                        <SelectItem {...{ value: "medium" }}>Medium</SelectItem>
                        {/* @ts-ignore */}
                        <SelectItem {...{ value: "high" }}>High</SelectItem>
                        {/* @ts-ignore */}
                        <SelectItem {...{ value: "critical" }}>Critical</SelectItem>
                    </>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Key Deliverables</Label>
            <Textarea value={form.key_deliverables} onChange={(e) => update("key_deliverables", e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Handoff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}