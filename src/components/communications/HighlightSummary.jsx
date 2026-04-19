import { useState } from "react";
import { Sparkles, Highlighter, X, Copy, Check, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function HighlightSummary({ text, context = "", label = "Highlight & Summarize" }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const summarize = async () => {
    if (result) { setVisible(true); return; }
    setLoading(true);
    setVisible(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Microsoft Sales Team AI assistant. A sales rep has highlighted this communication and wants quick insights.

Context: ${context}

Content:
${text}

Extract and return:
1. key_points: 3-4 concise bullet points of what matters most to the sales/delivery team
2. kpi_highlights: any specific KPIs, numbers, dollar amounts, dates, percentages, or metrics mentioned (these should be verbatim extracts)  
3. action_items: 1-2 specific next steps the sales team should take
4. sentiment: "positive", "neutral", "urgent", or "at_risk"

Be brief. Focus on what a Microsoft Sales rep needs to act on.`,
      response_json_schema: {
        type: "object",
        properties: {
          key_points: { type: "array", items: { type: "string" } },
          kpi_highlights: { type: "array", items: { type: "string" } },
          action_items: { type: "array", items: { type: "string" } },
          sentiment: { type: "string" }
        }
      }
    });
    setResult(res);
    setLoading(false);
  };

  const copy = () => {
    const txt = [
      "Key Points:\n" + result?.key_points?.map(p => `• ${p}`).join("\n"),
      "KPIs:\n" + result?.kpi_highlights?.map(k => `⚡ ${k}`).join("\n"),
      "Actions:\n" + result?.action_items?.map(a => `→ ${a}`).join("\n"),
    ].join("\n\n");
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentColor = {
    positive: "text-green-600 bg-green-50 border-green-200",
    neutral: "text-blue-600 bg-blue-50 border-blue-200",
    urgent: "text-amber-600 bg-amber-50 border-amber-200",
    at_risk: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={summarize}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] hover:bg-[#006cbe] text-white rounded-lg text-[11px] font-semibold transition-all shadow-sm"
      >
        <Highlighter className="h-3 w-3" />
        {label}
      </button>

      {visible && (
        <div className="absolute z-50 bottom-full mb-2 right-0 w-80 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0078d4]/5 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0078d4]" />
              <span className="text-xs font-bold text-[#0078d4]">AI Highlight Summary</span>
              {result?.sentiment && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${sentimentColor[result.sentiment] || sentimentColor.neutral}`}>
                  {result.sentiment.replace(/_/g, " ").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {result && (
                <button onClick={copy} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
              <button onClick={() => setVisible(false)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-[#0078d4]/30 border-t-[#0078d4] rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Analyzing for KPIs & key insights...</span>
              </div>
            ) : result ? (
              <>
                {/* KPI Highlights — most prominent */}
                {result.kpi_highlights?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">⚡ KPI Highlights</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.kpi_highlights.map((kpi, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-semibold">
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points */}
                {result.key_points?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Key Points</p>
                    <ul className="space-y-1">
                      {result.key_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#0078d4] mt-1.5 flex-shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {result.action_items?.length > 0 && (
                  <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Next Actions</p>
                    {result.action_items.map((a, i) => (
                      <p key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                        <span className="text-primary font-bold">→</span> {a}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}