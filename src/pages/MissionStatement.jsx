import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target, History, BarChart3, Edit3, Save, RotateCcw,
  Eye, EyeOff, Sparkles, CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronUp,
  BookOpen, Bot, FileText, Check, X, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const PILLARS = [
  "Authenticity", "Creativity", "Empowerment", "Innovation",
  "Community", "Excellence", "Integrity", "Growth"
];

const defaultScores = () => PILLARS.map(p => ({ pillar_name: p, score: 0, notes: "" }));

const scoreColor = (score) => {
  if (score >= 8) return "text-green-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
};

const scoreBg = (score) => {
  if (score >= 8) return "bg-green-400";
  if (score >= 5) return "bg-amber-400";
  return "bg-red-400";
};

export default function MissionStatementPage() {
  const [tab, setTab] = useState("current"); // current | scores | history
  const [mission, setMission] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editRationale, setEditRationale] = useState("");
  const [editPublic, setEditPublic] = useState(false);

  // AI generation state
  const [genContext, setGenContext] = useState("");
  const [genTone, setGenTone] = useState("");
  const [genFocus, setGenFocus] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Deep AI generation (from source materials)
  const [deepGenerating, setDeepGenerating] = useState(false);
  const [deepDraft, setDeepDraft] = useState(null); // pending review
  const [refinementNotes, setRefinementNotes] = useState("");
  const [showRefineInput, setShowRefineInput] = useState(false);

  // Scores state
  const [scores, setScores] = useState(defaultScores());
  const [savingScores, setSavingScores] = useState(false);

  // Analysis panel
  const [showAnalysis, setShowAnalysis] = useState(false);

  const invoke = (action, extra = {}) =>
    base44.functions.invoke("mission", { action, ...extra });

  const loadAll = async () => {
    setLoading(true);
    const [mRes, vRes] = await Promise.all([
      invoke("get"),
      invoke("versions")
    ]);
    const m = mRes.data.mission;
    setMission(m);
    setVersions(vRes.data.versions || []);
    if (m) {
      setEditText(m.text || "");
      setEditPublic(m.is_public || false);
      setScores(m.pillar_scores?.length ? m.pillar_scores : defaultScores());
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Poll for analysis completion
  useEffect(() => {
    if (mission?.analysis_status !== "analyzing") return;
    const timer = setInterval(async () => {
      const res = await invoke("get");
      const m = res.data.mission;
      if (m?.analysis_status !== "analyzing") {
        setMission(m);
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [mission?.analysis_status]);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await invoke("generate", {
      context: genContext,
      tone: genTone,
      focus_areas: genFocus
    });
    setEditText(res.data.text || "");
    setGenerating(false);
  };

  const handleDeepGenerate = async (refine = false) => {
    setDeepGenerating(true);
    setDeepDraft(null);
    const res = await invoke("generate_deep", {
      refinement_notes: refine ? refinementNotes : undefined
    });
    setDeepDraft(res.data.text || "");
    setDeepGenerating(false);
    setShowRefineInput(false);
    setRefinementNotes("");
  };

  const handleAcceptDraft = async () => {
    setEditText(deepDraft);
    setDeepDraft(null);
    setEditing(true);
    setTab("current");
  };

  const handleRejectDraft = () => {
    setDeepDraft(null);
    setRefinementNotes("");
    setShowRefineInput(false);
  };

  const toggleFocus = (pillar) => {
    setGenFocus(prev => prev.includes(pillar) ? prev.filter(p => p !== pillar) : [...prev, pillar]);
  };

  const handleSaveVersion = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    const res = await invoke("update", {
      text: editText,
      change_rationale: editRationale,
      is_public: editPublic,
      pillar_scores: scores
    });
    setMission(res.data.mission);
    setEditRationale("");
    setEditing(false);
    await loadAll();
    setSaving(false);
  };

  const handleSaveScores = async () => {
    if (!mission) return;
    setSavingScores(true);
    const res = await invoke("update_scores", { id: mission.id, pillar_scores: scores });
    setMission(prev => ({ ...prev, ...res.data.mission }));
    setSavingScores(false);
  };

  const handleRestore = async (id) => {
    await invoke("restore", { id });
    await loadAll();
  };

  const handleTogglePublic = async () => {
    if (!mission) return;
    const newVal = !mission.is_public;
    await invoke("toggle_public", { id: mission.id, is_public: newVal });
    setMission(prev => ({ ...prev, is_public: newVal }));
    setEditPublic(newVal);
  };

  const updateScore = (pillar, field, value) => {
    setScores(prev => prev.map(s =>
      s.pillar_name === pillar ? { ...s, [field]: field === "score" ? Number(value) : value } : s
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const overallScore = mission?.overall_alignment_score || 0;

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-400" /> Mission Statement
            </h1>
            {mission && (
              <p className="text-white/40 text-sm mt-1">
                v{mission.version_number} · Published {mission.publish_date}
                {mission.is_public
                  ? <span className="ml-2 text-green-400">● Public</span>
                  : <span className="ml-2 text-white/30">● Private</span>}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {mission && (
              <Button variant="outline" size="sm" onClick={handleTogglePublic}>
                {mission.is_public ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {mission.is_public ? "Make Private" : "Make Public"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => { setEditing(true); setTab("current"); }}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Edit3 className="w-4 h-4 mr-1" /> New Version
            </Button>
          </div>
        </div>

        {/* AI Deep Generate Panel */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/30">
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI-Powered Mission Generation</p>
                  <p className="text-white/40 text-xs mt-0.5 flex items-center gap-2">
                    <Bot className="w-3 h-3" /> Reviews all 22 agents &nbsp;·&nbsp;
                    <FileText className="w-3 h-3" /> White papers &nbsp;·&nbsp;
                    <BookOpen className="w-3 h-3" /> Business plan
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleDeepGenerate(false)}
                disabled={deepGenerating}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shrink-0"
              >
                {deepGenerating
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Sources...</>
                  : <><Sparkles className="w-4 h-4 mr-2" />Generate from Source Materials</>
                }
              </Button>
            </div>

            {/* Draft Review Panel */}
            {deepDraft && (
              <div className="mt-5 border-t border-white/10 pt-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">AI Draft Ready — Review Before Saving</span>
                </div>
                <blockquote className="text-white/90 text-base leading-relaxed border-l-4 border-amber-500 pl-5 italic bg-white/5 p-4 rounded-r-xl">
                  {deepDraft}
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleAcceptDraft}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-1" /> Accept & Save This Version
                  </Button>
                  <Button
                    onClick={() => setShowRefineInput(p => !p)}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Refine
                  </Button>
                  <Button
                    onClick={handleRejectDraft}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-1" /> Discard
                  </Button>
                </div>
                {showRefineInput && (
                  <div className="flex gap-2">
                    <Input
                      value={refinementNotes}
                      onChange={e => setRefinementNotes(e.target.value)}
                      placeholder="What should change? e.g. 'More emphasis on community', 'Shorter and bolder', 'Mention AI agents'..."
                      className="bg-slate-800 border-white/10 text-white text-sm flex-1"
                    />
                    <Button
                      onClick={() => handleDeepGenerate(true)}
                      disabled={deepGenerating || !refinementNotes.trim()}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-black shrink-0"
                    >
                      {deepGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Regenerate"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall Score Banner */}
        {mission && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-bold", scoreColor(overallScore))}>{overallScore}</span>
              <span className="text-white/40 text-xs mt-1">Overall Score</span>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs">Version</p>
              <p className="text-white font-semibold mt-1">v{mission.version_number}</p>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs">Analysis</p>
              <p className={cn("font-semibold mt-1 capitalize text-sm", {
                "text-green-400": mission.analysis_status === "complete",
                "text-amber-400": mission.analysis_status === "analyzing",
                "text-red-400": mission.analysis_status === "error",
                "text-white/40": mission.analysis_status === "pending",
              })}>
                {mission.analysis_status === "analyzing" && <Loader2 className="w-3 h-3 inline animate-spin mr-1" />}
                {mission.analysis_status}
              </p>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-xs">Pillars Scored</p>
              <p className="text-white font-semibold mt-1">
                {(mission.pillar_scores || []).filter(s => s.score > 0).length} / {PILLARS.length}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl w-fit border border-white/5">
          {[
            { key: "current", label: "Statement", Icon: Target },
            { key: "scores", label: "Pillar Scores", Icon: BarChart3 },
            { key: "history", label: "Version History", Icon: History },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === key ? "bg-amber-500/20 text-amber-400" : "text-white/50 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── TAB: Current Mission ── */}
        {tab === "current" && (
          <div className="space-y-4">
            {editing ? (
              <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-base">Create New Version</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Generation Panel */}
                  <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-4 space-y-3">
                    <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Generator
                    </p>
                    <Input
                      value={genContext}
                      onChange={e => setGenContext(e.target.value)}
                      placeholder="Optional context (e.g. 'focus on indie authors', 'emphasize community')"
                      className="bg-slate-900 border-white/10 text-white text-sm"
                    />
                    <Input
                      value={genTone}
                      onChange={e => setGenTone(e.target.value)}
                      placeholder="Desired tone (e.g. 'bold and inspiring', 'warm and approachable')"
                      className="bg-slate-900 border-white/10 text-white text-sm"
                    />
                    <div>
                      <p className="text-white/40 text-xs mb-2">Focus pillars (optional):</p>
                      <div className="flex flex-wrap gap-2">
                        {PILLARS.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => toggleFocus(p)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border transition-all",
                              genFocus.includes(p)
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                : "bg-slate-900 border-white/10 text-white/50 hover:text-white"
                            )}
                          >{p}</button>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating}
                      variant="outline"
                      size="sm"
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                      {generating ? "Generating..." : "Generate with AI"}
                    </Button>
                  </div>

                  <Textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    placeholder="AI-generated text will appear here, or write your own..."
                    className="bg-slate-800 border-white/10 text-white min-h-[140px] resize-none"
                  />
                  <Input
                    value={editRationale}
                    onChange={e => setEditRationale(e.target.value)}
                    placeholder="Change rationale (why are you updating this?)"
                    className="bg-slate-800 border-white/10 text-white"
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEditPublic(p => !p)}
                      className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        editPublic ? "bg-amber-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                        editPublic ? "translate-x-5" : "translate-x-0.5"
                      )} />
                    </div>
                    <span className="text-white/70 text-sm">Make publicly visible</span>
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveVersion} disabled={saving || !editText.trim()} className="bg-amber-500 hover:bg-amber-600 text-black">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                      Save & Analyze
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ) : mission ? (
              <Card className="bg-slate-900 border-white/10">
                <CardContent className="pt-6">
                  <blockquote className="text-white/90 text-lg leading-relaxed border-l-4 border-amber-500 pl-6 italic">
                    {mission.text}
                  </blockquote>
                  {mission.change_rationale && (
                    <p className="text-white/40 text-sm mt-4">
                      <span className="text-white/60 font-medium">Change rationale:</span> {mission.change_rationale}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900 border-white/10 border-dashed">
                <CardContent className="pt-6 text-center py-12">
                  <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No mission statement yet.</p>
                  <Button onClick={() => setEditing(true)} className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">
                    Create First Version
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis Panel */}
            {mission?.alignment_analysis && (
              <Card className="bg-slate-900 border-white/10">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setShowAnalysis(p => !p)}
                >
                  <CardTitle className="text-white text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> AI Alignment Analysis
                      {mission.analysis_status === "complete" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </span>
                    {showAnalysis ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                  </CardTitle>
                </CardHeader>
                {showAnalysis && (
                  <CardContent>
                    <pre className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                      {mission.alignment_analysis}
                    </pre>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        )}

        {/* ── TAB: Pillar Scores ── */}
        {tab === "scores" && (
          <div className="space-y-4">
            {!mission ? (
              <p className="text-white/40 text-center py-12">Create a mission statement first.</p>
            ) : (
              <>
                <div className="grid gap-3">
                  {scores.map(({ pillar_name, score, notes }) => (
                    <Card key={pillar_name} className="bg-slate-900 border-white/10">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="w-32 shrink-0">
                            <p className="text-white font-medium text-sm">{pillar_name}</p>
                            <p className={cn("text-2xl font-bold", scoreColor(score))}>{score}<span className="text-white/30 text-sm">/10</span></p>
                          </div>
                          <div className="flex-1 min-w-[180px] space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="range" min="0" max="10" step="1" value={score}
                                onChange={e => updateScore(pillar_name, "score", e.target.value)}
                                className="flex-1 accent-amber-400"
                              />
                              <span className="text-white/60 text-xs w-6 text-right">{score}</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                              <div className={cn("h-1.5 rounded-full transition-all", scoreBg(score))} style={{ width: `${score * 10}%` }} />
                            </div>
                          </div>
                          <Input
                            value={notes}
                            onChange={e => updateScore(pillar_name, "notes", e.target.value)}
                            placeholder="Notes..."
                            className="bg-slate-800 border-white/10 text-white text-sm w-full sm:w-56"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveScores} disabled={savingScores} className="bg-amber-500 hover:bg-amber-600 text-black">
                    {savingScores ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Save Scores & Re-Analyze
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: Version History ── */}
        {tab === "history" && (
          <div className="space-y-3">
            {versions.length === 0 ? (
              <p className="text-white/40 text-center py-12">No version history yet.</p>
            ) : versions.map(v => (
              <Card key={v.id} className={cn("border transition-all", v.is_current ? "bg-amber-500/5 border-amber-500/30" : "bg-slate-900 border-white/10")}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={v.is_current ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/5 text-white/50 border-white/10"}>
                          v{v.version_number}
                        </Badge>
                        <span className="text-white/40 text-xs">{v.publish_date}</span>
                        {v.is_public && <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Public</Badge>}
                        {v.overall_alignment_score > 0 && (
                          <span className={cn("text-xs font-semibold", scoreColor(v.overall_alignment_score))}>
                            Score: {v.overall_alignment_score}/10
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{v.text}</p>
                      {v.change_rationale && (
                        <p className="text-white/40 text-xs mt-2 italic">Rationale: {v.change_rationale}</p>
                      )}
                    </div>
                    {!v.is_current && (
                      <Button variant="outline" size="sm" onClick={() => handleRestore(v.id)}>
                        <RotateCcw className="w-3 h-3 mr-1" /> Restore
                      </Button>
                    )}
                    {v.is_current && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">Current</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}