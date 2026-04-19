import { useState, useEffect } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock, X, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function QuickKeyUpdates({ handoffs = [], comms = [], channelLabel = "All Channels" }) {
  const [expanded, setExpanded] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Re-run whenever the channel changes (key prop causes remount)
    setDismissed(false);
    setSummary(null);
    if (handoffs.length > 0 || comms.length > 0) generateSummary();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    const atRisk = handoffs.filter((h) => h.status === "at_risk" || h.status === "blocked");
    const critical = comms.filter((c) => c.is_critical).slice(0, 5);
    const recentMsgs = comms.slice(0, 8).map(c =>
      `[${c.channel?.toUpperCase()}] From ${c.sender_name}: ${c.body?.substring(0, 120)}`
    ).join("\n");

    const channelContext = channelLabel === "All Channels"
      ? "across all communication channels (email, Teams, text, phone)"
      : `specifically in ${channelLabel}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Microsoft Sales Team AI assistant providing a QUICK KEY UPDATES BRIEFING as the sales rep enters the communications hub ${channelContext}.

Active handoffs: ${handoffs.filter(h => h.status === "in_progress").length}
At-risk deals: ${atRisk.map(h => h.deal_name).join(", ") || "None"}
Critical messages: ${critical.length}
Recent messages:
${recentMsgs || "No recent messages"}

Generate a sharp, sales-team-focused briefing:
- 3-5 bullet points of what needs attention RIGHT NOW
- Call out any voicemails, urgent emails, or Teams messages needing response
- Flag any KPIs or deal metrics mentioned (revenue, timelines, compliance deadlines)
- One urgent action item if applicable

Be direct. Write from the perspective of a Microsoft Sales Director briefing their team.`,
      response_json_schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          urgent_action: { type: "string" },
          kpi_flags: { type: "array", items: { type: "string" } }
        }
      }
    });

    setSummary(result);
    setLoading(false);
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#0078d4]/10 via-[#0078d4]/5 to-transparent rounded-2xl border border-[#0078d4]/25 overflow-hidden mb-6">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[#0078d4]/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#0078d4] flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-[#0078d4]">
              Quick Key Updates — {channelLabel}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Microsoft Sales AI · Live briefing as you enter this channel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setSummary(null); generateSummary(); }}
            className="p-1.5 rounded-lg text-[#0078d4] hover:bg-[#0078d4]/10 transition-colors"
            title="Refresh briefing"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-4 h-4 border-2 border-[#0078d4]/30 border-t-[#0078d4] rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Generating your sales briefing for {channelLabel}...</span>
            </div>
          ) : summary ? (
            <div className="space-y-3">
              {summary.headline && (
                <p className="text-sm font-semibold text-foreground">{summary.headline}</p>
              )}

              {/* Main bullets */}
              <div className="grid sm:grid-cols-2 gap-2">
                {summary.bullets?.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-card/70 rounded-lg p-3 border border-border">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0078d4] mt-1.5 flex-shrink-0" />
                    <span className="text-foreground/80 leading-relaxed">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* KPI flags — highlighted */}
              {summary.kpi_flags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider self-center">KPI Flags:</span>
                  {summary.kpi_flags.map((kpi, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[11px] font-medium">
                      ⚡ {kpi}
                    </span>
                  ))}
                </div>
              )}

              {/* Urgent action */}
              {summary.urgent_action && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Urgent — Action Required</p>
                    <p className="text-xs text-red-700 leading-relaxed">{summary.urgent_action}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">Loading briefing...</p>
          )}

          {/* Live counters */}
          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[#0078d4]/10">
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="font-semibold">{handoffs.filter(h => h.status === "in_progress").length}</span>
              <span className="text-muted-foreground">active handoffs</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="font-semibold">{handoffs.filter(h => h.status === "at_risk" || h.status === "blocked").length}</span>
              <span className="text-muted-foreground">at risk</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="font-semibold">{comms.filter(c => c.is_critical).length}</span>
              <span className="text-muted-foreground">critical messages</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}