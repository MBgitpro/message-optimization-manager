import ChannelBadge from "./ChannelBadge";
import { AlertTriangle, Sparkles } from "lucide-react";
import moment from "moment";

export default function MessageItem({ comm }) {
  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${
      comm.is_critical ? "border-red-200 bg-red-50/50" : "border-border bg-card"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ChannelBadge channel={comm.channel} />
          {comm.is_critical && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-600 rounded text-[10px] font-semibold">
              <AlertTriangle className="h-3 w-3" /> Critical
            </span>
          )}
          <span className="text-[10px] text-muted-foreground capitalize px-1.5 py-0.5 bg-muted rounded">
            {comm.phase?.replace(/_/g, " ")}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {moment(comm.created_date).fromNow()}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold">{comm.sender_name}</span>
          <span className="text-[10px] text-muted-foreground">→</span>
          <span className="text-xs text-muted-foreground">{comm.recipient_name || "Team"}</span>
        </div>
        {comm.subject && <p className="text-xs font-medium mb-1">{comm.subject}</p>}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{comm.body}</p>
      </div>

      {(comm.ai_summary || comm.ai_detected_items) && (
        <div className="mt-3 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">AI Insights</span>
          </div>
          {comm.ai_summary && (
            <p className="text-[11px] text-foreground/70 mb-1">{comm.ai_summary}</p>
          )}
          {comm.ai_detected_items && (
            <p className="text-[10px] text-primary/70">Key Items: {comm.ai_detected_items}</p>
          )}
        </div>
      )}
    </div>
  );
}