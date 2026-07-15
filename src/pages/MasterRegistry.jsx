import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Sparkles, Edit3, Download, History, Save, X, RefreshCw,
  ChevronDown, ChevronUp, CheckCircle2, BookOpen, RotateCcw, Clock, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import RegistryVersionHistory from "@/components/registry/RegistryVersionHistory";
import RegistryEditor from "@/components/registry/RegistryEditor";

const STATUS_COLORS = {
  "Active": { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-400" },
  "In Development": { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
  "Planned": { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", dot: "bg-slate-400" },
};

const CATEGORIES = ["All", "Page", "AI Agent", "AI Tool", "Integration", "Automation", "Document", "Process"];
const STATUSES = ["All", "Active", "In Development", "Planned"];

function computeProgress(el) {
  if (el.status === "Active") return 100;
  if (el.status === "Planned") return 0;
  if (typeof el.development_progress === "number") return el.development_progress;
  return 20 + ((el.id || el.name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 60);
}

function ElementCard({ el, onFinishDevelopment, finishingId }) {
  const s = STATUS_COLORS[el.status] || STATUS_COLORS["Planned"];
  const baseProgress = computeProgress(el);
  const [displayProgress, setDisplayProgress] = useState(baseProgress);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setDisplayProgress(baseProgress);
  }, [baseProgress]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleFinish = () => {
    setAnimating(true);
    const start = baseProgress;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setDisplayProgress(Math.round(start + (100 - start) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
        onFinishDevelopment(el);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const isFinishing = animating || finishingId === el.id;
  const barColor = el.status === "Active" ? "bg-green-400" : el.status === "Planned" ? "bg-slate-500" : "bg-amber-400";

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{el.name}</h3>
          <span className="text-white/30 text-xs">{el.category}</span>
        </div>
        <span className={cn("shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", s.bg, s.border, s.text)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
          {el.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">Progress</span>
          <span className={cn("text-[10px] font-semibold", s.text)}>{displayProgress}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-150 ease-out", barColor)}
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>

      {el.pillar_alignment?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {el.pillar_alignment.map(p => (
            <span key={p} className="bg-amber-500/8 border border-amber-500/18 text-amber-500/80 text-xs px-2 py-0.5 rounded-full">{p}</span>
          ))}
        </div>
      )}
      <p className="text-white/50 text-xs leading-relaxed mb-3">{el.purpose}</p>
      {el.strategic_value && (
        <div className="border-l-2 border-amber-500/30 pl-3">
          <p className="text-amber-400/70 text-xs italic">{el.strategic_value}</p>
        </div>
      )}
      {el.status === "In Development" && onFinishDevelopment && (
        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
        >
          {isFinishing
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <CheckCircle2 className="w-3 h-3" />}
          {isFinishing ? "Completing..." : "Finish Development"}
        </button>
      )}
    </div>
  );
}

function FilterBar({ elements, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter }) {
  const categoryCounts = {};
  CATEGORIES.forEach(c => {
    categoryCounts[c] = c === "All" ? elements.length : elements.filter(e => e.category === c).length;
  });
  const statusCounts = {};
  STATUSES.forEach(s => {
    statusCounts[s] = s === "All" ? elements.length : elements.filter(e => e.status === s).length;
  });

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Filter className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-white/50 text-xs uppercase tracking-wider font-medium">Filter</span>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              categoryFilter === cat
                ? "bg-amber-500 border-amber-500 text-black"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
            )}
          >
            {cat} {categoryCounts[cat] > 0 && <span className="opacity-60">({categoryCounts[cat]})</span>}
          </button>
        ))}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(st => {
          const s = STATUS_COLORS[st];
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border",
                isActive && st !== "All"
                  ? cn(s.bg, s.border, s.text)
                  : isActive
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
              )}
            >
              {st !== "All" && s && <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />}
              {st} <span className="opacity-60">({statusCounts[st]})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const invoke = (action, extra = {}) => base44.functions.invoke("masterRegistry", { action, ...extra });

export default function MasterRegistryPage() {
  const [registry, setRegistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState("document"); // document | editor | history
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [finishingId, setFinishingId] = useState(null);
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

  const handleFinishDevelopment = async (el) => {
    setFinishingId(el.id);
    try {
      const res = await invoke("update_element_status", { element_id: el.id, new_status: "Active" });
      setRegistry(res.data.registry);
      setLastSaved(new Date());
    } finally {
      setFinishingId(null);
    }
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
        ) : (() => {
          // Deduplicate by name (case-insensitive)
          const seen = new Set();
          const allElements = (registry.elements || []).filter(el => {
            const key = el.name?.toLowerCase().trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const filtered = allElements.filter(el =>
            (categoryFilter === "All" || el.category === categoryFilter) &&
            (statusFilter === "All" || el.status === statusFilter)
          );

          const isFiltered = categoryFilter !== "All" || statusFilter !== "All";

          return (
            <>
              {allElements.length > 0 && (
                <FilterBar
                  elements={allElements}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
              )}

              {isFiltered ? (
                <div>
                  <p className="text-white/30 text-xs mb-4">
                    Showing {filtered.length} of {allElements.length} elements
                    {categoryFilter !== "All" && <span> · {categoryFilter}</span>}
                    {statusFilter !== "All" && <span> · {statusFilter}</span>}
                  </p>
                  {filtered.length === 0 ? (
                    <div className="text-center py-20 text-white/30">No elements match the selected filters.</div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filtered.map((el, i) => (
                        <ElementCard
                          key={el.id || i}
                          el={el}
                          onFinishDevelopment={handleFinishDevelopment}
                          finishingId={finishingId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="registry-document"
                  dangerouslySetInnerHTML={{ __html: registry.content_html }}
                />
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}