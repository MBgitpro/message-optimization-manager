import { useState, useEffect, useRef } from "react";
import { Send, Bot, Sparkles, MessageSquare, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

const QUICK_PROMPTS = [
  "Summarize all active handoffs",
  "Which deals are at risk?",
  "Show Bank of America handoff status",
  "Which delivery team members are available?",
  "What critical information is missing from active handoffs?",
  "List handoffs in the legal & security phase",
];

export default function ChatbotPage() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const conv = await base44.agents.createConversation({
        agent_name: "handoff_assistant",
        metadata: { name: "Full Chat Session" },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages([...data.messages]);
      });
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || !conversation || sending) return;
    setSending(true);
    setInput("");
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-full flex flex-col">
      <div>
        <h1 className="font-heading text-2xl font-bold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Your Microsoft Sales HandoffAI — ask anything about deals, capacities, risks, and handoff status</p>
      </div>

      <div className="flex flex-col flex-1 bg-card rounded-2xl border border-border overflow-hidden" style={{ minHeight: 600 }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-primary/5">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-heading font-semibold text-sm">HandoffAI Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-xs text-muted-foreground">Ready · Microsoft Sales Team</p>
            </div>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all font-medium"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">How can I help your sales team today?</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">I have full visibility into all handoffs, deal statuses, team capacities, and communication history. Ask me anything.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role !== "user" && (
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground border border-border"
              }`}>
                <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content || ""}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted border border-border rounded-2xl px-4 py-3 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about deals, capacities, risks, summaries..."
              rows={2}
              className="flex-1 resize-none bg-muted rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-primary/30 transition-colors"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending || loading}
              className="h-12 w-12 rounded-xl p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}