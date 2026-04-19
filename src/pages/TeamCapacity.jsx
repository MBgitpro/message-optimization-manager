import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CapacityBar from "../components/dashboard/CapacityBar";
import { toast } from "sonner";

export default function TeamCapacity() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", role: "delivery_lead", team: "delivery", max_capacity: 5, current_load: 0,
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.TeamMember.create({
      ...form,
      max_capacity: Number(form.max_capacity),
      current_load: Number(form.current_load),
    });
    toast.success("Team member added");
    setLoading(false);
    setDialogOpen(false);
    setForm({ name: "", email: "", role: "delivery_lead", team: "delivery", max_capacity: 5, current_load: 0 });
    queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
  };

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const deliveryMembers = members.filter((m) => m.team === "delivery");
  const salesMembers = members.filter((m) => m.team === "sales");
  const otherMembers = members.filter((m) => !["delivery", "sales"].includes(m.team));

  const totalCapacity = members.reduce((s, m) => s + (m.max_capacity || 0), 0);
  const totalLoad = members.reduce((s, m) => s + (m.current_load || 0), 0);
  const overallPct = totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Team Capacity</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor delivery team workload and availability</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Overview */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Overall Utilization</h3>
          <span className="text-sm font-bold">{overallPct}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${overallPct >= 90 ? "bg-red-500" : overallPct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(overallPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{totalLoad} active handoffs</span>
          <span className="text-xs text-muted-foreground">{totalCapacity} total capacity</span>
        </div>
      </div>

      {/* Teams */}
      {[
        { label: "Delivery Team", items: deliveryMembers },
        { label: "Sales Team", items: salesMembers },
        { label: "Other Teams", items: otherMembers },
      ].map(({ label, items }) =>
        items.length > 0 ? (
          <div key={label} className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-sm mb-2">{label}</h3>
            <div className="divide-y divide-border">
              {items.map((m) => (
                <CapacityBar key={m.id} member={m} />
              ))}
            </div>
          </div>
        ) : null
      )}

      {members.length === 0 && !isLoading && (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No team members yet. Add your first team member.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="text-xs">Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={form.role} onValueChange={(v) => update("role", v)}>
                  {/* @ts-ignore */}
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  {/* @ts-ignore */}
                  <SelectContent>
                    {/* @ts-ignore */}
                    <SelectItem value="delivery_lead">Delivery Lead</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="technical_lead">Technical Lead</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="solutions_architect">Solutions Architect</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="account_manager">Account Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Team</Label>
                <Select value={form.team} onValueChange={(v) => update("team", v)}>
                  {/* @ts-ignore */}
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  {/* @ts-ignore */}
                  <SelectContent>
                    {/* @ts-ignore */}
                    <SelectItem value="delivery">Delivery</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="sales">Sales</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="legal">Legal</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="security">Security</SelectItem>
                    {/* @ts-ignore */}
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Max Capacity</Label>
                <Input type="number" value={form.max_capacity} onChange={(e) => update("max_capacity", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Current Load</Label>
                <Input type="number" value={form.current_load} onChange={(e) => update("current_load", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Member"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}