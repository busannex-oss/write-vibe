import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save, ArrowLeft, Sparkles, Loader2, Plus, Trash2,
  GripVertical, ChevronUp, ChevronDown, Tags
} from "lucide-react";
import { cn } from "@/lib/utils";

const PILLARS = ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"];
const STATUSES = ["draft", "active", "under_review", "archived"];

const invoke = (action, extra = {}) => base44.functions.invoke("sops", { action, ...extra });

const emptyStep = (num) => ({ step_number: num, step_name: "", instruction: "", responsible_role: "" });

export default function SOPEditor({ sop, categories, onSaved, onCancel }) {
  const isEdit = !!sop;

  const [form, setForm] = useState({
    title: sop?.title || "",
    purpose: sop?.purpose || "",
    scope: sop?.scope || "",
    trigger: sop?.trigger || "",
    owner: sop?.owner || "",
    review_date: sop?.review_date || "",
    status: sop?.status || "draft",
    pillar_alignment: sop?.pillar_alignment || [],
    category_ids: sop?.category_ids || [],
    steps: sop?.steps?.length ? sop.steps : [emptyStep(1)],
    notes: sop?.notes || ""
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genContext, setGenContext] = useState("");
  const [showGenPanel, setShowGenPanel] = useState(!isEdit);
  const [dragIdx, setDragIdx] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const togglePillar = (p) => set("pillar_alignment", form.pillar_alignment.includes(p)
    ? form.pillar_alignment.filter(x => x !== p)
    : [...form.pillar_alignment, p]);

  const toggleCategory = (id) => set("category_ids", form.category_ids.includes(id)
    ? form.category_ids.filter(x => x !== id)
    : [...form.category_ids, id]);

  const addStep = () => set("steps", [...form.steps, emptyStep(form.steps.length + 1)]);

  const removeStep = (i) => {
    const updated = form.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step_number: idx + 1 }));
    set("steps", updated);
  };

  const updateStep = (i, key, val) => {
    const updated = form.steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
    set("steps", updated);
  };

  const moveStep = (i, dir) => {
    const steps = [...form.steps];
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    [steps[i], steps[j]] = [steps[j], steps[i]];
    set("steps", steps.map((s, idx) => ({ ...s, step_number: idx + 1 })));
  };

  const handleGenerate = async () => {
    if (!form.title) return;
    setGenerating(true);
    const res = await invoke("generate", {
      title: form.title,
      purpose: form.purpose,
      context: genContext,
      pillars: form.pillar_alignment
    });
    const g = res.data.generated;
    if (g) {
      setForm(f => ({
        ...f,
        purpose: g.purpose || f.purpose,
        scope: g.scope || f.scope,
        trigger: g.trigger || f.trigger,
        pillar_alignment: g.pillar_alignment?.length ? g.pillar_alignment : f.pillar_alignment,
        steps: g.steps?.length ? g.steps : f.steps,
        notes: g.notes || f.notes
      }));
    }
    setGenerating(false);
    setShowGenPanel(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const action = isEdit ? "update" : "create";
    const payload = isEdit ? { id: sop.id, ...form } : form;
    await invoke(action, payload);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCancel}><ArrowLeft className="w-4 h-4" /></Button>
            <h1 className="text-xl font-bold text-white">{isEdit ? "Edit SOP" : "New SOP"}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="bg-amber-500 hover:bg-amber-600 text-black">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save SOP
          </Button>
        </div>

        {/* AI Generator Panel */}
        <Card className="bg-slate-900 border-amber-500/20">
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowGenPanel(p => !p)}>
            <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI SOP Generator
              <span className="text-white/30 text-xs ml-auto">{showGenPanel ? "▲ collapse" : "▼ expand"}</span>
            </CardTitle>
          </CardHeader>
          {showGenPanel && (
            <CardContent className="space-y-3 pt-0">
              <p className="text-white/40 text-xs">Enter a title above, then generate the full SOP content with AI.</p>
              <Textarea
                value={genContext}
                onChange={e => setGenContext(e.target.value)}
                placeholder="Optional: describe the process, context, or specific requirements..."
                className="bg-slate-800 border-white/10 text-white text-sm resize-none h-20"
              />
              <Button
                onClick={handleGenerate}
                disabled={generating || !form.title.trim()}
                variant="outline"
                size="sm"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                {generating ? "Generating..." : "Generate with AI"}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Core Fields */}
        <Card className="bg-slate-900 border-white/10">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-white/60 text-xs mb-1 block">Title *</label>
                <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="SOP Title" className="bg-slate-800 border-white/10 text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-white/60 text-xs mb-1 block">Purpose</label>
                <Textarea value={form.purpose} onChange={e => set("purpose", e.target.value)} placeholder="Why does this SOP exist?" className="bg-slate-800 border-white/10 text-white resize-none h-20" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-white/60 text-xs mb-1 block">Scope</label>
                <Textarea value={form.scope} onChange={e => set("scope", e.target.value)} placeholder="What does this SOP cover?" className="bg-slate-800 border-white/10 text-white resize-none h-16" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Trigger</label>
                <Input value={form.trigger} onChange={e => set("trigger", e.target.value)} placeholder="What triggers this SOP?" className="bg-slate-800 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Owner (email)</label>
                <Input value={form.owner} onChange={e => set("owner", e.target.value)} placeholder="owner@writevibe.com" className="bg-slate-800 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Review Date</label>
                <Input type="date" value={form.review_date} onChange={e => set("review_date", e.target.value)} className="bg-slate-800 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-md px-3 py-2 text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Pillars */}
            <div>
              <label className="text-white/60 text-xs mb-2 block">Pillar Alignment</label>
              <div className="flex flex-wrap gap-2">
                {PILLARS.map(p => (
                  <button key={p} type="button" onClick={() => togglePillar(p)}
                    className={cn("text-xs px-3 py-1 rounded-full border transition-all",
                      form.pillar_alignment.includes(p)
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : "bg-slate-800 border-white/10 text-white/40 hover:text-white"
                    )}>{p}</button>
                ))}
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <label className="text-white/60 text-xs mb-2 block">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                      className={cn("text-xs px-3 py-1 rounded-full border transition-all",
                        form.category_ids.includes(c.id)
                          ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                          : "bg-slate-800 border-white/10 text-white/40 hover:text-white"
                      )}><Tags className="w-2.5 h-2.5 inline mr-1" />{c.name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">Notes</label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any exceptions or important notes..." className="bg-slate-800 border-white/10 text-white resize-none h-16" />
            </div>
          </CardContent>
        </Card>

        {/* Steps Builder */}
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              Steps ({form.steps.length})
              <Button size="sm" variant="outline" onClick={addStep}>
                <Plus className="w-3 h-3 mr-1" /> Add Step
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.steps.map((step, i) => (
              <div key={i} className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-white/20 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveStep(i, 1)} disabled={i === form.steps.length - 1} className="text-white/20 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    value={step.step_name}
                    onChange={e => updateStep(i, "step_name", e.target.value)}
                    placeholder="Step name"
                    className="bg-slate-900 border-white/10 text-white text-sm flex-1"
                  />
                  <Input
                    value={step.responsible_role}
                    onChange={e => updateStep(i, "responsible_role", e.target.value)}
                    placeholder="Role"
                    className="bg-slate-900 border-white/10 text-white text-sm w-36"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeStep(i)} className="text-white/30 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Textarea
                  value={step.instruction}
                  onChange={e => updateStep(i, "instruction", e.target.value)}
                  placeholder="Detailed instruction for this step..."
                  className="bg-slate-900 border-white/10 text-white text-sm resize-none h-20 ml-9"
                />
              </div>
            ))}
            <Button variant="outline" onClick={addStep} className="w-full border-dashed border-white/10 text-white/40 hover:text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}