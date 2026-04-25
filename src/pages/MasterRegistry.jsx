import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Sparkles, Edit3, Download, History, Save, X, RefreshCw,
  ChevronDown, ChevronUp, CheckCircle2, BookOpen, RotateCcw, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import RegistryVersionHistory from "@/components/registry/RegistryVersionHistory";
import RegistryEditor from "@/components/registry/RegistryEditor";

const invoke = (action, extra = {}) => base44.functions.invoke("masterRegistry", { action, ...extra });

export default function MasterRegistryPage() {
  const [registry, setRegistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState("document"); // document | editor | history
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const autoSaveRef = useRef(null);
  const editorContentRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const res = await invoke("get_current");
    setRegistry(res.data.registry);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s when in editor mode
  useEffect(() => {
    if (view !== "editor") {
      clearInterval(autoSaveRef.current);
      return;
    }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", { content_html: editorContentRef.current, elements: registry?.elements || [] });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, registry]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress("Fetching platform data...");
    
    // Fetch SOPs and mission for context
    const [sopsRes, missionRes] = await Promise.all([
      base44.functions.invoke("sops", { action: "list" }).catch(() => ({ data: { sops: [] } })),
      base44.functions.invoke("mission", { action: "get" }).catch(() => ({ data: { mission: null } }))
    ]);

    setGenProgress("Generating registry with AI (this takes ~30s)...");
    const res = await invoke("generate", {
      sops: sopsRes.data?.sops || [],
      mission: missionRes.data?.mission || null
    });
    
    setRegistry(res.data.registry);
    setLastSaved(new Date());
    setGenerating(false);
    setGenProgress("");
  };

  const handleExportPDF = () => {
    if (!registry?.content_html) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Write Vibe Master Element Registry</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { background: #0f172a; margin: 0; padding: 24px; }
      </style>
    </head><body>${registry.content_html}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 800);
  };

  const handleEditorSave = async (html) => {
    await invoke("save", { content_html: html, elements: registry?.elements || [] });
    setRegistry(prev => ({ ...prev, content_html: html }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestoreVersion = async (id) => {
    const res = await invoke("restore", { id });
    setRegistry(res.data.registry);
    setView("document");
  };

  if (view === "history") {
    return <RegistryVersionHistory onBack={() => setView("document")} onRestore={handleRestoreVersion} />;
  }

  if (view === "editor" && registry) {
    return (
      <RegistryEditor
        initialHtml={registry.content_html}
        onSave={handleEditorSave}
        onCancel={() => setView("document")}
        elements={registry.elements || []}
        onElementRegenerate={async (el) => {
          const res = await invoke("regenerate_element", { element: el });
          return res.data.updated_element;
        }}
        editorContentRef={editorContentRef}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Controls Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Master Element Registry</h1>
              {registry && (
                <p className="text-white/30 text-xs">
                  v{registry.version_number} · {registry.generated_at ? new Date(registry.generated_at).toLocaleDateString() : ''}
                  {autoSaving && <span className="ml-2 text-amber-400"><Loader2 className="w-2.5 h-2.5 inline animate-spin mr-1" />Saving...</span>}
                  {lastSaved && !autoSaving && <span className="ml-2 text-green-400/60"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />Saved</span>}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline" size="sm"
              onClick={() => setView("history")}
            >
              <History className="w-4 h-4 mr-1" /> Version History
            </Button>
            {registry && (
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
              {generating
                ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                : <Sparkles className="w-4 h-4 mr-1" />}
              {generating ? "Generating..." : registry ? "Regenerate with AI" : "Generate Registry"}
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
            <p className="text-white/60 text-sm">{genProgress || "Generating your Master Element Registry..."}</p>
            <p className="text-white/30 text-xs">Powered by Claude Sonnet · This may take up to 60 seconds</p>
          </div>
        ) : !registry ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">No Registry Generated Yet</h2>
              <p className="text-white/40 max-w-md">
                Click "Generate Registry" to automatically pull all platform elements and create a professional investor-ready document.
              </p>
            </div>
            <Button onClick={handleGenerate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Master Element Registry
            </Button>
          </div>
        ) : (
          /* Render the HTML registry document */
          <div
            className="registry-document"
            dangerouslySetInnerHTML={{ __html: registry.content_html }}
          />
        )}
      </div>
    </div>
  );
}