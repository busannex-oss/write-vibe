import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Edit3, Download, History, Map, CheckCircle2, GitBranch } from "lucide-react";
import SitemapEditor from "@/components/sitemap/SitemapEditor";
import SitemapVersionHistory from "@/components/sitemap/SitemapVersionHistory";

const invoke = (action, extra = {}) => base44.functions.invoke("sitemap", { action, ...extra });

export default function SitemapPage() {
  const [sitemap, setSitemap] = useState(null);
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
    setSitemap(res.data.sitemap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s when editing
  useEffect(() => {
    if (view !== "editor") { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", {
        content_html: editorContentRef.current,
        sitemap_data: sitemap?.sitemap_data || {},
        mermaid_syntax: sitemap?.mermaid_syntax || ""
      });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, sitemap]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress("Pulling platform page inventory...");
    await new Promise(r => setTimeout(r, 500));
    setGenProgress("Generating Sitemap document with AI (~20s)...");
    const res = await invoke("generate");
    setSitemap(res.data.sitemap);
    setLastSaved(new Date());
    setGenerating(false);
    setGenProgress("");
  };

  const handleExportPDF = () => {
    if (!sitemap?.content_html) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>The Write Vibe Platform Sitemap</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { background: #0f172a; margin: 0; padding: 24px; }
      </style>
    </head><body>${sitemap.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const handleExportMermaid = () => {
    if (!sitemap?.mermaid_syntax) return;
    const blob = new Blob([sitemap.mermaid_syntax], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `write-vibe-sitemap-v${sitemap.version_number}.mmd`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorSave = async (html) => {
    await invoke("save", {
      content_html: html,
      sitemap_data: sitemap?.sitemap_data || {},
      mermaid_syntax: sitemap?.mermaid_syntax || ""
    });
    setSitemap(prev => ({ ...prev, content_html: html }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestoreVersion = async (id) => {
    const res = await invoke("restore", { id });
    setSitemap(res.data.sitemap);
    setView("document");
  };

  const handleSectionRegenerate = async (section) => {
    const res = await invoke("regenerate_section", { section });
    return res.data;
  };

  if (view === "history") {
    return <SitemapVersionHistory onBack={() => setView("document")} onRestore={handleRestoreVersion} />;
  }

  if (view === "editor" && sitemap) {
    return (
      <SitemapEditor
        initialHtml={sitemap.content_html}
        sitemapData={sitemap.sitemap_data || {}}
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
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Platform Sitemap</h1>
              {sitemap && (
                <p className="text-white/30 text-xs font-sans">
                  v{sitemap.version_number} · {sitemap.generated_at ? new Date(sitemap.generated_at).toLocaleDateString() : ''}
                  {sitemap.generation_notes && <span className="ml-2 text-white/20">· {sitemap.generation_notes}</span>}
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
            {sitemap && (
              <>
                <Button variant="outline" size="sm" onClick={() => setView("editor")}>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportMermaid}>
                  <GitBranch className="w-4 h-4 mr-1" /> Export Mermaid
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
              {generating ? "Generating..." : sitemap ? "Regenerate with AI" : "Generate Sitemap"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : generating ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Map className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <p className="text-white/60 text-sm">{genProgress}</p>
            <p className="text-white/30 text-xs">AI-generating architectural analysis and page inventory</p>
          </div>
        ) : !sitemap ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Map className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">No Platform Sitemap Yet</h2>
              <p className="text-white/40 max-w-md text-sm">
                Generate a complete investor-facing platform sitemap — full page inventory with pillar alignment, strategic roles, and architectural hierarchy across all 4 zones.
              </p>
            </div>
            <Button onClick={handleGenerate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Platform Sitemap
            </Button>
          </div>
        ) : (
          <div
            className="sitemap-document"
            dangerouslySetInnerHTML={{ __html: sitemap.content_html }}
          />
        )}
      </div>
    </div>
  );
}