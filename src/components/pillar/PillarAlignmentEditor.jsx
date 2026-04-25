import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PillarAlignmentEditor({ initialHtml, pillarData, onSave, onCancel, onPillarRegenerate, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("html"); // html | pillars
  const [regenStatus, setRegenStatus] = useState({});
  const [pillars, setPillars] = useState(pillarData || []);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (editorContentRef) editorContentRef.current = html;
  }, [html]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleRegen = async (pillar) => {
    setRegenStatus(s => ({ ...s, [pillar.pillar]: true }));
    const updated = await onPillarRegenerate(pillar);
    setPillars(prev => prev.map(p => p.pillar === pillar.pillar ? { ...p, ...updated } : p));
    setRegenStatus(s => ({ ...s, [pillar.pillar]: false }));
  };

  const scoreColor = (s) => s >= 8 ? 'text-green-400' : s >= 6 ? 'text-amber-400' : 'text-orange-400';

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCancel}><ArrowLeft className="w-4 h-4" /></Button>
            <h1 className="text-white font-bold">Edit Pillar Alignment Report</h1>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
              {[["html", "HTML Editor"], ["pillars", "Pillar Cards"]].map(([t, label]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={cn("px-3 py-1 rounded-md text-sm transition-all",
                    activeTab === t ? "bg-amber-500 text-black font-semibold" : "text-white/50 hover:text-white"
                  )}>{label}</button>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save & Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "html" ? (
          <div className="space-y-3">
            <p className="text-white/40 text-sm font-sans">Edit the report HTML directly. Auto-saves every 60 seconds.</p>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              className="w-full h-[70vh] bg-slate-900 border border-white/10 rounded-xl p-4 text-white/70 text-xs font-mono resize-none focus:outline-none focus:border-amber-500/40"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/40 text-sm font-sans">Regenerate individual pillars with AI, then save to apply.</p>
            {pillars.map(p => (
              <Card key={p.pillar} className="bg-slate-900 border-white/10" style={{ borderTopColor: p.color, borderTopWidth: 3 }}>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === p.pillar ? null : p.pillar)}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{p.pillar}</span>
                      <span className={cn("font-bold text-sm", scoreColor(p.alignment_score))}>{p.alignment_score}/10</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button size="sm" variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleRegen(p); }}
                        disabled={regenStatus[p.pillar]}
                        className="border-amber-500/20 text-amber-400/70 hover:text-amber-400"
                      >
                        {regenStatus[p.pillar] ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                        {regenStatus[p.pillar] ? "Regenerating..." : "Regenerate"}
                      </Button>
                      {expanded === p.pillar ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </div>
                  </div>
                </CardHeader>
                {expanded === p.pillar && (
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-white/60 text-sm italic">{p.definition}</p>
                    <div className="flex flex-wrap gap-2">
                      {(p.platform_elements || []).map(el => (
                        <span key={el} className="text-xs px-2 py-1 rounded-full font-sans" style={{ background: `${p.color}18`, border: `1px solid ${p.color}40`, color: p.color }}>{el}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
                        <p className="text-red-400 uppercase tracking-wider mb-1 font-sans">Gaps</p>
                        <p className="text-white/50">{p.gaps}</p>
                      </div>
                      <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
                        <p className="text-green-400 uppercase tracking-wider mb-1 font-sans">Roadmap</p>
                        <p className="text-white/50">{p.roadmap}</p>
                      </div>
                    </div>
                    <p className="text-amber-400/70 text-xs italic border-l-2 border-amber-500/30 pl-3 font-sans">{p.investor_insight}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}