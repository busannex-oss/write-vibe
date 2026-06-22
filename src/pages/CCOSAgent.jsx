import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageSquare, Plus, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "ccos_optimizer";

export default function CCOSAgent() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list || []);
      if (list?.length > 0 && !activeId) {
        openConversation(list[0].id);
      }
    } catch (e) {
      // no conversations yet
    }
    setLoadingList(false);
  };

  const openConversation = async (id) => {
    setActiveId(id);
    try {
      const conv = await base44.agents.getConversation(id);
      setMessages(conv?.messages || []);
    } catch (e) {
      setMessages([]);
    }
  };

  const startNew = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "CCOS Session" }
      });
      setConversations(prev => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    if (!activeId) {
      await startNew();
    }
    const text = input;
    setInput("");
    setSending(true);

    // optimistic user message
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const conv = conversations.find(c => c.id === activeId) || await base44.agents.getConversation(activeId);
      await base44.agents.addMessage(conv, { role: "user", content: text });
    } catch (e) {
      console.error(e);
    }
    // response arrives via subscription
  };

  // subscribe to active conversation for streamed responses
  useEffect(() => {
    if (!activeId) return;
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      setMessages(data?.messages || []);
      if (data?.messages?.some(m => m.role === "assistant")) setSending(false);
    });
    return () => unsubscribe();
  }, [activeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar - conversation list */}
      <aside className="w-full lg:w-72 border-r border-white/5 bg-slate-900/60 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">CCOS Agent</span>
        </div>
        <Button onClick={startNew} className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> New Session
        </Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {loadingList ? (
            <p className="text-sm text-white/40 px-2">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-white/40 px-2">No sessions yet. Start a new one.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeId === c.id ? "bg-amber-500/20 text-amber-300" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-2 opacity-50" />
                {c.metadata?.name || "CCOS Session"}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="text-center py-20">
              <TrendingUp className="w-12 h-12 text-amber-400/40 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">CCOS Optimizer</h2>
              <p className="text-white/50 max-w-md mx-auto">
                Paste any asset — a website, proposal, email sequence, or sales page — and I'll evaluate it against the full Communication-to-Cashflow framework and rewrite it to standard.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
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

        {/* Input */}
        <div className="border-t border-white/5 p-4 bg-slate-900/60">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Paste an asset to evaluate, or describe what you want to create..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[48px] max-h-40 resize-none"
            />
            <Button onClick={send} disabled={sending || !input.trim()} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 self-end">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}