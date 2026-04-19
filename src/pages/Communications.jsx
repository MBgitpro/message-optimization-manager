import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { Search, Mail, Monitor, Smartphone, Phone, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import MessageItem from "../components/communications/MessageItem";
import ChannelBadge from "../components/communications/ChannelBadge";
import QuickKeyUpdates from "../components/communications/QuickKeyUpdates";
import HighlightSummary from "../components/communications/HighlightSummary";

const CHANNELS = [
  { key: "all", label: "All Channels", icon: MessageSquare },
  { key: "email", label: "Email / Outlook", icon: Mail },
  { key: "teams", label: "Microsoft Teams", icon: Monitor },
  { key: "text", label: "SMS / Text", icon: Smartphone },
  { key: "phone", label: "Phone / Voicemail", icon: Phone },
];

export default function Communications() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [criticalOnly, setCriticalOnly] = useState(false);

  const { data: handoffs = [] } = useQuery({
    queryKey: ["handoffs"],
    queryFn: () => base44.entities.Handoff.list("-updated_date", 50),
  });

  const { data: comms = [], isLoading } = useQuery({
    queryKey: ["allComms"],
    queryFn: () => base44.entities.Communication.list("-created_date", 100),
  });

  const filtered = comms.filter((c) => {
    if (channelFilter !== "all" && c.channel !== channelFilter) return false;
    if (criticalOnly && !c.is_critical) return false;
    if (search && !c.body?.toLowerCase().includes(search.toLowerCase()) &&
        !c.sender_name?.toLowerCase().includes(search.toLowerCase()) &&
        !c.subject?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const channelCounts = {};
  comms.forEach((c) => { channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1; });

  // Get context label for QuickKeyUpdates based on active channel
  const activeChannelLabel = CHANNELS.find(c => c.key === channelFilter)?.label || "All Channels";

  return (
    <div className="max-w-5xl mx-auto space-y-0">

      {/* Quick Key Updates banner — AI briefing scoped to active channel */}
      <QuickKeyUpdates
        handoffs={handoffs}
        comms={channelFilter === "all" ? comms : comms.filter(c => c.channel === channelFilter)}
        channelLabel={activeChannelLabel}
        key={channelFilter}  
      />

      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Communications Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cross-channel inbox — Email, Teams, Text, Phone · Microsoft Sales Team
          </p>
        </div>

        {/* Channel Tabs */}
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setChannelFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                channelFilter === key
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {key !== "all" && channelCounts[key] !== undefined && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  channelFilter === key ? "bg-white/20" : "bg-muted"
                }`}>
                  {channelCounts[key] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Critical filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages, senders, subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <button
            onClick={() => setCriticalOnly(!criticalOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              criticalOnly
                ? "border-red-300 bg-red-50 text-red-600"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            🚨 Critical Only
          </button>
        </div>

        {/* Message List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="relative group">
                <MessageItem comm={c} />
                {/* Hover-reveal KPI Highlight/Summarize button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <HighlightSummary
                    text={`${c.subject ? c.subject + "\n" : ""}${c.body}`}
                    context={`Microsoft Sales Team · Channel: ${c.channel} · Sender: ${c.sender_name} · Phase: ${c.phase} · Customer: ${
                      handoffs.find(h => h.id === c.handoff_id)?.customer_name || "Unknown"
                    }`}
                    label="Highlight & Summarize"
                  />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No messages found for the selected filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}