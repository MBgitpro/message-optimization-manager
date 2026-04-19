import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, DollarSign, Calendar, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhaseTracker from "../components/dashboard/PhaseTracker";
import ChannelBadge from "../components/communications/ChannelBadge";
import MessageItem from "../components/communications/MessageItem";
import HandoffChecklist from "../components/handoffs/HandoffChecklist";
import { useState } from "react";
import { toast } from "sonner";
import moment from "moment";

const phaseOrder = ["email_confirmation", "initial_meeting", "contracting_vendors", "legal_security", "data_collection", "completed"];

export default function HandoffDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [messageChannel, setMessageChannel] = useState("in_app");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: handoff, isLoading } = useQuery({
    queryKey: ["handoff", id],
    queryFn: () => base44.entities.Handoff.filter({ id }),
    select: (data) => data[0],
  });

  const { data: comms = [], refetch: refetchComms } = useQuery({
    queryKey: ["comms", id],
    queryFn: () => base44.entities.Communication.filter({ handoff_id: id }, "-created_date"),
  });

  const advancePhase = async () => {
    if (!handoff) return;
    const idx = phaseOrder.indexOf(handoff.current_phase);
    if (idx < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[idx + 1];
      const updates = { current_phase: nextPhase };
      if (nextPhase === "completed") {
        updates.status = "completed";
        updates.actual_completion_date = new Date().toISOString().split("T")[0];
      } else {
        updates.status = "in_progress";
      }
      await base44.entities.Handoff.update(handoff.id, updates);
      queryClient.invalidateQueries({ queryKey: ["handoff", id] });
      toast.success(`Advanced to ${nextPhase.replace(/_/g, " ")}`);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    await base44.entities.Communication.create({
      handoff_id: id,
      channel: messageChannel,
      sender_name: "You",
      body: newMessage,
      phase: handoff?.current_phase || "general",
    });
    setNewMessage("");
    refetchComms();
    setSendingMsg(false);
    toast.success("Message logged");
  };

  const runAiAnalysis = async () => {
    if (!handoff) return;
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this Microsoft Solutions Specialist contract renewal account and provide churn risk insights:
Account: ${handoff.deal_name}
Client: ${handoff.customer_name}
Current Renewal Stage: ${handoff.current_phase}
Status: ${handoff.status}
Renewal Objectives: ${handoff.key_deliverables || "Not specified"}
Notes: ${handoff.notes || "None"}
Risk Flags: ${handoff.risk_flags || "None"}

Recent communications: ${comms.slice(0, 5).map(c => `[${c.channel}] ${c.sender_name}: ${c.body}`).join("\n")}

Provide:
1. Churn risk assessment — how likely is this client to not renew and why?
2. Suggested next actions for the Solutions Specialist to secure renewal
3. Expansion opportunities that could increase NRR
4. Renewal readiness score (1-10, where 10 = client will definitely renew)`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_assessment: { type: "string" },
          suggested_actions: { type: "array", items: { type: "string" } },
          key_items: { type: "array", items: { type: "string" } },
          readiness_score: { type: "number" },
        },
      },
    });
    setAiLoading(false);
    await base44.entities.Handoff.update(handoff.id, {
      risk_flags: result['risk_assessment'],
      notes: (handoff.notes || "") + `\n\n[AI Analysis ${new Date().toLocaleDateString()}]\nReadiness: ${result['readiness_score']}/10\nActions: ${result['suggested_actions']?.join(", ")}`,
    });
    queryClient.invalidateQueries({ queryKey: ["handoff", id] });
    toast.success("AI analysis complete");
  };

  if (isLoading || !handoff) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/handoffs" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to pipeline
          </Link>
          <h1 className="font-heading text-2xl font-bold">{handoff.deal_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{handoff.customer_name} · Renewal Account</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={runAiAnalysis} disabled={aiLoading} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {aiLoading ? "Analyzing..." : "AI Analysis"}
          </Button>
          {handoff.current_phase !== "completed" && (
            <Button size="sm" onClick={advancePhase} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Advance Stage
            </Button>
          )}
        </div>
      </div>

      {/* Phase Tracker */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Renewal Progress → Contract Expiry</p>
          {handoff.target_completion_date && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              🗓 Renewal Deadline: {moment(handoff.target_completion_date).format("MMM D, YYYY")}
            </span>
          )}
        </div>
        <PhaseTracker currentPhase={handoff.current_phase} />
        <p className="text-[10px] text-muted-foreground mt-3 text-center">
          Each step must be completed before the client's contract expiry date to secure renewal
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Details + Checklist */}
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-heading font-semibold text-sm">Renewal Account Details</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Specialist:</span>
                <span className="font-medium">{handoff.sales_rep}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Account Lead:</span>
                <span className="font-medium">{handoff.delivery_lead || "Unassigned"}</span>
              </div>
              {handoff.deal_value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">${Number(handoff.deal_value).toLocaleString()}</span>
                </div>
              )}
              {handoff.handoff_start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">{moment(handoff.handoff_start_date).format("MMM D, YYYY")}</span>
                </div>
              )}
            </div>
            {handoff.key_deliverables && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Renewal Objectives</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{handoff.key_deliverables}</p>
              </div>
            )}
            {handoff.risk_flags && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-1">Risk Flags</p>
                <p className="text-xs text-red-700 leading-relaxed">{handoff.risk_flags}</p>
              </div>
            )}
          </div>

          {/* Checklist */}
          <HandoffChecklist handoff= {{ ...handoff, id: id}} onUpdate={() => queryClient.invalidateQueries({queryKey: ["handoff", id]})} />
        </div>

        {/* Right: Communications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-sm mb-4">Communication Log</h3>

            {/* New message */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Select value={messageChannel} onValueChange={setMessageChannel}>
                  {/*@ts-ignore */}
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  {/*@ts-ignore */}
                  <SelectContent>
                    {/*@ts-ignore */}
                    <SelectItem value="in_app">In-App</SelectItem>
                    {/*@ts-ignore */}
                    <SelectItem value="email">Email</SelectItem>
                    {/*@ts-ignore */}
                    <SelectItem value="teams">Teams</SelectItem>
                    {/*@ts-ignore */}
                    <SelectItem value="text">Text</SelectItem>
                    {/*@ts-ignore */}
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <ChannelBadge channel={messageChannel} showLabel={false} />
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Log a communication..."
                  rows={2}
                  className="text-xs"
                />
                <Button size="sm" onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {comms.map((c) => (
                <MessageItem key={c.id} comm={c} />
              ))}
              {comms.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No communications logged yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}