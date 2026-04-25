import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, X, ChevronDown, ChevronUp,
  Zap, MessageSquare, Eye, TrendingUp, AlertTriangle, CheckCircle2, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const GRADE_COLORS = {
  A: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  B: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  C: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  D: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  F: "text-red-400 bg-red-500/15 border-red-500/30"
};

const SEVERITY_COLORS = {
  high: "border-l-red-500 bg-red-500/5",
  medium: "border-l-amber-500 bg-amber-500/5",
  low: "border-l-blue-500 bg-blue-500/5"
};

function ScoreRing({ score, grade }) {
  const color = grade === 'A' ? '#10b981' : grade === 'B' ? '#3b82f6' : grade === 'C' ? '#f59e0b' : grade === 'D' ? '#f97316' : '#ef4444';
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * 150.8} 150.8`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-xs leading-none">{grade}</span>
        <span className="text-white/40 text-[9px]">{score}</span>
      </div>
    </div>
  );
}

function FeedbackSection({ icon: Icon, label, data, color }) {
  const [expanded, setExpanded] = useState(true);
  if (!data) return null;
  const issues = data.issues || [];
  const visibleIssues = issues.filter(i => i.type !== 'good_rhythm' && i.type !== 'strong_dialogue' && i.type !== 'strong_consistency' && i.type !== 'good_showing').slice(0, 4);

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-3 hover:bg-white/3 transition text-left"
        onClick={() => setExpanded(s => !s)}>
        <ScoreRing score={data.score || 0} grade={data.grade || 'C'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-3.5 h-3.5", color)} />
            <span className="text-white text-xs font-semibold">{label}</span>
          </div>
          <p className="text-white/40 text-xs mt-0.5 truncate">{data.summary}</p>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 text-white/30 shrink-0" /> : <ChevronDown className="w-3 h-3 text-white/30 shrink-0" />}
      </button>

      {expanded && visibleIssues.length > 0 && (
        <div className="px-3 pb-3 space-y-2">
          {visibleIssues.map((issue, i) => (
            <div key={i} className={cn("border-l-2 pl-3 py-2 rounded-r-lg text-xs space-y-1",
              SEVERITY_COLORS[issue.severity || 'medium'])}>
              {issue.excerpt && (
                <p className="text-white/30 italic line-clamp-2">"{issue.excerpt}"</p>
              )}
              <p className="text-white/70">{issue.feedback || issue.issue || issue.description}</p>
              {(issue.suggestion || issue.rewrite) && (
                <p className="text-emerald-400/80">→ {issue.suggestion || issue.rewrite}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {expanded && visibleIssues.length === 0 && (
        <div className="px-3 pb-3">
          <p className="text-emerald-400/60 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> No major issues found</p>
        </div>
      )}
    </div>
  );
}

export default function AIFeedbackSidebar({ chapter, book, onClose }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const analyze = async () => {
    if (!chapter?.content || chapter.content.trim().length < 100) return;
    setLoading(true);
    setFeedback(null);
    const res = await base44.functions.invoke("manuscriptFeedback", {
      chapter_title: chapter.chapter_title,
      chapter_number: chapter.chapter_number,
      content: chapter.content,
      book_title: book.title,
      genre: book.category,
      characters: book.characters || []
    });
    setFeedback(res.data.feedback || null);
    setAnalyzed(true);
    setLoading(false);
  };

  const overallGrade = feedback?.overall_score >= 90 ? 'A' : feedback?.overall_score >= 80 ? 'B' : feedback?.overall_score >= 70 ? 'C' : feedback?.overall_score >= 60 ? 'D' : 'F';

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-white/8 w-80 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-white font-semibold text-sm">AI Feedback</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Chapter info */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/40 text-xs">Analyzing</p>
          <p className="text-white text-sm font-medium truncate">Ch. {chapter?.chapter_number}: {chapter?.chapter_title}</p>
          <p className="text-white/30 text-xs">{chapter?.word_count?.toLocaleString() || 0} words</p>
        </div>

        {/* Analyze button */}
        {!analyzed && (
          <Button onClick={analyze} disabled={loading || !chapter?.content}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            {loading ? "Analyzing (~20s)..." : "Analyze Chapter"}
          </Button>
        )}

        {analyzed && (
          <Button onClick={analyze} disabled={loading} variant="outline" size="sm" className="w-full text-xs">
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Re-analyze
          </Button>
        )}

        {loading && (
          <div className="text-center py-6 space-y-2">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
            <p className="text-white/40 text-xs">Reading chapter for pacing, dialogue,<br />show vs. tell & character consistency...</p>
          </div>
        )}

        {feedback && !loading && (
          <>
            {/* Overall score */}
            <div className="bg-slate-950 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <ScoreRing score={feedback.overall_score} grade={overallGrade} />
              <div>
                <p className="text-white/40 text-xs">Overall Score</p>
                <p className="text-white font-bold text-lg">{feedback.overall_score}/100</p>
                <p className="text-white/50 text-xs leading-snug mt-0.5 line-clamp-2">{feedback.overall_summary}</p>
              </div>
            </div>

            {/* Top priorities */}
            {feedback.top_priorities?.length > 0 && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 space-y-1.5">
                <p className="text-red-300 text-xs font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Top Priorities</p>
                {feedback.top_priorities.map((p, i) => (
                  <p key={i} className="text-white/60 text-xs flex gap-1.5">
                    <span className="text-red-400 shrink-0">{i+1}.</span>{p}
                  </p>
                ))}
              </div>
            )}

            {/* Section scores */}
            <FeedbackSection icon={TrendingUp} label="Plot Pacing" data={feedback.pacing} color="text-blue-400" />
            <FeedbackSection icon={MessageSquare} label="Dialogue Consistency" data={feedback.dialogue} color="text-purple-400" />
            <FeedbackSection icon={Eye} label="Show vs. Tell" data={feedback.show_vs_tell} color="text-emerald-400" />
            <FeedbackSection icon={Users} label="Character Consistency" data={feedback.character_consistency} color="text-amber-400" />
          </>
        )}

        {!chapter?.content && (
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-xs">Write or generate chapter content first to enable AI analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}