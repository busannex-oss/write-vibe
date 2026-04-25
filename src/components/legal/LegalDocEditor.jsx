import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, RefreshCw } from "lucide-react";
import ReactQuill from "react-quill";

const invoke = (action, extra = {}) => base44.functions.invoke("legalDocuments", { action, ...extra });

const PRIVACY_SECTIONS = [
  "Information We Collect", "How We Use Your Information", "Author IP & Content Data",
  "AI Processing", "Third-Party Sharing", "Payment Processing", "Your Rights", "Data Security"
];

const TERMS_SECTIONS = [
  "Author Content Ownership", "AI Tool Usage Terms", "Payment & Billing", 
  "Royalties & Distribution", "Amazon Integration", "Limitation of Liability", "Indemnification"
];

export default function LegalDocEditor({ docType, initialHtml, onSave, onCancel, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [regenSection, setRegenSection] = useState(null);

  const sections = docType === 'privacy_policy' ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  const handleChange = (val) => {
    setHtml(val);
    if (editorContentRef) editorContentRef.current = val;
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleRegenSection = async (section) => {
    setRegenSection(section);
    await invoke("regenerate_section", { doc_type: docType, section_name: section });
    setRegenSection(null);
    alert(`"${section}" section regenerated. Click Save then Regenerate with AI to see it in the full document.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-xs hidden sm:block">Regenerate section:</span>
            {sections.map(sec => (
              <Button key={sec} variant="outline" size="sm" className="text-xs h-7 px-2"
                onClick={() => handleRegenSection(sec)} disabled={regenSection === sec}>
                {regenSection === sec ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                {sec.split(' ')[0]}
              </Button>
            ))}
            <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-8" size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
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