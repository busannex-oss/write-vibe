import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Edit3, Download, History, LayoutGrid, CheckCircle2 } from "lucide-react";
import PillarAlignmentEditor from "@/components/pillar/PillarAlignmentEditor";
import PillarAlignmentVersionHistory from "@/components/pillar/PillarAlignmentVersionHistory";

const invoke = (action, extra = {}) => base44.functions.invoke("pillarAlignment", { action, ...extra });

export default function PillarAlignmentPage() {
  const [report, setReport] = useState(null);
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
    setReport(res.data.report);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (view !== "editor") { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", { content_html: editorContentRef.current, pillar_data: report?.pillar_data || [] });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, report]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress("Pulling platform data and mission statement...");
    await new Promise(r => setTimeout(r, 600));
    setGenProgress("Generating Pillar Alignment Report with AI (~45s)...");
    const res = await invoke("generate");
    setReport(res.data.report);
    setLastSaved(new Date());
    setGenerating(false);
    setGenProgress("");
  };

  const handleExportPDF = () => {
    if (!report?.content_html) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Write Vibe Pillar Alignment Report</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { background: #0f172a; margin: 0; padding: 24px; }
      </style>
    </head><body>${report.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const handleEditorSave = async (html) => {
    await invoke("save", { content_html: html, pillar_data: report?.pillar_data || [] });
    setReport(prev => ({ ...prev, content_html: html }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestoreVersion = async (id) => {
    const res = await invoke("restore", { id });
    setReport(res.data.report);
    setView("document");
  };

  const handlePillarRegenerate = async (pillar) => {
    const res = await invoke("regenerate_pillar", { pillar });
    return res.data.updated_pillar;
  };

  if (view === "history") {
    return <PillarAlignmentVersionHistory onBack={() => setView("document")} onRestore={handleRestoreVersion} />;
  }

  if (view === "editor" && report) {
    return (
      <PillarAlignmentEditor
        initialHtml={report.content_html}
        pillarData={report.pillar_data || []}
        onSave={handleEditorSave}
        onCancel={() => setView("document")}
        onPillarRegenerate={handlePillarRegenerate}
        editorContentRef={editorContentRef}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Pillar Alignment Report</h1>
              {report && (
                <p className="text-white/30 text-xs font-sans">
                  v{report.version_number} · {report.generated_at ? new Date(report.generated_at).toLocaleDateString() : ''}
                  {report.overall_score && <span className="ml-2 text-amber-400/70">Overall: {report.overall_score}/10</span>}
                  {autoSaving && <span className="ml-2 text-amber-400"><Loader2 className="w-2.5 h-2.5 inline animate-spin mr-1" />Saving...</span>}
                  {lastSaved && !autoSaving && <span className="ml-2 text-green-400/60"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />Saved</span>}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setView("history")}>
              <History className="w-4 h-4 mr-1" /> Version History
            </Button>
            {report && (
              <>
                <Button variant="outline" size="sm" onClick={() => setView("editor")}>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </>
            )}
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              size="sm"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              {generating ? "Generating..." : report ? "Regenerate with AI" : "Generate Report"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : generating ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <p className="text-white/60 text-sm font-sans">{genProgress}</p>
            <p className="text-white/30 text-xs font-sans">Powered by Claude Sonnet · May take up to 60 seconds</p>
          </div>
        ) : !report ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <LayoutGrid className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">No Pillar Alignment Report Yet</h2>
              <p className="text-white/40 max-w-md font-sans text-sm">
                Generate a complete investor-facing analysis of how deeply The Write Vibe embodies each of the 8 Foundational Pillars.
              </p>
            </div>
            <Button onClick={handleGenerate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Pillar Alignment Report
            </Button>
          </div>
        ) : (
          <div className="pillar-alignment-document" dangerouslySetInnerHTML={{ __html: report.content_html }} />
        )}
      </div>
    </div>
  );
}