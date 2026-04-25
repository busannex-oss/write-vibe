import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Sparkles, Edit3, Download, History, Map, CheckCircle2, FileJson
} from "lucide-react";
import MapLegendEditor from "@/components/legend/MapLegendEditor";
import MapLegendVersionHistory from "@/components/legend/MapLegendVersionHistory";

const invoke = (action, extra = {}) => base44.functions.invoke("mapLegend", { action, ...extra });

export default function MapLegendPage() {
  const [legend, setLegend] = useState(null);
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
    setLegend(res.data.legend);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s in editor mode
  useEffect(() => {
    if (view !== "editor") { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", { content_html: editorContentRef.current, legend_data: legend?.legend_data || {} });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, legend]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress("Pulling platform data from registry...");
    await new Promise(r => setTimeout(r, 500));
    setGenProgress("Generating Map Legend with AI (~30s)...");
    const res = await invoke("generate");
    setLegend(res.data.legend);
    setLastSaved(new Date());
    setGenerating(false);
    setGenProgress("");
  };

  const handleExportPDF = () => {
    if (!legend?.content_html) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Write Vibe Map Legend</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { background: #0f172a; margin: 0; padding: 24px; }
      </style>
    </head><body>${legend.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 800);
  };

  const handleExportJSON = () => {
    if (!legend?.legend_data) return;
    const blob = new Blob([JSON.stringify(legend.legend_data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `write-vibe-map-legend-v${legend.version_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorSave = async (html) => {
    await invoke("save", { content_html: html, legend_data: legend?.legend_data || {} });
    setLegend(prev => ({ ...prev, content_html: html }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestoreVersion = async (id) => {
    const res = await invoke("restore", { id });
    setLegend(res.data.legend);
    setView("document");
  };

  if (view === "history") {
    return <MapLegendVersionHistory onBack={() => setView("document")} onRestore={handleRestoreVersion} />;
  }

  if (view === "editor" && legend) {
    return (
      <MapLegendEditor
        initialHtml={legend.content_html}
        onSave={handleEditorSave}
        onCancel={() => setView("document")}
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
            <Map className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Map Legend</h1>
              {legend && (
                <p className="text-white/30 text-xs font-sans">
                  v{legend.version_number} · {legend.generated_at ? new Date(legend.generated_at).toLocaleDateString() : ''}
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
            {legend && (
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
              {generating
                ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                : <Sparkles className="w-4 h-4 mr-1" />}
              {generating ? "Generating..." : legend ? "Regenerate with AI" : "Generate Map Legend"}
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
            <p className="text-white/60 text-sm font-sans">{genProgress || "Building your Map Legend..."}</p>
            <p className="text-white/30 text-xs font-sans">Powered by Claude Sonnet · May take up to 60 seconds</p>
          </div>
        ) : !legend ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Map className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">No Map Legend Generated Yet</h2>
              <p className="text-white/40 max-w-md font-sans text-sm">
                Generate a complete visual language reference document — element types, relationship definitions, status indicators, pillar colors, and hierarchy levels.
              </p>
            </div>
            <Button onClick={handleGenerate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Map Legend
            </Button>
          </div>
        ) : (
          <div
            className="legend-document"
            dangerouslySetInnerHTML={{ __html: legend.content_html }}
          />
        )}
      </div>
    </div>
  );
}