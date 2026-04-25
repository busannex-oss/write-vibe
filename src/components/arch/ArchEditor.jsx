import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, RefreshCw } from "lucide-react";
import ReactQuill from "react-quill";

const invoke = (action, extra = {}) => base44.functions.invoke("systemArchitecture", { action, ...extra });

const CATEGORIES = [
  { id: "brand_identity", label: "Brand Identity & Positioning" },
  { id: "platform_architecture", label: "Platform Architecture & Mapping" },
  { id: "ai_operations", label: "AI Agent & Automation Infrastructure" },
  { id: "strategic_reporting", label: "Strategic Reporting & Alignment" },
  { id: "product_platform", label: "Core Product Platform" },
  { id: "legal_compliance", label: "Legal, Compliance & Trust" }
];

export default function ArchEditor({ initialHtml, onSave, onCancel, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [regenCat, setRegenCat] = useState(null);

  const handleChange = (val) => {
    setHtml(val);
    if (editorContentRef) editorContentRef.current = val;
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleRegenSection = async (catId) => {
    setRegenCat(catId);
    const res = await invoke("regenerate_section", { category_id: catId });
    setRegenCat(null);
    // Note: the section analysis is regenerated on the backend for next full generate
    // For live preview, user can full-regenerate after reviewing
    alert(`Section regenerated! Investor significance updated for "${catId}". Click "Regenerate with AI" to apply to full document.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-xs">Regenerate section:</span>
            {CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => handleRegenSection(cat.id)}
                disabled={regenCat === cat.id}
              >
                {regenCat === cat.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                {cat.label.split(' ')[0]}
              </Button>
            ))}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-8"
              size="sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <ReactQuill
            theme="snow"
            value={html}
            onChange={handleChange}
            className="bg-slate-900 text-white rounded-xl"
            style={{ minHeight: "600px" }}
          />
        </div>
      </div>
    </div>
  );
}