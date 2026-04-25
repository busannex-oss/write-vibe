import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, X, ArrowLeft, CheckCircle2, Plus, ChevronDown, ChevronUp,
  FileText, Layers, Tag, User, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const PILLARS = ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"];

const invoke = (action, extra = {}) => base44.functions.invoke("sops", { action, ...extra });

function SOPPreviewCard({ sop, index, categories, onSave, onDiscard, saving }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave(sop, index);
    setSaved(true);
  };

  return (
    <div className={cn(
      "bg-slate-900 border rounded-xl transition-all",
      saved ? "border-green-500/30 opacity-60" : "border-white/10 hover:border-amber-500/20"
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-white font-semibold text-sm">{sop.title}</h3>
              {saved && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs border">Saved</Badge>}
            </div>
            <p className="text-white/50 text-xs line-clamp-2 mb-2">{sop.purpose}</p>
            <div className="flex flex-wrap gap-1.5">
              {(sop.pillar_alignment || []).map(p => (
                <span key={p} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400/70 px-2 py-0.5 rounded-full">{p}</span>
              ))}
              <span className="text-xs bg-slate-800 border border-white/10 text-white/40 px-2 py-0.5 rounded-full">
                {(sop.steps || []).length} steps
              </span>
              {sop.trigger && (
                <span className="text-xs bg-slate-800 border border-white/10 text-white/40 px-2 py-0.5 rounded-full">
                  Trigger: {sop.trigger.slice(0, 40)}{sop.trigger.length > 40 ? '…' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {!saved && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving === index}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-7 px-3"
              >
                {saving === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Detail */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/6 space-y-4">
            {sop.scope && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Scope</p>
                <p className="text-white/60 text-sm">{sop.scope}</p>
              </div>
            )}
            {sop.steps?.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Steps</p>
                <div className="space-y-2">
                  {sop.steps.map(step => (
                    <div key={step.step_number} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step.step_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold">{step.step_name}
                          {step.responsible_role && (
                            <span className="text-white/30 font-normal ml-2">· {step.responsible_role}</span>
                          )}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5">{step.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sop.notes && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Notes</p>
                <p className="text-white/50 text-xs">{sop.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SOPGenerator({ categories, onBack, onSopsSaved }) {
  const [docInput, setDocInput] = useState("");
  const [docType, setDocType] = useState("project_brief");
  const [owner, setOwner] = useState("");
  const [reviewMonths, setReviewMonths] = useState("6");
  const [selectedPillars, setSelectedPillars] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [generatedSOPs, setGeneratedSOPs] = useState([]);
  const [saving, setSaving] = useState(null); // index being saved
  const [allSaved, setAllSaved] = useState(false);

  const togglePillar = (p) => setSelectedPillars(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  );

  const handleGenerate = async () => {
    if (!docInput.trim()) return;
    setGenerating(true);
    setGeneratedSOPs([]);
    setAllSaved(false);
    setGenProgress("Analyzing project documentation...");
    await new Promise(r => setTimeout(r, 400));
    setGenProgress("Identifying SOP opportunities across pillars...");
    const res = await invoke("generate_from_doc", {
      document: docInput,
      doc_type: docType,
      pillars: selectedPillars,
      owner,
      review_months: parseInt(reviewMonths) || 6
    });
    setGenerating(false);
    setGenProgress("");
    setGeneratedSOPs(res.data.sops || []);
  };

  const handleSaveOne = async (sop, index) => {
    setSaving(index);
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + (parseInt(reviewMonths) || 6));
    await invoke("create", {
      ...sop,
      owner: owner || sop.owner,
      status: "draft",
      version: 1,
      review_date: reviewDate.toISOString().split('T')[0],
      category_ids: []
    });
    setSaving(null);
    onSopsSaved?.();
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < generatedSOPs.length; i++) {
      await handleSaveOne(generatedSOPs[i], i);
    }
    setAllSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to SOPs
          </Button>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI SOP Generator</h1>
            <p className="text-white/40 text-sm mt-1">
              Paste project documentation and AI will generate structured, pillar-aligned SOPs ready for your library.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Document Type */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 text-white/80 rounded-lg px-3 py-2.5 text-sm"
              >
                <option value="project_brief">Project Brief</option>
                <option value="product_spec">Product Specification</option>
                <option value="process_doc">Process Documentation</option>
                <option value="meeting_notes">Meeting Notes / Action Items</option>
                <option value="onboarding_doc">Onboarding Documentation</option>
                <option value="workflow_desc">Workflow Description</option>
                <option value="policy_doc">Policy Document</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Document Input */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                Project Documentation <span className="text-amber-400/60 normal-case ml-1">(paste your content here)</span>
              </label>
              <textarea
                value={docInput}
                onChange={e => setDocInput(e.target.value)}
                placeholder={`Paste your project brief, process notes, meeting minutes, product specs, or any documentation here...\n\nExample:\n"Our onboarding process involves three stages: account creation, book project setup, and first AI generation. Authors need to upload a photo, set their genre preferences, and configure their writing style profile before the AI tools become available..."`}
                className="w-full bg-slate-900 border border-white/10 text-white/80 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-amber-500/40 placeholder:text-white/20"
                rows={12}
              />
              <p className="text-white/20 text-xs mt-1">{docInput.length} characters</p>
            </div>
          </div>

          {/* Config Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Owner */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Default Owner Email
              </label>
              <Input
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="owner@thewritevibe.com"
                className="bg-slate-900 border-white/10 text-white"
              />
            </div>

            {/* Review cycle */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Review Cycle
              </label>
              <select
                value={reviewMonths}
                onChange={e => setReviewMonths(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 text-white/80 rounded-lg px-3 py-2.5 text-sm"
              >
                <option value="3">Every 3 months</option>
                <option value="6">Every 6 months</option>
                <option value="12">Every 12 months</option>
              </select>
            </div>

            {/* Pillar Focus */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Pillar Focus <span className="normal-case text-white/20 ml-1">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PILLARS.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePillar(p)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      selectedPillars.includes(p)
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-white/3 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {selectedPillars.length > 0 && (
                <button onClick={() => setSelectedPillars([])} className="text-white/20 text-xs mt-2 hover:text-white/40">
                  Clear selection
                </button>
              )}
            </div>

            {/* What to expect */}
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-2">
              <p className="text-white/40 text-xs uppercase tracking-wider">What AI will generate</p>
              {[
                "Multiple pillar-aligned SOPs",
                "Purpose, scope & trigger per SOP",
                "4–8 actionable steps each",
                "Responsible roles per step",
                "Operational notes"
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-white/50 text-xs">{item}</span>
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !docInput.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate SOPs from Doc</>
              )}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {generating && genProgress && (
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <p className="text-amber-300/80 text-sm">{genProgress}</p>
          </div>
        )}

        {/* Results */}
        {generatedSOPs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">
                  Generated SOPs
                  <span className="text-amber-400 ml-2">({generatedSOPs.length})</span>
                </h2>
                <p className="text-white/30 text-xs mt-0.5">Review each SOP and save individually, or save all at once</p>
              </div>
              {!allSaved && (
                <Button
                  onClick={handleSaveAll}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Layers className="w-4 h-4 mr-1" /> Save All to Library
                </Button>
              )}
              {allSaved && (
                <div className="flex items-center gap-1.5 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> All saved
                </div>
              )}
            </div>

            <div className="space-y-3">
              {generatedSOPs.map((sop, i) => (
                <SOPPreviewCard
                  key={i}
                  sop={sop}
                  index={i}
                  categories={categories}
                  onSave={handleSaveOne}
                  saving={saving}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}