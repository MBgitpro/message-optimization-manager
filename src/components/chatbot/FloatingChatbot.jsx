import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Minimize2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const initConversation = async () => {
    if (conversation) return;
    setLoading(true);
    const conv = await base44.agents.createConversation({
      agent_name: "handoff_assistant",
      metadata: { name: "Handoff Chat" },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
    });
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    initConversation();
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sending) return;
    setSending(true);
    const msg = input;
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
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[560px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">RenewalIQ Copilot</p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <p className="text-[10px] text-white/70">Solutions Specialist · Copilot Agent</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background min-h-[300px] max-h-[400px]">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-xs">Connecting to AI...</span>
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="text-center py-4">
                <Sparkles className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Ask me about renewal risks, NRR trends, at-risk accounts, or get an AI summary of any client renewal.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                }`}>
                  <ReactMarkdown className="prose prose-xs max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-0.5">
                    {msg.content || ""}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about a renewal, churn risk, or NRR..."
                className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 outline-none border border-transparent focus:border-primary/30 transition-colors"
                disabled={!conversation || loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !conversation || sending || loading}
                className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}