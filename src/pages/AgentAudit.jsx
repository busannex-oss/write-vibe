import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Loader2, Sparkles, Edit3, Download, History,
  CheckCircle2, Bot, Play, ArrowLeft
} from "lucide-react";
import AuditDashboard from "@/components/agentaudit/AuditDashboard";
import AuditVersionHistory from "@/components/agentaudit/AuditVersionHistory";
import AuditEditor from "@/components/agentaudit/AuditEditor";
import InlineRecommendations from "@/components/InlineRecommendations";

const invoke = (action, extra = {}) => base44.functions.invoke("agentAudit", { action, ...extra });

export default function AgentAuditPage() {
  const [doc, setDoc] = useState(null);
  const [manifest, setManifest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [view, setView] = useState("document"); // document | editor | history
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveRef = useRef(null);
  const editorContentRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const res = await invoke("get_current");
    setDoc(res.data.doc || null);
    setManifest(res.data.manifest || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s while editing
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

  const handleGenerate = async (isAudit = false) => {
    setGenerating(true);
    setGenProgress(isAudit
      ? "Running full agent scan — pulling logs, automation status, pillar map..."
      : "Pulling agent manifest, pillar alignment, error logs..."
    );
    await new Promise(r => setTimeout(r, 600));
    setGenProgress("Generating full audit report (~45s)...");
    const res = await invoke(isAudit ? "run_audit" : "generate");
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
      <title>The Write Vibe — AI Agent Audit</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { margin:0; padding:0; background:#fff; }
        table { width:100%; border-collapse:collapse; margin:16px 0; }
        th { background:#f8fafc; text-align:left; padding:8px 12px; font-size:11px; font-weight:600; border:1px solid #e2e8f0; text-transform:uppercase; letter-spacing:.5px; color:#475569; }
        td { padding:8px 12px; font-size:13px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.6; }
        tr:nth-child(even) td { background:#f8fafc; }
        h2,h3,h4 { page-break-after:avoid; }
        p { orphans:3; widows:3; } ul { padding-left:20px; } li { margin-bottom:5px; }
      </style>
    </head><body>${doc.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  // ── SUB-VIEWS ──────────────────────────────────────────────────────────────
  if (view === "history") return (
    <AuditVersionHistory onBack={() => setView("document")} onRestore={handleRestore} />
  );
  if (view === "editor" && doc) return (
    <AuditEditor initialHtml={doc.content_html} onSave={handleEditorSave}
      onCancel={() => setView("document")} editorContentRef={editorContentRef} />
  );

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">AI Agent Audit & Alignment</h1>
              <p className="text-white/30 text-xs">
                {doc
                  ? `v${doc.version_number} · ${manifest.length} agents · ${doc.risk_analysis?.health_score || '—'}/100 health`
                  : `${manifest.length} agents registered · no audit yet`}
                {autoSaving && <span className="ml-2 text-amber-400"><Loader2 className="w-2.5 h-2.5 inline animate-spin mr-1" />Saving...</span>}
                {lastSaved && !autoSaving && <span className="ml-2 text-green-400/60"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />Saved</span>}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Run Full Audit Now */}
            <Button variant="outline" size="sm" onClick={() => handleGenerate(true)} disabled={generating}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              Run Full Audit
            </Button>
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
            <Button onClick={() => handleGenerate(false)} disabled={generating}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" size="sm">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              {generating ? "Generating..." : doc ? "Regenerate with AI" : "Generate with AI"}
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <InlineRecommendations
          context="AI Agent Audit & Alignment"
          contextData={{ totalAgents: manifest.length, healthScore: doc?.risk_analysis?.health_score, hasAudit: !!doc, agentNames: manifest.map(a => a.name).join(', ') }}
          storageKey="recs_agent_audit"
        />
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : generating ? (
          <div className="flex flex-col items-center justify-center py-40 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bot className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">Running AI Agent Audit</p>
              <p className="text-white/50 text-sm max-w-sm">{genProgress}</p>
              <p className="text-white/25 text-xs mt-1">audit summary · diagnostics · management · alignment · health score</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {manifest.map((a, i) => (
                <span key={a.name} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/30 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  {a.name.split(' ')[0]}
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Live monitoring dashboard always shown */}
            <AuditDashboard doc={doc} manifest={manifest} />

            {!doc ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Bot className="w-12 h-12 text-amber-400" />
                </div>
                <div className="max-w-xl">
                  <h2 className="text-white text-2xl font-bold mb-3">AI Agent Audit & Alignment Report</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Generate a full audit of all {manifest.length} registered agents — including diagnostics, pillar alignment coverage, conflict detection, harmful agent detection, management controls, and a platform agent health score with priority action list.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-3xl w-full">
                  {[
                    { label: "Audit Summary", desc: "Active, degraded, unregistered, conflicts" },
                    { label: "Per-Agent Diagnostics", desc: "Status, performance, conflicts, risk flags" },
                    { label: "Alignment Report", desc: "Pillar coverage, cohesion, harmful detection" },
                    { label: "Health Score", desc: "Composite score + priority action list" }
                  ].map(item => (
                    <div key={item.label} className="bg-slate-900 border border-white/8 rounded-xl p-4">
                      <p className="text-amber-400 font-semibold text-sm">{item.label}</p>
                      <p className="text-white/40 text-xs mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Button onClick={() => handleGenerate(true)} variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 h-11 px-6">
                    <Play className="w-5 h-5 mr-2" /> Run Full Audit Now
                  </Button>
                  <Button onClick={() => handleGenerate(false)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 text-base h-11">
                    <Sparkles className="w-5 h-5 mr-2" /> Generate Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <style>{`
                  .audit-doc table { width:100%; border-collapse:collapse; margin:16px 0; font-size:13px; }
                  .audit-doc th { background:#f8fafc; padding:10px 14px; text-align:left; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#475569; border:1px solid #e2e8f0; }
                  .audit-doc td { padding:10px 14px; border:1px solid #e2e8f0; color:#374151; vertical-align:top; line-height:1.65; }
                  .audit-doc tr:nth-child(even) td { background:#f8fafc; }
                  .audit-doc h3 { font-size:16px; font-weight:700; color:#0f172a; margin:24px 0 8px; }
                  .audit-doc h4 { font-size:11px; font-weight:700; color:#64748b; margin:18px 0 6px; text-transform:uppercase; letter-spacing:1px; }
                  .audit-doc p { margin:0 0 10px; }
                  .audit-doc ul,ol { padding-left:20px; margin:8px 0; }
                  .audit-doc li { margin-bottom:5px; }
                  .audit-doc strong { color:#0f172a; }
                  .audit-doc em { color:#475569; font-style:italic; }
                `}</style>
                <div className="audit-doc" dangerouslySetInnerHTML={{ __html: doc.content_html }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}