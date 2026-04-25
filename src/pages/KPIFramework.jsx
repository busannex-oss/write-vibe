import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Loader2, Sparkles, Edit3, Download, History,
  CheckCircle2, BarChart2, ArrowLeft, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactQuill from "react-quill";

const invoke = (action, extra = {}) => base44.functions.invoke("kpiFramework", { action, ...extra });

const PILLARS = [
  "Authentic Voice", "Professional Quality", "Accessible Empowerment",
  "Ethical AI", "Community & Legacy", "Innovation Leadership",
  "Sustainable Business", "Brand Integrity"
];

// ── VERSION HISTORY ───────────────────────────────────────────────────────────
function VersionHistory({ onBack, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    invoke("versions").then(r => {
      setVersions(r.data.versions || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Document
          </Button>
          <h1 className="text-white font-bold text-lg">Version History — KPI Framework</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
        ) : versions.length === 0 ? (
          <p className="text-white/30 text-center py-20">No versions yet. Generate the document to create the first version.</p>
        ) : (
          <div className="space-y-3">
            {versions.map(v => (
              <div key={v.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-xs font-bold">v{v.version_number}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">Version {v.version_number}</span>
                      {v.is_current && (
                        <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Current
                        </span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">
                      {v.generated_at ? new Date(v.generated_at).toLocaleString() : 'Unknown date'}
                      {v.generation_notes && ` · ${v.generation_notes}`}
                    </p>
                  </div>
                </div>
                {!v.is_current && (
                  <Button variant="outline" size="sm" disabled={restoring === v.id}
                    onClick={async () => { setRestoring(v.id); await onRestore(v.id); setRestoring(null); }}>
                    {restoring === v.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                    Restore
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RICH TEXT EDITOR ──────────────────────────────────────────────────────────
function DocEditor({ initialHtml, onSave, onCancel, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [regenPillar, setRegenPillar] = useState(null);

  const handleChange = (val) => {
    setHtml(val);
    if (editorContentRef) editorContentRef.current = val;
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleRegenPillar = async (pillar) => {
    setRegenPillar(pillar);
    await invoke("regenerate_pillar", { pillar_name: pillar });
    setRegenPillar(null);
    alert(`"${pillar}" pillar KPIs regenerated. Save current edits then use "Regenerate with AI" to embed into the full document.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/25 text-xs hidden md:block shrink-0">Regenerate pillar:</span>
            {PILLARS.map(pillar => (
              <Button key={pillar} variant="outline" size="sm" className="text-xs h-7 px-2"
                onClick={() => handleRegenPillar(pillar)} disabled={regenPillar === pillar}>
                {regenPillar === pillar
                  ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  : <RefreshCw className="w-3 h-3 mr-1" />}
                <span className="hidden sm:inline">{pillar.split(' ')[0]}</span>
                <span className="sm:hidden">{pillar.substring(0, 5)}</span>
              </Button>
            ))}
            <Button onClick={handleSave} disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-8 shrink-0" size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <ReactQuill theme="snow" value={html} onChange={handleChange}
            className="bg-white text-slate-900 rounded-xl" style={{ minHeight: "600px" }} />
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function KPIFrameworkPage() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [view, setView] = useState("document");
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveRef = useRef(null);
  const editorContentRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const res = await invoke("get_current");
    setDoc(res.data.doc || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s in editor
  useEffect(() => {
    if (view !== "editor") { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", { content_html: editorContentRef.current });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress("Pulling platform data — revenue model, strategic goals, pillar definitions...");
    await new Promise(r => setTimeout(r, 600));
    setGenProgress("Generating 8-pillar KPI framework with investor-grade metrics (~45s)...");
    const res = await invoke("generate");
    setDoc(res.data.doc);
    setLastSaved(new Date());
    setGenerating(false);
    setGenProgress("");
  };

  const handleEditorSave = async (html) => {
    await invoke("save", { content_html: html });
    setDoc(prev => ({ ...prev, content_html: html }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestore = async (id) => {
    const res = await invoke("restore", { id });
    setDoc(res.data.doc);
    setView("document");
  };

  const handleExportPDF = () => {
    if (!doc?.content_html) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>The Write Vibe — KPI & Success Metrics Framework</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { margin: 0; padding: 0; background: #fff; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 12px; border: 1px solid #e2e8f0; }
        td { padding: 8px 12px; font-size: 13px; border: 1px solid #e2e8f0; vertical-align: top; }
        h2 { page-break-after: avoid; } h3 { page-break-after: avoid; }
        p { orphans: 3; widows: 3; } ul, ol { padding-left: 20px; } li { margin-bottom: 5px; }
      </style>
    </head><body>${doc.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  // ── SUB-VIEWS ──────────────────────────────────────────────────────────────
  if (view === "history") return <VersionHistory onBack={() => setView("document")} onRestore={handleRestore} />;
  if (view === "editor" && doc) return (
    <DocEditor initialHtml={doc.content_html} onSave={handleEditorSave}
      onCancel={() => setView("document")} editorContentRef={editorContentRef} />
  );

  // ── MAIN VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">

      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">KPI &amp; Success Metrics Framework</h1>
              <p className="text-white/30 text-xs">
                {doc ? `v${doc.version_number} · 8 pillars` : 'No document yet'}
                {autoSaving && <span className="ml-2 text-amber-400"><Loader2 className="w-2.5 h-2.5 inline animate-spin mr-1" />Saving...</span>}
                {lastSaved && !autoSaving && <span className="ml-2 text-green-400/60"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />Saved</span>}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setView("history")}>
              <History className="w-4 h-4 mr-1" /> Version History
            </Button>
            {doc && (
              <>
                <Button variant="outline" size="sm" onClick={() => setView("editor")}>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </>
            )}
            <Button onClick={handleGenerate} disabled={generating}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" size="sm">
              {generating
                ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                : <Sparkles className="w-4 h-4 mr-1" />}
              {generating ? "Generating..." : doc ? "Regenerate with AI" : "Generate with AI"}
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : generating ? (
          <div className="flex flex-col items-center justify-center py-40 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <BarChart2 className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">Generating KPI Framework</p>
              <p className="text-white/50 text-sm max-w-sm">{genProgress}</p>
              <p className="text-white/25 text-xs mt-1">8 pillars · 3–5 KPIs each · weighted performance model · priority areas</p>
            </div>
            {/* Pillar progress indicators */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {["Authentic Voice","Professional Quality","Accessible Empowerment","Ethical AI","Community & Legacy","Innovation Leadership","Sustainable Business","Brand Integrity"].map((p, i) => (
                <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/30 border border-white/8 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}>
                  {p.split(' ')[0]}
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          </div>
        ) : !doc ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <BarChart2 className="w-12 h-12 text-amber-400" />
            </div>
            <div className="max-w-xl">
              <h2 className="text-white text-2xl font-bold mb-3">KPI &amp; Success Metrics Framework</h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Generate a complete, investor-grade performance framework covering all 8 brand pillars. Each pillar gets 3–5 KPIs with baselines, targets, warning thresholds, and strategic significance — plus a weighted composite scoring model, current platform assessment, and top priority improvement areas.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left max-w-3xl w-full">
              {[
                { label: "8 Pillars Measured", desc: "Complete KPI coverage across all brand pillars" },
                { label: "3–5 KPIs per Pillar", desc: "Specific, measurable, self-publishing-context metrics" },
                { label: "Investor-Grade Language", desc: "Baseline, target, warning threshold & strategic significance" },
                { label: "Performance Model", desc: "Weighted composite score + priority improvement areas" }
              ].map(item => (
                <div key={item.label} className="bg-slate-900 border border-white/8 rounded-xl p-4">
                  <p className="text-amber-400 font-semibold text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleGenerate}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 text-base h-11">
              <Sparkles className="w-5 h-5 mr-2" /> Generate KPI Framework
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <style>{`
              .kpi-doc table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
              .kpi-doc th { background: #f8fafc; padding: 10px 14px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border: 1px solid #e2e8f0; }
              .kpi-doc td { padding: 10px 14px; border: 1px solid #e2e8f0; color: #374151; vertical-align: top; line-height: 1.6; }
              .kpi-doc tr:nth-child(even) td { background: #f8fafc; }
              .kpi-doc h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 8px; }
              .kpi-doc p { margin: 0 0 10px; }
              .kpi-doc ul, .kpi-doc ol { padding-left: 20px; margin: 8px 0; }
              .kpi-doc li { margin-bottom: 5px; }
              .kpi-doc strong { color: #0f172a; }
            `}</style>
            <div className="kpi-doc" dangerouslySetInnerHTML={{ __html: doc.content_html }} />
          </div>
        )}
      </div>
    </div>
  );
}