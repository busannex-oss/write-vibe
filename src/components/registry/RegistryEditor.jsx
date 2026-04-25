import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  "Active": "bg-green-500/20 text-green-400 border-green-500/30",
  "In Development": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Planned": "bg-slate-500/20 text-slate-400 border-slate-500/30"
};

export default function RegistryEditor({ initialHtml, onSave, onCancel, elements, onElementRegenerate, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("visual"); // visual | elements
  const [regenStatus, setRegenStatus] = useState({});
  const [localElements, setLocalElements] = useState(elements || []);
  const [expandedEl, setExpandedEl] = useState(null);
  const editorRef = useRef(null);

  // Sync content ref for auto-save
  useEffect(() => {
    if (editorContentRef) editorContentRef.current = html;
  }, [html]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleRegenElement = async (el) => {
    setRegenStatus(s => ({ ...s, [el.id]: true }));
    const updated = await onElementRegenerate(el);
    setLocalElements(prev => prev.map(e => e.id === el.id ? { ...e, ...updated } : e));
    setRegenStatus(s => ({ ...s, [el.id]: false }));
  };

  const categories = [...new Set(localElements.map(e => e.category))];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Editor Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCancel}><ArrowLeft className="w-4 h-4" /></Button>
            <h1 className="text-white font-bold">Edit Registry</h1>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
              {["visual", "elements"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={cn("px-3 py-1 rounded-md text-sm transition-all capitalize",
                    activeTab === t ? "bg-amber-500 text-black font-semibold" : "text-white/50 hover:text-white"
                  )}>{t === "visual" ? "HTML Editor" : "Elements"}</button>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save & Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "visual" ? (
          <div className="space-y-3">
            <p className="text-white/40 text-sm">Edit the registry HTML directly. Changes auto-save every 60 seconds.</p>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              className="w-full h-[70vh] bg-slate-900 border border-white/10 rounded-xl p-4 text-white/70 text-xs font-mono resize-none focus:outline-none focus:border-amber-500/40"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-white/40 text-sm">Regenerate individual elements with AI, then save to apply changes.</p>
            {categories.map(cat => (
              <div key={cat}>
                <h3 className="text-white/60 text-xs uppercase tracking-widest mb-3">{cat}s</h3>
                <div className="space-y-3">
                  {localElements.filter(e => e.category === cat).map(el => (
                    <Card key={el.id} className="bg-slate-900 border-white/10">
                      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedEl(expandedEl === el.id ? null : el.id)}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium text-sm">{el.name}</span>
                            <Badge className={cn("text-xs border", STATUS_COLORS[el.status] || "bg-slate-500/20 text-slate-400 border-slate-500/30")}>
                              {el.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm" variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleRegenElement(el); }}
                              disabled={regenStatus[el.id]}
                              className="border-amber-500/20 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/40"
                            >
                              {regenStatus[el.id]
                                ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                : <Sparkles className="w-3 h-3 mr-1" />}
                              {regenStatus[el.id] ? "Regenerating..." : "Regenerate"}
                            </Button>
                            {expandedEl === el.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                          </div>
                        </div>
                      </CardHeader>
                      {expandedEl === el.id && (
                        <CardContent className="pt-0 space-y-2">
                          {el.pillar_alignment?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {el.pillar_alignment.map(p => (
                                <span key={p} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400/70 px-2 py-0.5 rounded-full">{p}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-white/60 text-sm">{el.purpose}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><span className="text-white/30">Inputs:</span> <span className="text-white/50">{el.inputs}</span></div>
                            <div><span className="text-white/30">Outputs:</span> <span className="text-white/50">{el.outputs}</span></div>
                          </div>
                          {el.strategic_value && (
                            <p className="text-amber-400/70 text-xs italic border-l-2 border-amber-500/30 pl-3">{el.strategic_value}</p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}