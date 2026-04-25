import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Edit3, Download, History, Palette, CheckCircle2, FileJson } from "lucide-react";
import BrandStyleGuideEditor from "@/components/brand/BrandStyleGuideEditor";
import BrandStyleGuideVersionHistory from "@/components/brand/BrandStyleGuideVersionHistory";

const invoke = (action, extra = {}) => base44.functions.invoke("brandStyleGuide", { action, ...extra });

export default function BrandStyleGuidePage() {
  const [guide, setGuide] = useState(null);
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
    setGuide(res.data.guide);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s when editing
  useEffect(() => {
    if (view !== "editor") { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", { content_html: editorContentRef.current, brand_data: guide?.brand_data || {} });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, guide]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress("Pulling platform data and mission statement...");
    await new Promise(r => setTimeout(r, 500));
    setGenProgress("Generating Brand Style Guide with AI (~30s)...");
    const res = await invoke("generate");
    setGuide(res.data.guide);
    setLastSaved(new Date());
    setGenerating(false);
    setGenProgress("");
  };

  const handleExportPDF = () => {
    if (!guide?.content_html) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>The Write Vibe Brand Style Guide</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { background: #0f172a; margin: 0; padding: 24px; }
      </style>
    </head><body>${guide.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const handleExportJSON = () => {
    if (!guide?.brand_data) return;
    const blob = new Blob([JSON.stringify(guide.brand_data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `write-vibe-brand-style-guide-v${guide.version_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorSave = async (html) => {
    await invoke("save", { content_html: html, brand_data: guide?.brand_data || {} });
    setGuide(prev => ({ ...prev, content_html: html }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestoreVersion = async (id) => {
    const res = await invoke("restore", { id });
    setGuide(res.data.guide);
    setView("document");
  };

  const handleSectionRegenerate = async (section) => {
    const res = await invoke("regenerate_section", { section, current_guide: guide?.brand_data });
    return res.data;
  };

  if (view === "history") {
    return <BrandStyleGuideVersionHistory onBack={() => setView("document")} onRestore={handleRestoreVersion} />;
  }

  if (view === "editor" && guide) {
    return (
      <BrandStyleGuideEditor
        initialHtml={guide.content_html}
        brandData={guide.brand_data || {}}
        onSave={handleEditorSave}
        onCancel={() => setView("document")}
        onSectionRegenerate={handleSectionRegenerate}
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
            <Palette className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Brand Style Guide</h1>
              {guide && (
                <p className="text-white/30 text-xs font-sans">
                  v{guide.version_number} · {guide.generated_at ? new Date(guide.generated_at).toLocaleDateString() : ''}
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
            {guide && (
              <>
                <Button variant="outline" size="sm" onClick={() => setView("editor")}>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <FileJson className="w-4 h-4 mr-1" /> Export JSON
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
              {generating ? "Generating..." : guide ? "Regenerate with AI" : "Generate Style Guide"}
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
              <Palette className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <p className="text-white/60 text-sm font-sans">{genProgress}</p>
            <p className="text-white/30 text-xs font-sans">Powered by AI · Generating 6 sections in parallel</p>
          </div>
        ) : !guide ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Palette className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">No Brand Style Guide Yet</h2>
              <p className="text-white/40 max-w-md font-sans text-sm">
                Generate a complete investor and agent-facing brand identity document — colors, typography, voice, positioning, and application guidelines.
              </p>
            </div>
            <Button onClick={handleGenerate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Brand Style Guide
            </Button>
          </div>
        ) : (
          <div
            className="brand-style-guide-document"
            dangerouslySetInnerHTML={{ __html: guide.content_html }}
          />
        )}
      </div>
    </div>
  );
}