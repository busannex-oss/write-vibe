import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User, Brain, Search, Loader2, ChevronDown, ChevronUp,
  BookOpen, GitBranch, AlertCircle, MessageSquare, Target, Zap, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MEMORY_TYPE_CONFIG = {
  observation:    { color: "bg-blue-500/20 text-blue-300 border-blue-500/30",    icon: MessageSquare },
  decision:       { color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: Target },
  error:          { color: "bg-red-500/20 text-red-300 border-red-500/30",        icon: AlertCircle },
  optimization:   { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: Zap },
  task_completed: { color: "bg-green-500/20 text-green-300 border-green-500/30",  icon: CheckCircle2 },
  escalation:     { color: "bg-orange-500/20 text-orange-300 border-orange-500/30", icon: AlertCircle },
  context:        { color: "bg-slate-500/20 text-slate-300 border-slate-500/30",  icon: Brain }
};

const AGENT_COLORS = [
  "border-l-amber-400", "border-l-sky-400", "border-l-violet-400",
  "border-l-emerald-400", "border-l-rose-400", "border-l-cyan-400",
  "border-l-orange-400", "border-l-lime-400", "border-l-pink-400", "border-l-teal-400"
];

function MemoryRow({ memory, expanded, onToggle }) {
  const cfg = MEMORY_TYPE_CONFIG[memory.memory_type] || MEMORY_TYPE_CONFIG.observation;
  const Icon = cfg.icon;
  return (
    <div className="py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-2">
        <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white/40" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-white/75 leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
            {memory.content}
          </p>
          {memory.content.length > 100 && (
            <button
              onClick={onToggle}
              className="text-xs text-amber-400/60 hover:text-amber-400 mt-0.5 flex items-center gap-1"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />More</>}
            </button>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Badge className={`text-xs border ${cfg.color}`}>{memory.memory_type}</Badge>
          <span className="text-xs text-white/25">
            {new Date(memory.created_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function AgentSection({ agentName, memories, colorClass }) {
  const [open, setOpen] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Card className={`bg-white/5 border-white/10 border-l-2 ${colorClass}`}>
      <button
        className="w-full text-left"
        onClick={() => setOpen(o => !o)}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex items-center gap-3">
            <Brain className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-white text-sm capitalize">
              {agentName.replace(/_/g, " ")}
            </span>
            <Badge className="bg-white/10 text-white/50 border-0 text-xs ml-1">
              {memories.length} {memories.length === 1 ? "log" : "logs"}
            </Badge>
            <div className="ml-auto">
              {open
                ? <ChevronUp className="w-4 h-4 text-white/40" />
                : <ChevronDown className="w-4 h-4 text-white/40" />
              }
            </div>
          </div>
        </CardHeader>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="px-4 pb-3 pt-0">
              {memories.map(m => (
                <MemoryRow
                  key={m.id}
                  memory={m}
                  expanded={expandedIds.has(m.id)}
                  onToggle={() => toggleExpand(m.id)}
                />
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function CharacterJourneyView() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [customName, setCustomName] = useState("");
  const [searchName, setSearchName] = useState("");

  // Load books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["books-for-character-journey"],
    queryFn: () => base44.entities.Book.list("-updated_date", 30)
  });

  // Load all memories (unfiltered so we can cross-reference across agents)
  const { data: memoriesData, isLoading: memoriesLoading } = useQuery({
    queryKey: ["all-memories-for-character-journey"],
    queryFn: async () => {
      const res = await base44.functions.invoke("agentMemory", {
        action: "list",
        per_page: 500,
        include_archived: false
      });
      return res.data?.memories || [];
    }
  });

  const allMemories = memoriesData || [];

  // Extract characters from selected book
  const bookCharacters = useMemo(() => {
    if (!selectedBook?.characters?.length) return [];
    return selectedBook.characters.map(c => c.name).filter(Boolean);
  }, [selectedBook]);

  // Active name to search for (either selected character or custom input)
  const activeName = selectedCharacter || searchName.trim();

  // Filter memories that mention the character name (case-insensitive)
  const matchingMemories = useMemo(() => {
    if (!activeName) return [];
    const lower = activeName.toLowerCase();
    return allMemories.filter(m =>
      m.content?.toLowerCase().includes(lower) ||
      m.embedding_keywords?.some(k => k.toLowerCase().includes(lower)) ||
      m.tags?.some(t => t.toLowerCase().includes(lower))
    );
  }, [allMemories, activeName]);

  // Group by agent
  const byAgent = useMemo(() => {
    return matchingMemories.reduce((acc, m) => {
      if (!acc[m.agent_name]) acc[m.agent_name] = [];
      acc[m.agent_name].push(m);
      return acc;
    }, {});
  }, [matchingMemories]);

  const agentEntries = Object.entries(byAgent).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <GitBranch className="w-5 h-5 text-amber-400" />
            Character Journey Cross-Reference
          </CardTitle>
          <p className="text-sm text-white/40">
            Find every memory log that mentions a specific character — across all agents — to keep their journey consistent.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {/* Step 1: Pick book */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Step 1 — Select a Book (optional)
            </p>
            {booksLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {books.map(book => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedCharacter(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedBook?.id === book.id
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3 h-3 inline mr-1.5" />
                    {book.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Pick character from book or type custom */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Step 2 — Select or Type a Character Name
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {bookCharacters.map(name => (
                <button
                  key={name}
                  onClick={() => { setSelectedCharacter(name); setSearchName(""); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selectedCharacter === name
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <User className="w-3 h-3" />
                  {name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={searchName}
                onChange={e => { setSearchName(e.target.value); setSelectedCharacter(null); }}
                placeholder="Or type any character name…"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
              {(searchName || selectedCharacter) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setSearchName(""); setSelectedCharacter(null); }}
                  className="text-white/40 hover:text-white"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {activeName && (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              <span className="text-white font-semibold">{activeName}</span>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                {matchingMemories.length} logs across {agentEntries.length} agents
              </Badge>
            </div>
            {memoriesLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
          </div>

          {matchingMemories.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-10 text-center">
                <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">No memory logs mention "<strong>{activeName}</strong>" yet.</p>
                <p className="text-white/30 text-xs mt-1">Generate book insights from an agent profile to populate memories.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {agentEntries.map(([agent, mems], idx) => (
                <AgentSection
                  key={agent}
                  agentName={agent}
                  memories={mems}
                  colorClass={AGENT_COLORS[idx % AGENT_COLORS.length]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!activeName && (
        <Card className="bg-white/5 border-white/10 border-dashed">
          <CardContent className="py-12 text-center">
            <User className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Select or type a character name above to see their cross-agent journey.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}