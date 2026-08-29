import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageSquare, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AgentChatPanel({ agent }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setActiveId(null);
    setMessages([]);
    loadConversations();
  }, [agent.name]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeId) return;
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      setMessages(data?.messages || []);
      if (data?.messages?.some((m) => m.role === "assistant")) setSending(false);
    });
    return () => unsubscribe();
  }, [activeId]);

  const loadConversations = async () => {
    const list = await base44.agents.listConversations({ agent_name: agent.name }).catch(() => []);
    setConversations(list || []);
    if (list?.length) openConversation(list[0].id);
  };

  const openConversation = async (id) => {
    setActiveId(id);
    const conv = await base44.agents.getConversation(id).catch(() => null);
    setMessages(conv?.messages || []);
  };

  const startNew = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: agent.name,
      metadata: { name: `${agent.label} Session` }
    }).catch(() => null);
    if (!conv) return null;
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setMessages([]);
    return conv;
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    let conv = activeId
      ? conversations.find((c) => c.id === activeId) || await base44.agents.getConversation(activeId).catch(() => null)
      : await startNew();
    if (!conv) { setSending(false); return; }
    await base44.agents.addMessage(conv, { role: "user", content: text }).catch(() => setSending(false));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Sessions */}
      <div className="lg:w-56 shrink-0">
        <Button onClick={startNew} size="sm" className="w-full mb-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Session
        </Button>
        <div className="space-y-1 max-h-40 lg:max-h-[420px] overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-xs text-white/30 px-2 py-1">No sessions yet.</p>
          ) : conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate ${
                activeId === c.id ? "bg-amber-500/20 text-amber-300" : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3 h-3 inline mr-1.5 opacity-50" />
              {c.metadata?.name || agent.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-white/10 rounded-2xl overflow-hidden min-h-[420px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px]">
          {messages.length === 0 && !sending && (
            <div className="text-center py-12 px-4">
              <agent.icon className="w-10 h-10 text-amber-400/40 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">{agent.label}</h3>
              <p className="text-white/40 text-sm max-w-md mx-auto">{agent.blurb}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${
                m.role === "user"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-white/5 border border-white/10 text-white/90"
              }`}>
                {m.role === "assistant"
                  ? <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{m.content || ""}</ReactMarkdown>
                  : <p className="text-sm whitespace-pre-wrap">{m.content}</p>}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
        <div className="border-t border-white/8 p-3 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={agent.placeholder}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[44px] max-h-32 resize-none text-sm"
          />
          <Button onClick={send} disabled={sending || !input.trim()} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 self-end">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}