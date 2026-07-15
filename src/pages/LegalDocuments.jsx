import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Loader2, Sparkles, Edit3, Download, History, Shield, FileText,
  CheckCircle2, ShieldAlert, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import LegalDocEditor from "@/components/legal/LegalDocEditor";
import LegalVersionHistory from "@/components/legal/LegalVersionHistory";
import LegalRiskPanel from "@/components/legal/LegalRiskPanel";
import InlineRecommendations from "@/components/InlineRecommendations";

const invoke = (action, extra = {}) => base44.functions.invoke("legalDocuments", { action, ...extra });

const TABS = [
  { id: "privacy_policy", label: "Privacy Policy", icon: Shield },
  { id: "terms_of_service", label: "Terms of Service", icon: FileText }
];

export default function LegalDocumentsPage() {
  const [activeTab, setActiveTab] = useState("privacy_policy");
  const [docs, setDocs] = useState({ privacy_policy: null, terms_of_service: null });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // doc_type or null
  const [genProgress, setGenProgress] = useState("");
  const [view, setView] = useState("document"); // document | editor | history
  const [showRisk, setShowRisk] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveRef = useRef(null);
  const editorContentRef = useRef(null);

  const activeDoc = docs[activeTab];

  const load = async () => {
    setLoading(true);
    const res = await invoke("get_current");
    setDocs({
      privacy_policy: res.data.privacy_policy,
      terms_of_service: res.data.terms_of_service
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-save every 60s in editor
  useEffect(() => {
    if (view !== "editor") { clearInterval(autoSaveRef.current); return; }
    autoSaveRef.current = setInterval(async () => {
      if (!editorContentRef.current) return;
      setAutoSaving(true);
      await invoke("save", { doc_type: activeTab, content_html: editorContentRef.current });
      setLastSaved(new Date());
      setAutoSaving(false);
    }, 60000);
    return () => clearInterval(autoSaveRef.current);
  }, [view, activeTab]);

  const handleGenerate = async (docType) => {
    setGenerating(docType);
    setGenProgress("Pulling platform context — services, data, payment details...");
    await new Promise(r => setTimeout(r, 500));
    setGenProgress(`Drafting ${docType === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'} with AI legal model (~30s)...`);
    const res = await invoke("generate", { doc_type: docType });
    setDocs(prev => ({ ...prev, [docType]: res.data.doc }));
    setLastSaved(new Date());
    setGenerating(null);
    setGenProgress("");
    setShowRisk(true);
  };

  const handleEditorSave = async (html) => {
    await invoke("save", { doc_type: activeTab, content_html: html });
    setDocs(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], content_html: html } }));
    setLastSaved(new Date());
    setView("document");
  };

  const handleRestoreVersion = async (id) => {
    const res = await invoke("restore", { doc_type: activeTab, id });
    setDocs(prev => ({ ...prev, [activeTab]: res.data.doc }));
    setView("document");
  };

  const handleExportPDF = () => {
    if (!activeDoc?.content_html) return;
    const docTitle = `The Write Vibe — ${activeTab === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'}`;
    const effectiveDate = activeDoc.effective_date
      ? new Date(activeDoc.effective_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${docTitle}</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 16mm 16mm 18mm; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #fff; color: #1e293b;
          font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.65; }
        .doc-cover { background: #0b1120; color: #fff; padding: 30mm 18mm 14mm; margin: 0 0 12mm; }
        .doc-cover .brand { font-family: Arial, Helvetica, sans-serif; font-size: 8pt;
          letter-spacing: 2px; color: #f59e0b; font-weight: 700; }
        .doc-cover h1 { font-family: Arial, Helvetica, sans-serif; font-size: 26pt; margin: 8mm 0 4mm;
          color: #fff; border: none; padding: 0; }
        .doc-cover .rule { height: 3px; width: 60mm; background: #f59e0b; margin: 6mm 0; border: none; }
        .doc-cover .meta { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #94a3b8; }
        h2 { font-family: Arial, Helvetica, sans-serif; color: #0b1120; font-size: 13pt;
          margin: 18px 0 8px; padding-left: 10px; border-left: 4px solid #f59e0b;
          page-break-after: avoid; }
        h3 { font-family: Arial, Helvetica, sans-serif; color: #1e293b; font-size: 11pt;
          margin: 14px 0 6px; page-break-after: avoid; }
        p { margin: 0 0 10px; orphans: 3; widows: 3; }
        ul, ol { padding-left: 22px; margin: 0 0 10px; } li { margin-bottom: 6px; }
        a { color: #d97706; }
        .doc-footer { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color: #94a3b8;
          border-top: 1px solid #e2e8f0; margin-top: 16mm; padding-top: 6px; text-align: center; }
      </style>
    </head><body>
      <div class="doc-cover">
        <div class="brand">WRITE VIBE · AI BOOK CREATION PLATFORM</div>
        <h1>${activeTab === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'}</h1>
        <div class="rule"></div>
        <div class="meta">Effective ${effectiveDate} · Version ${activeDoc.version_number || 1} · Confidential</div>
      </div>
      ${activeDoc.content_html}
      <div class="doc-footer">© ${new Date().getFullYear()} Write Vibe · Proprietary &amp; Confidential · Unauthorized reproduction is prohibited.</div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  // ── SUB-VIEWS ──────────────────────────────────────────────────────────────
  if (view === "history") {
    return (
      <LegalVersionHistory
        docType={activeTab}
        onBack={() => setView("document")}
        onRestore={handleRestoreVersion}
      />
    );
  }

  if (view === "editor" && activeDoc) {
    return (
      <LegalDocEditor
        docType={activeTab}
        initialHtml={activeDoc.content_html}
        onSave={handleEditorSave}
        onCancel={() => setView("document")}
        editorContentRef={editorContentRef}
      />
    );
  }

  // ── MAIN VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">

      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Legal Documents</h1>
              {activeDoc && (
                <p className="text-white/30 text-xs">
                  v{activeDoc.version_number}
                  {activeDoc.effective_date && ` · Effective ${new Date(activeDoc.effective_date).toLocaleDateString()}`}
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
            {activeDoc && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowRisk(s => !s)}
                  className={showRisk ? "border-amber-500/40 text-amber-400" : ""}>
                  <ShieldAlert className="w-4 h-4 mr-1" /> Risk Analysis
                </Button>
                <Button variant="outline" size="sm" onClick={() => setView("editor")}>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </>
            )}
            <Button
              onClick={() => handleGenerate(activeTab)}
              disabled={!!generating}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              size="sm"
            >
              {generating === activeTab
                ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                : <Sparkles className="w-4 h-4 mr-1" />}
              {generating === activeTab
                ? "Generating..."
                : activeDoc ? "Regenerate with AI" : "Generate with AI"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto flex gap-1 mt-3">
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            const hasDoc = !!docs[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setView("document"); setShowRisk(false); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {hasDoc && <CheckCircle2 className="w-3 h-3 text-green-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <InlineRecommendations
          context={`Legal Documents — ${activeTab === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'}`}
          contextData={{ docType: activeTab, version: activeDoc?.version_number, hasRiskAnalysis: !!activeDoc?.risk_analysis, overallRisk: activeDoc?.risk_analysis?.overall_risk }}
          storageKey={`recs_legal_${activeTab}`}
        />
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : generating === activeTab ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <p className="text-white/60 text-sm">{genProgress}</p>
            <p className="text-white/30 text-xs">AI legal model drafting full document + risk analysis in parallel</p>
          </div>
        ) : !activeDoc ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold mb-2">
                No {activeTab === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'} Yet
              </h2>
              <p className="text-white/40 max-w-md text-sm">
                Generate a complete, professional legal document tailored to The Write Vibe's AI-powered self-publishing platform — including author IP protections, AI usage terms, and distribution platform agreements.
              </p>
            </div>
            <Button onClick={() => handleGenerate(activeTab)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {activeTab === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Document */}
            <div className={cn("xl:col-span-2", showRisk && activeDoc?.risk_analysis ? "" : "xl:col-span-3")}>
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div
                  dangerouslySetInnerHTML={{ __html: activeDoc.content_html }}
                />
              </div>
            </div>

            {/* Risk Panel */}
            {showRisk && (
              <div className="xl:col-span-1 space-y-4">
                <LegalRiskPanel
                  docType={activeTab}
                  riskAnalysis={activeDoc?.risk_analysis}
                  onUpdated={(ra) => setDocs(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], risk_analysis: ra } }))}
                  onClose={() => setShowRisk(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}