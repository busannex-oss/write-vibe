import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle, MessageSquare, Brain, Camera, Save, Loader2, Send, Trash2, RefreshCw, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import AgentBookInsights from "@/components/chainofcommand/AgentBookInsights";

const ROLE_DESCRIPTIONS = {
  admin: "System Owner — oversees the entire organizational intelligence network and ensures all agents operate within established protocols.",
  executive: "Executive Director — manages strategic operations and coordinates multi-department initiatives aligned with business objectives.",
  manager: "Department Manager — supervises specialized teams, monitors performance, and reports directly to executive level.",
  maintenance: "System Maintenance & Memory Guardian — manages persistent agent memory, knowledge bases, and cross-agent communication systems.",
  specialist: "Specialized Intelligence Node — operates as a subject matter expert providing targeted intelligence and analysis in their domain."
};

const TABS = [
  { id: "profile",   label: "Profile",   icon: Zap },
  { id: "chat",      label: "Chat",      icon: MessageSquare },
  { id: "memory",    label: "Memory",    icon: Brain },
  { id: "insights",  label: "Insights",  icon: BookOpen },
  { id: "photo",     label: "Photo",     icon: Camera },
];

export default function AgentProfile({ agent, onClose, brandColors, pillars, onAgentUpdate }) {
  const [activeTab, setActiveTab] = useState("profile");

  // Chat
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello! I'm ${agent.name}, your ${agent.title}. How can I assist you today?` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Memory
  const [memories, setMemories] = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [savingMemory, setSavingMemory] = useState(false);

  // Book Insights
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [booksLoading, setBooksLoading] = useState(false);

  // Photo
  const [photoUrl, setPhotoUrl] = useState(agent.image || null);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(!!agent.image);

  useEffect(() => {
    if (activeTab === "memory") loadMemories();
    if (activeTab === "insights" && !books.length) loadBooks();
  }, [activeTab]);

  const loadBooks = async () => {
    setBooksLoading(true);
    try {
      const res = await base44.entities.Book.list('-updated_date', 20);
      setBooks(res || []);
      if (res?.length) setSelectedBook(res[0]);
    } catch (_) {}
    setBooksLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getStatusBadge = (status) => {
    const config = {
      active: { color: "#10b981", label: "ACTIVE" },
      in_development: { color: "#f59e0b", label: "IN DEVELOPMENT" },
      planned: { color: "#6366f1", label: "PLANNED" }
    };
    return config[status] || config.active;
  };
  const statusBadge = getStatusBadge(agent.status);

  // ── CHAT ───────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    let memoryContext = "";
    try {
      const memRes = await base44.functions.invoke("agentMemory", {
        action: "recall", agent_name: agent.id, query: userMsg, limit: 5
      });
      if (memRes.data?.results?.length) {
        memoryContext = "\n\nRelevant memories:\n" + memRes.data.results.map(m => `- ${m.content}`).join("\n");
      }
    } catch (_) {}

    const recentHistory = messages.slice(-8)
      .map(m => `${m.role === "user" ? "Human" : agent.name}: ${m.content}`)
      .join("\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are ${agent.name}, an AI agent with the role of ${agent.title}.
Description: ${agent.description}
Strategic pillars: ${agent.pillars?.join(", ")}
${memoryContext}

Conversation:
${recentHistory}
Human: ${userMsg}
${agent.name}:`,
    });

    const assistantMsg = typeof response === "string" ? response : response?.text || "I understand. How can I help further?";
    setMessages(prev => [...prev, { role: "assistant", content: assistantMsg }]);

    // Auto-save meaningful exchanges to memory
    try {
      await base44.functions.invoke("agentMemory", {
        action: "write",
        agent_name: agent.id,
        memory_type: "context",
        content: `User asked: "${userMsg}" — Agent responded: "${assistantMsg.slice(0, 200)}"`,
        importance: "low"
      });
    } catch (_) {}

    setChatLoading(false);
  };

  // ── MEMORY ─────────────────────────────────────────────────────────────────
  const loadMemories = async () => {
    setMemoriesLoading(true);
    try {
      const res = await base44.functions.invoke("agentMemory", {
        action: "list", agent_name: agent.id, per_page: 20
      });
      setMemories(res.data?.memories || []);
    } catch (_) {
      setMemories([]);
    }
    setMemoriesLoading(false);
  };

  const saveMemory = async () => {
    if (!newMemory.trim()) return;
    setSavingMemory(true);
    await base44.functions.invoke("agentMemory", {
      action: "write",
      agent_name: agent.id,
      memory_type: "observation",
      content: newMemory.trim(),
      importance: "medium"
    });
    setNewMemory("");
    await loadMemories();
    setSavingMemory(false);
  };

  const archiveMemory = async (id) => {
    await base44.functions.invoke("agentMemory", { action: "archive", memory_id: id });
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  // ── PHOTO ──────────────────────────────────────────────────────────────────
  const generatePhoto = async () => {
    setGeneratingPhoto(true);
    setPhotoSaved(false);
    const { url } = await base44.integrations.Core.GenerateImage({
      prompt: `Photorealistic professional portrait of ${agent.name}, an AI agent who works as ${agent.title}. 
${agent.age ? `Age: ${agent.age}.` : ""} 
Style: cinematic, corporate headshot, soft studio lighting, high-tech modern background, professional attire.
The person looks intelligent, confident and approachable. Ultra-detailed face, 4K quality.`
    });
    setPhotoUrl(url);
    setGeneratingPhoto(false);
  };

  const savePhoto = async () => {
    if (!photoUrl || !onAgentUpdate) return;
    setSavingPhoto(true);
    // Upload to permanent storage
    const response = await fetch(photoUrl);
    const blob = await response.blob();
    const file = new File([blob], `${agent.id}_portrait.jpg`, { type: "image/jpeg" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onAgentUpdate(agent.id, { image: file_url });
    setPhotoUrl(file_url);
    setPhotoSaved(true);
    setSavingPhoto(false);
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="fixed right-0 top-0 h-full w-full md:w-[480px] z-50 flex flex-col"
        style={{ backgroundColor: brandColors.background }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ backgroundColor: brandColors.secondary + "80", borderColor: brandColors.accent + "40" }}
        >
          <div className="flex items-center gap-3">
            {(agent.image || photoUrl) ? (
              <img src={agent.image || photoUrl} alt={agent.name}
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: brandColors.accent + "80" }} />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brandColors.accent + "30", border: `2px solid ${brandColors.accent}60` }}>
                <span className="font-bold" style={{ color: brandColors.accent }}>{agent.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="font-bold text-base" style={{ color: brandColors.text }}>{agent.name}</h2>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: brandColors.accent }}>{agent.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0" style={{ borderColor: brandColors.accent + "30" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{
                color: activeTab === tab.id ? brandColors.accent : brandColors.text + "60",
                borderBottom: activeTab === tab.id ? `2px solid ${brandColors.accent}` : "2px solid transparent",
                backgroundColor: activeTab === tab.id ? brandColors.accent + "10" : "transparent"
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── PROFILE TAB ────────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="p-5 space-y-5">
              {/* Status */}
              <div className="px-4 py-2.5 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: statusBadge.color + "20", border: `1px solid ${statusBadge.color}40` }}>
                <CheckCircle className="w-4 h-4" style={{ color: statusBadge.color }} />
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: statusBadge.color }}>
                  {statusBadge.label}
                </span>
                {agent.age && <span className="ml-auto text-xs" style={{ color: brandColors.text + "60" }}>Age {agent.age}</span>}
              </div>

              {/* Description */}
              {agent.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2" style={{ color: brandColors.accent }}>Description</h4>
                  <p className="text-sm leading-relaxed" style={{ color: brandColors.text + "CC" }}>{agent.description}</p>
                </div>
              )}

              {/* Role Context */}
              <div>
                <h4 className="text-xs font-bold uppercase mb-2" style={{ color: brandColors.accent }}>Role Context</h4>
                <p className="text-sm leading-relaxed" style={{ color: brandColors.text + "CC" }}>{ROLE_DESCRIPTIONS[agent.role]}</p>
              </div>

              {/* Pillar Alignment */}
              <div>
                <h4 className="text-xs font-bold uppercase mb-3" style={{ color: brandColors.accent }}>Pillar Alignment</h4>
                <div className="space-y-2">
                  {agent.pillars?.map((pillar, idx) => (
                    <div key={idx} className="px-3 py-2 rounded-lg"
                      style={{ backgroundColor: brandColors.accent + "15", border: `1px solid ${brandColors.accent}30` }}>
                      <p className="text-sm font-semibold" style={{ color: brandColors.accent }}>{pillar}</p>
                      <p className="text-xs mt-0.5" style={{ color: brandColors.text + "70" }}>Strategic alignment with core organizational pillars</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Capabilities */}
              <div>
                <h4 className="text-xs font-bold uppercase mb-3" style={{ color: brandColors.accent }}>Core Capabilities</h4>
                <ul className="space-y-1.5 text-sm" style={{ color: brandColors.text + "CC" }}>
                  {["Persistent memory and context awareness", "Cross-agent communication and coordination", "Real-time performance monitoring", "Autonomous task execution and escalation"].map(c => (
                    <li key={c} className="flex items-center gap-2"><span style={{ color: brandColors.accent }}>✓</span>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Performance */}
              {agent.status === "active" && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-3" style={{ color: brandColors.accent }}>Performance Metrics</h4>
                  <div className="space-y-2">
                    {[["Task Completion", "96%"], ["Response Time", "1.2s avg"], ["System Health", "98%"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span style={{ color: brandColors.text + "80" }}>{k}</span>
                        <span style={{ color: "#10b981" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CHAT TAB ───────────────────────────────────────────────────── */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full" style={{ minHeight: "calc(100% - 0px)" }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={{
                        backgroundColor: msg.role === "user" ? brandColors.accent : brandColors.secondary + "80",
                        color: msg.role === "user" ? "#000" : brandColors.text,
                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px"
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: brandColors.secondary + "80" }}>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                            style={{ backgroundColor: brandColors.accent, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t shrink-0" style={{ borderColor: brandColors.accent + "30" }}>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder={`Message ${agent.name}...`}
                    className="flex-1 text-sm"
                    style={{ backgroundColor: brandColors.secondary + "60", borderColor: brandColors.accent + "40", color: brandColors.text }}
                    disabled={chatLoading}
                  />
                  <Button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()}
                    className="shrink-0"
                    style={{ backgroundColor: brandColors.accent, color: "#000" }}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── MEMORY TAB ─────────────────────────────────────────────────── */}
          {activeTab === "memory" && (
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase mb-3" style={{ color: brandColors.accent }}>Add Memory</h4>
                <div className="flex gap-2">
                  <Input
                    value={newMemory}
                    onChange={e => setNewMemory(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveMemory()}
                    placeholder="Enter a memory or instruction for this agent..."
                    className="flex-1 text-sm"
                    style={{ backgroundColor: brandColors.secondary + "60", borderColor: brandColors.accent + "40", color: brandColors.text }}
                  />
                  <Button onClick={saveMemory} disabled={savingMemory || !newMemory.trim()}
                    style={{ backgroundColor: brandColors.accent, color: "#000" }}>
                    {savingMemory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase" style={{ color: brandColors.accent }}>
                    Stored Memories ({memories.length})
                  </h4>
                  <Button variant="ghost" size="sm" onClick={loadMemories} className="text-white/40 hover:text-white h-7 px-2">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
                {memoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.accent }} />
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: brandColors.text + "40" }}>
                    No memories yet. Add one above or start a chat.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memories.map(mem => (
                      <div key={mem.id} className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: brandColors.secondary + "40", border: `1px solid ${brandColors.accent}20` }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: brandColors.text + "CC" }}>{mem.content}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: brandColors.accent + "20", color: brandColors.accent }}>
                              {mem.memory_type}
                            </span>
                            <span className="text-xs" style={{ color: brandColors.text + "40" }}>
                              {new Date(mem.created_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => archiveMemory(mem.id)}
                          className="shrink-0 text-white/30 hover:text-red-400 transition-colors mt-0.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── INSIGHTS TAB ───────────────────────────────────────────────── */}
          {activeTab === "insights" && (
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase mb-1" style={{ color: brandColors.accent }}>
                  Book Intelligence
                </h4>
                <p className="text-xs mb-3" style={{ color: brandColors.text + "60" }}>
                  Insights {agent.name} has gathered about characters, plot, themes, and world-building.
                </p>
              </div>

              {/* Book Selector */}
              {booksLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: brandColors.accent }} />
                </div>
              ) : books.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: brandColors.text + "40" }}>
                  No books found. Create a book in the Books section first.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {books.map(book => (
                      <button
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                        style={{
                          backgroundColor: selectedBook?.id === book.id ? brandColors.accent + "30" : "transparent",
                          borderColor: selectedBook?.id === book.id ? brandColors.accent + "60" : brandColors.accent + "20",
                          color: selectedBook?.id === book.id ? brandColors.accent : brandColors.text + "60"
                        }}
                      >
                        {book.title}
                      </button>
                    ))}
                  </div>

                  {selectedBook && (
                    <AgentBookInsights
                      book={selectedBook}
                      agentId={agent.id}
                      brandColors={brandColors}
                      maxHeight="350px"
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* ── PHOTO TAB ──────────────────────────────────────────────────── */}
          {activeTab === "photo" && (
            <div className="p-5 space-y-5">
              <div className="rounded-xl overflow-hidden border aspect-square max-w-sm mx-auto"
                style={{ borderColor: brandColors.accent + "40" }}>
                {photoUrl ? (
                  <img src={photoUrl} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                    style={{ backgroundColor: brandColors.secondary + "60" }}>
                    <Camera className="w-12 h-12" style={{ color: brandColors.accent + "60" }} />
                    <p className="text-sm" style={{ color: brandColors.text + "60" }}>No photo yet</p>
                  </div>
                )}
              </div>

              {photoSaved && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
                  style={{ backgroundColor: "#10b98120", border: "1px solid #10b98140", color: "#10b981" }}>
                  <CheckCircle className="w-4 h-4" />
                  Photo permanently saved to this agent's profile
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={generatePhoto}
                  disabled={generatingPhoto || savingPhoto}
                  className="flex-1"
                  style={{ backgroundColor: brandColors.accent, color: "#000", border: "none" }}
                >
                  {generatingPhoto ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />{photoUrl ? "Regenerate" : "Generate"} AI Photo</>
                  )}
                </Button>

                {photoUrl && !photoSaved && (
                  <Button
                    onClick={savePhoto}
                    disabled={savingPhoto || generatingPhoto}
                    className="flex-1"
                    style={{ backgroundColor: "#10b981", color: "#fff", border: "none" }}
                  >
                    {savingPhoto ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save Permanently</>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-xs text-center" style={{ color: brandColors.text + "50" }}>
                AI generates a unique portrait for {agent.name}. Click Save to store it permanently.
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}