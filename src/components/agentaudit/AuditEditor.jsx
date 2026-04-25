import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import ReactQuill from "react-quill";

const invoke = (action, extra = {}) => base44.functions.invoke("agentAudit", { action, ...extra });

const SECTIONS = [
  "Audit Summary",
  "Diagnostics Report",
  "Management Recommendations",
  "Alignment Report",
  "Overall Health Score"
];

export default function AuditEditor({ initialHtml, onSave, onCancel, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [regenSection, setRegenSection] = useState(null);

  const handleChange = (val) => {
    setHtml(val);
    if (editorContentRef) editorContentRef.current = val;
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleRegen = async (section) => {
    setRegenSection(section);
    await invoke("regenerate_section", { section_name: section });
    setRegenSection(null);
    alert(`"${section}" section regenerated. Use "Regenerate with AI" to embed all changes into the full document.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/25 text-xs hidden md:block shrink-0">Regenerate section:</span>
            {SECTIONS.map(sec => (
              <Button key={sec} variant="outline" size="sm" className="text-xs h-7 px-2"
                onClick={() => handleRegen(sec)} disabled={regenSection === sec}>
                {regenSection === sec
                  ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  : <RefreshCw className="w-3 h-3 mr-1" />}
                <span className="hidden sm:inline">{sec.split(' ')[0]}</span>
                <span className="sm:hidden">{sec.substring(0, 6)}</span>
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