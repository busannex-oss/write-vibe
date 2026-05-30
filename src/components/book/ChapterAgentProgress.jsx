import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2, Bot } from "lucide-react";

/**
 * Defines the agents involved in chapter completion and how to detect their contribution.
 * Each agent has a weight (total = 100) and a detector function.
 */
const AGENT_CONTRIBUTIONS = [
  {
    name: "Outline Generator",
    key: "outline",
    weight: 15,
    color: "bg-blue-400",
    labelColor: "text-blue-400",
    detect: (chapter, book) => {
      const outline = book.industry_outline || book.detailed_outline || [];
      const entry = outline[chapter._index];
      return !!(entry?.summary || entry?.scene_breakdown || entry?.narrative_arc);
    },
  },
  {
    name: "Manuscript Writer",
    key: "content",
    weight: 35,
    color: "bg-amber-400",
    labelColor: "text-amber-400",
    detect: (chapter) => {
      const words = chapter?.word_count || 0;
      return words > 0 ? Math.min(1, words / (chapter._target || 2500)) : 0;
    },
  },
  {
    name: "Character Creator",
    key: "characters",
    weight: 10,
    color: "bg-purple-400",
    labelColor: "text-purple-400",
    detect: (_chapter, book) => {
      return (book.characters?.length || 0) > 0 ? 1 : 0;
    },
  },
  {
    name: "Cover Designer",
    key: "illustration",
    weight: 15,
    color: "bg-pink-400",
    labelColor: "text-pink-400",
    detect: (chapter) => {
      return (chapter?.images?.length || 0) > 0 ? 1 : 0;
    },
  },
  {
    name: "AI Editor",
    key: "edited",
    weight: 15,
    color: "bg-emerald-400",
    labelColor: "text-emerald-400",
    detect: (chapter) => {
      // Considered edited if word count exceeds a short stub (>500 words and content present)
      return chapter?.word_count > 500 && chapter?.content ? 1 : 0;
    },
  },
  {
    name: "Summary Writer",
    key: "summary",
    weight: 10,
    color: "bg-cyan-400",
    labelColor: "text-cyan-400",
    detect: (_chapter, book) => {
      return book.book_summary ? 1 : 0;
    },
  },
];

/**
 * Returns a score 0-1 for an agent's contribution.
 */
function detectScore(agent, chapter, book) {
  const raw = agent.detect(chapter, book);
  return typeof raw === "number" ? raw : raw ? 1 : 0;
}

export default function ChapterAgentProgress({ chapter, outlineEntry, book, isGenerating }) {
  const enrichedChapter = { ...chapter, _index: chapter?._index, _target: outlineEntry?.word_count_target || 2500 };

  const agents = useMemo(() => {
    return AGENT_CONTRIBUTIONS.map((agent) => {
      const score = detectScore(agent, enrichedChapter, book);
      return { ...agent, score, contrib: Math.round(score * agent.weight) };
    });
  }, [chapter, book]);

  const totalScore = agents.reduce((sum, a) => sum + a.contrib, 0); // 0–100
  const isComplete = totalScore >= 95;

  return (
    <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-white/50 font-medium">Agent Contributions</span>
          {isGenerating && <Loader2 className="w-3 h-3 text-amber-400 animate-spin ml-1" />}
        </div>
        <span className={cn("text-xs font-bold", isComplete ? "text-emerald-400" : "text-amber-400")}>
          {isComplete ? <span className="flex items-center gap-1"><Check className="w-3 h-3" />Complete</span> : `${totalScore}%`}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
        {agents.map((agent) =>
          agent.contrib > 0 ? (
            <div
              key={agent.key}
              title={`${agent.name}: ${agent.contrib}%`}
              className={cn("h-full transition-all duration-700", agent.color)}
              style={{ width: `${agent.contrib}%` }}
            />
          ) : null
        )}
      </div>

      {/* Agent breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {agents.map((agent) => (
          <div key={agent.key} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full shrink-0", agent.score > 0 ? agent.color : "bg-white/15")} />
            <span className={cn("text-xs truncate", agent.score > 0 ? "text-white/70" : "text-white/30")}>
              {agent.name}
            </span>
            <span className={cn("text-xs ml-auto shrink-0", agent.score > 0 ? agent.labelColor : "text-white/20")}>
              {agent.contrib}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}