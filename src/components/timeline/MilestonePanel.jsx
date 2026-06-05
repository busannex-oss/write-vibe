import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, MessageSquare, Star, Trash2, CheckCircle2, Loader2, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "introduction", label: "Introduction" },
  { value: "growth", label: "Growth" },
  { value: "conflict", label: "Conflict" },
  { value: "revelation", label: "Revelation" },
  { value: "transformation", label: "Transformation" },
  { value: "resolution", label: "Resolution" },
  { value: "arc_peak", label: "Arc Peak" },
  { value: "advisory_review", label: "Advisory Review" },
];

const ADVISORS = [
  { id: "advisory_toni_morrison", name: "Toni Morrison" },
  { id: "advisory_jk_rowling", name: "J.K. Rowling" },
  { id: "advisory_shonda_rhimes", name: "Shonda Rhimes" },
  { id: "advisory_tyler_perry", name: "Tyler Perry" },
  { id: "advisory_thurgood_marshall", name: "Thurgood Marshall" },
  { id: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison" },
];

const TYPE_COLORS = {
  introduction: "#3b82f6", growth: "#10b981", conflict: "#ef4444",
  revelation: "#a855f7", transformation: "#f59e0b", resolution: "#14b8a6",
  arc_peak: "#f97316", advisory_review: "#6366f1",
};

export default function MilestonePanel({ milestone, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(milestone || {});
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newNote, setNewNote] = useState({ advisor_id: "", advisor_name: "", note: "", rating: 4 });
  const [addingNote, setAddingNote] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isNew = !milestone?.id;

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const generateAISuggestion = async () => {
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest a compelling character development milestone for character "${form.character_name}" at chapter ${form.chapter_number}. Milestone type: ${form.milestone_type}. Provide a punchy title (under 8 words), a 1-sentence description, and an emotional state for the character.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          emotional_state: { type: "string" }
        }
      }
    });
    if (res?.title) setForm(p => ({ ...p, title: res.title, description: res.description || p.description, emotional_state: res.emotional_state || p.emotional_state }));
    setAiLoading(false);
  };

  const addNote = () => {
    if (!newNote.advisor_id || !newNote.note) return;
    const advisor = ADVISORS.find(a => a.id === newNote.advisor_id);
    const notes = [...(form.advisor_notes || []), { ...newNote, advisor_name: advisor?.name || newNote.advisor_id }];
    set("advisor_notes", notes);
    setNewNote({ advisor_id: "", advisor_name: "", note: "", rating: 4 });
    setAddingNote(false);
  };

  const removeNote = (idx) => set("advisor_notes", (form.advisor_notes || []).filter((_, i) => i !== idx));

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-white/10 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: TYPE_COLORS[form.milestone_type] || "#f59e0b" }} />
          <h3 className="text-white font-semibold text-sm">{isNew ? "New Milestone" : "Edit Milestone"}</h3>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-5 space-y-4">
        {/* Character + Chapter */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-white/50 text-xs mb-1 block">Character</Label>
            <Input value={form.character_name || ""} onChange={e => set("character_name", e.target.value)}
              placeholder="Character name" className="bg-white/5 border-white/15 text-white text-sm" />
          </div>
          <div>
            <Label className="text-white/50 text-xs mb-1 block">Chapter #</Label>
            <Input type="number" value={form.chapter_number || ""} onChange={e => set("chapter_number", parseInt(e.target.value))}
              placeholder="1" className="bg-white/5 border-white/15 text-white text-sm" min={1} />
          </div>
        </div>

        {/* Type */}
        <div>
          <Label className="text-white/50 text-xs mb-1 block">Milestone Type</Label>
          <select value={form.milestone_type || "growth"} onChange={e => set("milestone_type", e.target.value)}
            className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/15 text-white text-sm">
            {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Title with AI */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-white/50 text-xs">Title</Label>
            <button onClick={generateAISuggestion} disabled={aiLoading || !form.character_name}
              className="text-amber-400/70 hover:text-amber-400 text-xs flex items-center gap-1 transition-colors disabled:opacity-40">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI Suggest
            </button>
          </div>
          <Input value={form.title || ""} onChange={e => set("title", e.target.value)}
            placeholder="Milestone title..." className="bg-white/5 border-white/15 text-white text-sm" />
        </div>

        {/* Description */}
        <div>
          <Label className="text-white/50 text-xs mb-1 block">Description</Label>
          <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3}
            placeholder="What happens at this milestone..."
            className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white text-sm rounded-md resize-none placeholder:text-white/25" />
        </div>

        {/* Emotional State */}
        <div>
          <Label className="text-white/50 text-xs mb-1 block">Emotional State</Label>
          <Input value={form.emotional_state || ""} onChange={e => set("emotional_state", e.target.value)}
            placeholder="e.g. Shattered but determined" className="bg-white/5 border-white/15 text-white text-sm" />
        </div>

        {/* Completed toggle */}
        <div className="flex items-center gap-3">
          <button onClick={() => set("completed", !form.completed)}
            className={cn("w-9 h-5 rounded-full transition-all relative shrink-0",
              form.completed ? "bg-emerald-500" : "bg-white/15")}>
            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow",
              form.completed ? "left-4" : "left-0.5")} />
          </button>
          <span className="text-white/60 text-sm">Mark as completed</span>
        </div>

        {/* Advisor Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-white/50 text-xs">Advisory Board Notes</Label>
            <button onClick={() => setAddingNote(true)}
              className="text-indigo-400/70 hover:text-indigo-400 text-xs flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add Note
            </button>
          </div>

          {addingNote && (
            <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-lg p-3 space-y-2 mb-3">
              <select value={newNote.advisor_id} onChange={e => setNewNote(p => ({ ...p, advisor_id: e.target.value }))}
                className="w-full h-8 px-2 rounded-md bg-white/5 border border-white/15 text-white text-xs">
                <option value="">Select advisor...</option>
                {ADVISORS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <textarea value={newNote.note} onChange={e => setNewNote(p => ({ ...p, note: e.target.value }))} rows={2}
                placeholder="Advisor's feedback on this milestone..."
                className="w-full px-2 py-1.5 bg-white/5 border border-white/15 text-white text-xs rounded resize-none placeholder:text-white/25" />
              <div className="flex items-center gap-2">
                <Label className="text-white/40 text-xs">Rating:</Label>
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setNewNote(p => ({ ...p, rating: r }))}
                    className={cn("transition-colors", newNote.rating >= r ? "text-amber-400" : "text-white/20")}>
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addNote} className="h-7 text-xs bg-indigo-500 hover:bg-indigo-600 text-white">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingNote(false)} className="h-7 text-xs text-white/50">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(form.advisor_notes || []).map((note, i) => (
              <div key={i} className="bg-white/4 border border-white/8 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-indigo-400 text-xs font-medium">{note.advisor_name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(r => (
                        <Star key={r} className={cn("w-3 h-3", note.rating >= r ? "text-amber-400 fill-current" : "text-white/20")} />
                      ))}
                    </div>
                    <button onClick={() => removeNote(i)} className="text-white/20 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 p-4 flex gap-2 sticky bottom-0 bg-slate-900">
        <Button onClick={handleSave} disabled={saving || !form.character_name || !form.title || !form.chapter_number}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold h-9 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
          {isNew ? "Add Milestone" : "Save Changes"}
        </Button>
        {!isNew && (
          <Button variant="ghost" size="icon" onClick={() => onDelete(milestone.id)}
            className="h-9 w-9 text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}