import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Sparkles, Loader2, BookOpen, AlertTriangle,
  CheckCircle2, XCircle, TrendingUp, Users, Layers,
  BarChart2, FileText, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const invoke = (fn, payload) => base44.functions.invoke(fn, payload);

const GRADE_CONFIG = {
  A: { color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30",  label: "Excellent" },
  B: { color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/30",   label: "Good" },
  C: { color: "text-amber-400",  bg: "bg-amber-500/15",  border: "border-amber-500/30",  label: "Fair" },
  D: { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", label: "Needs Work" },
  F: { color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/30",    label: "Critical" },
};

const SEVERITY_CONFIG = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: XCircle },
  major:    { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle },
  minor:    { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: AlertTriangle },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle },
  medium:   { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: AlertTriangle },
  low:      { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: CheckCircle2 },
};

function ScoreRing({ score, grade, size = 120 }) {
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG.C;
  const r = 40, stroke = 6;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke="currentColor"
          strokeWidth={stroke} fill="none" strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round" className={cfg.color} />
      </svg>
      <div className="absolute text-center">
        <div className={cn("text-2xl font-bold", cfg.color)}>{grade}</div>
        <div className="text-white/40 text-xs">{score}/100</div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, score, grade, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG.C;
  return (
    <div className="bg-slate-900 border border-white/8 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-white font-semibold">{title}</span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", cfg.color, cfg.bg, cfg.border)}>
            {grade} · {score}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 border-t border-white/6 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IssueItem({ severity, title, description, recommendation }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.minor;
  const IIcon = cfg.icon;
  return (
    <div className={cn("rounded-lg p-3 border", cfg.bg, cfg.border)}>
      <div className="flex items-start gap-2">
        <IIcon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
        <div>
          <p className={cn("text-sm font-semibold", cfg.color)}>{title}</p>
          {description && <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{description}</p>}
          {recommendation && (
            <div className="mt-1.5 bg-white/5 rounded px-2 py-1">
              <p className="text-white/40 text-xs"><span className="text-green-400 font-semibold">Fix: </span>{recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export default function BookHealthCheck() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(bookId || "");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [progress, setProgress] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [targetAge, setTargetAge] = useState("adult");

  useEffect(() => {
    base44.entities.Book.list('-updated_date').then(b => {
      setBooks(b);
      setLoadingBooks(false);
      if (bookId) setBook(b.find(x => x.id === bookId) || null);
    });
  }, []);

  useEffect(() => {
    if (selectedBookId) setBook(books.find(b => b.id === selectedBookId) || null);
  }, [selectedBookId, books]);

  const runAnalysis = async () => {
    if (!selectedBookId) return;
    setLoading(true);
    setAnalysis(null);
    setProgress("Loading manuscript and outline data...");
    await new Promise(r => setTimeout(r, 400));
    setProgress("Analyzing narrative consistency and character arcs...");
    await new Promise(r => setTimeout(r, 600));
    setProgress("Calculating readability scores and structural gaps...");
    const res = await invoke("bookHealthCheck", { book_id: selectedBookId, target_age: targetAge });
    setAnalysis(res.data.analysis);
    setWordCount(res.data.word_count || 0);
    setLoading(false);
    setProgress("");
  };

  const a = analysis;
  const overallGrade = a?.overall_grade || scoreToGrade(a?.overall_health_score || 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(book ? `/BookEditor?id=${book.id}` : '/Books')} className="text-white/50 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">Book Health Check</h1>
                <p className="text-white/30 text-xs">AI manuscript analysis &amp; improvement recommendations</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={targetAge} onValueChange={setTargetAge}>
              <SelectTrigger className="h-8 text-xs w-40 bg-slate-800 border-white/10 text-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="children">Children (5–8)</SelectItem>
                <SelectItem value="middle_grade">Middle Grade (8–12)</SelectItem>
                <SelectItem value="young_adult">Young Adult (13–17)</SelectItem>
                <SelectItem value="new_adult">New Adult (18–25)</SelectItem>
                <SelectItem value="adult">Adult (25+)</SelectItem>
                <SelectItem value="all_ages">All Ages</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={loading || !selectedBookId}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" size="sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              {loading ? "Analyzing..." : analysis ? "Re-analyze" : "Run Health Check"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Book Selector */}
        {!bookId && (
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-3 font-medium">Select a book to analyze</p>
            {loadingBooks ? (
              <div className="flex gap-2 items-center text-white/30 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading books...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {books.map(b => (
                  <button key={b.id} onClick={() => setSelectedBookId(b.id)}
                    className={cn("text-left p-3 rounded-lg border transition-all",
                      selectedBookId === b.id
                        ? "bg-amber-500/10 border-amber-500/40 text-white"
                        : "bg-white/3 border-white/8 text-white/60 hover:bg-white/6 hover:text-white/80")}>
                    <p className="font-medium text-sm truncate">{b.title || "Untitled"}</p>
                    <p className="text-xs opacity-50 mt-0.5">{b.category || "No genre"} · {b.status}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BarChart2 className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold">{progress}</p>
              <p className="text-white/30 text-sm">AI is reviewing narrative, readability, structure, and characters</p>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !analysis && selectedBookId && (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-white/8 flex items-center justify-center">
              <BarChart2 className="w-10 h-10 text-white/20" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold mb-1">Ready to analyze{book ? ` "${book.title}"` : ""}</h2>
              <p className="text-white/40 text-sm max-w-sm">
                AI will evaluate narrative consistency, readability scores, structural gaps, character development, and publishing readiness.
              </p>
            </div>
            <Button onClick={runAnalysis} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Run Health Check
            </Button>
          </div>
        )}

        {/* Results */}
        {!loading && analysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Overall Score */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing score={a.overall_health_score || 0} grade={overallGrade} size={140} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <h2 className="text-white text-xl font-bold">{book?.title || "Book"} Health Report</h2>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-white" onClick={runAnalysis}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{a.summary}</p>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <p className="text-white/30 text-xs">Words</p>
                      <p className="text-white font-bold">{wordCount.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <p className="text-white/30 text-xs">Readiness</p>
                      <p className="text-amber-400 font-bold text-xs">{a.publishing_readiness?.ready_for || '—'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <p className="text-white/30 text-xs">Reading Level</p>
                      <p className="text-white font-bold text-xs">{a.readability?.grade_level || '—'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <p className="text-white/30 text-xs">Pacing</p>
                      <p className="text-white font-bold text-xs">{a.readability?.pacing || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-scores bar */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Readability", score: a.readability?.score },
                  { label: "Narrative", score: a.narrative_consistency?.score },
                  { label: "Structure", score: a.structure?.score },
                  { label: "Characters", score: a.character_development?.score },
                ].map(item => {
                  const g = scoreToGrade(item.score || 0);
                  const cfg = GRADE_CONFIG[g];
                  return (
                    <div key={item.label} className="bg-white/4 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/50 text-xs">{item.label}</span>
                        <span className={cn("text-xs font-bold", cfg.color)}>{g}</span>
                      </div>
                      <Progress value={item.score || 0} className="h-1.5 bg-white/10" />
                      <p className="text-white/30 text-xs mt-1">{item.score || 0}/100</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Recommendations */}
            {a.recommendations?.length > 0 && (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Improvement Recommendations
                </h3>
                <div className="space-y-2">
                  {a.recommendations.map((rec, i) => {
                    const cfg = SEVERITY_CONFIG[rec.priority] || SEVERITY_CONFIG.minor;
                    return (
                      <div key={i} className={cn("rounded-lg p-3 border", cfg.bg, cfg.border)}>
                        <div className="flex items-start gap-2">
                          <span className={cn("text-xs font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5", cfg.color, cfg.bg, cfg.border, "border")}>
                            {rec.priority}
                          </span>
                          <div>
                            <p className="text-white text-sm font-semibold">{rec.title}</p>
                            <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{rec.action}</p>
                            <p className="text-white/25 text-xs mt-0.5">{rec.category}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detail Sections */}
            <div className="space-y-3">
              {/* Readability */}
              <SectionCard title="Readability Analysis" icon={FileText} score={a.readability?.score || 0} grade={scoreToGrade(a.readability?.score || 0)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {[
                    { k: "Grade Level", v: a.readability?.grade_level },
                    { k: "Flesch Ease", v: a.readability?.flesch_reading_ease },
                    { k: "Vocabulary", v: a.readability?.vocabulary_level },
                    { k: "Avg Sentence", v: a.readability?.avg_sentence_length ? `${a.readability.avg_sentence_length} words` : null },
                    { k: "Pacing", v: a.readability?.pacing },
                  ].filter(x => x.v).map(x => (
                    <div key={x.k} className="bg-white/4 rounded-lg p-2">
                      <p className="text-white/30 text-xs">{x.k}</p>
                      <p className="text-white text-sm font-semibold">{x.v}</p>
                    </div>
                  ))}
                </div>
                {a.readability?.notes && <p className="text-white/50 text-sm leading-relaxed">{a.readability.notes}</p>}
              </SectionCard>

              {/* Narrative Consistency */}
              <SectionCard title="Narrative Consistency" icon={BookOpen} score={a.narrative_consistency?.score || 0} grade={scoreToGrade(a.narrative_consistency?.score || 0)}>
                {a.narrative_consistency?.issues?.length > 0 ? (
                  a.narrative_consistency.issues.map((issue, i) => (
                    <IssueItem key={i} severity={issue.severity} title={issue.title} description={issue.description} />
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" /> No major consistency issues found</div>
                )}
                {a.narrative_consistency?.notes && <p className="text-white/40 text-xs mt-2">{a.narrative_consistency.notes}</p>}
              </SectionCard>

              {/* Structure */}
              <SectionCard title="Story Structure" icon={Layers} score={a.structure?.score || 0} grade={scoreToGrade(a.structure?.score || 0)}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {a.structure?.act_structure && <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20">{a.structure.act_structure}</Badge>}
                  {a.structure?.chapter_balance && <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/20">{a.structure.chapter_balance}</Badge>}
                  {a.structure?.word_count_assessment && <Badge className="bg-slate-500/10 text-slate-300 border-slate-500/20">{a.structure.word_count_assessment}</Badge>}
                </div>
                {a.structure?.gaps?.length > 0 ? (
                  <div className="space-y-2">
                    {a.structure.gaps.map((gap, i) => (
                      <IssueItem key={i} severity="major" title={gap.location} description={gap.description} recommendation={gap.recommendation} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" /> Structure looks solid</div>
                )}
                {a.structure?.notes && <p className="text-white/40 text-xs mt-2">{a.structure.notes}</p>}
              </SectionCard>

              {/* Character Development */}
              <SectionCard title="Character Development" icon={Users} score={a.character_development?.score || 0} grade={scoreToGrade(a.character_development?.score || 0)}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {a.character_development?.protagonist_arc && (
                    <div className="bg-white/4 rounded-lg px-3 py-1.5">
                      <span className="text-white/30 text-xs">Protagonist Arc: </span>
                      <span className="text-white text-xs font-semibold">{a.character_development.protagonist_arc}</span>
                    </div>
                  )}
                  {a.character_development?.supporting_cast && (
                    <div className="bg-white/4 rounded-lg px-3 py-1.5">
                      <span className="text-white/30 text-xs">Supporting Cast: </span>
                      <span className="text-white text-xs font-semibold">{a.character_development.supporting_cast}</span>
                    </div>
                  )}
                </div>
                {a.character_development?.issues?.length > 0 ? (
                  <div className="space-y-2">
                    {a.character_development.issues.map((issue, i) => (
                      <IssueItem key={i} severity="minor" title={issue.character} description={issue.issue} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" /> Character development is on track</div>
                )}
                {a.character_development?.notes && <p className="text-white/40 text-xs mt-2">{a.character_development.notes}</p>}
              </SectionCard>

              {/* Publishing Readiness */}
              <SectionCard title="Publishing Readiness" icon={TrendingUp} score={a.publishing_readiness?.score || 0} grade={scoreToGrade(a.publishing_readiness?.score || 0)} defaultOpen>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-3">
                  <p className="text-amber-400 text-xs font-semibold mb-0.5">Current Stage</p>
                  <p className="text-white font-bold">{a.publishing_readiness?.ready_for || '—'}</p>
                </div>
                {a.publishing_readiness?.blockers?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-red-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Blockers</p>
                    <div className="space-y-1">
                      {a.publishing_readiness.blockers.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-red-300/70">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />{b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {a.publishing_readiness?.next_steps?.length > 0 && (
                  <div>
                    <p className="text-green-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Next Steps</p>
                    <div className="space-y-1">
                      {a.publishing_readiness.next_steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-400" />{s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}