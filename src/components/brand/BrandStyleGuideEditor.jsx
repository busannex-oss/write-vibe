import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, RefreshCw } from "lucide-react";
import ReactQuill from "react-quill";

const SECTIONS = [
  { key: "identity", label: "Brand Identity" },
  { key: "colors", label: "Color Palette" },
  { key: "typography", label: "Typography" },
  { key: "spacing", label: "Spacing System" },
  { key: "components", label: "Component Standards" },
  { key: "applications", label: "Brand Applications" },
];

export default function BrandStyleGuideEditor({
  initialHtml, brandData, onSave, onCancel, onSectionRegenerate, editorContentRef
}) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(null);

  useEffect(() => {
    if (editorContentRef) editorContentRef.current = html;
  }, [html]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  const handleSectionRegenerate = async (section) => {
    setRegenerating(section);
    const result = await onSectionRegenerate(section);
    setRegenerating(null);
    // Notify user to re-generate full guide or manually review
    alert(`Section "${SECTIONS.find(s => s.key === section)?.label}" regenerated. Re-generate the full guide to apply changes, or paste updated content manually.`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <p className="text-white font-semibold text-sm">Editing Brand Style Guide</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              size="sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex gap-6">
        {/* Section Regenerate Panel */}
        <div className="w-52 shrink-0">
          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 sticky top-20">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Regenerate Section</p>
            <div className="space-y-2">
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSectionRegenerate(s.key)}
                  disabled={regenerating !== null}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 text-left"
                >
                  {regenerating === s.key
                    ? <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                    : <RefreshCw className="w-3 h-3 shrink-0" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="flex-1 min-w-0">
          <style>{`
            .brand-editor .ql-toolbar { background: #1e293b; border-color: rgba(255,255,255,0.08) !important; border-radius: 12px 12px 0 0; }
            .brand-editor .ql-container { background: #0f172a; border-color: rgba(255,255,255,0.08) !important; border-radius: 0 0 12px 12px; min-height: 600px; }
            .brand-editor .ql-editor { color: #e2e8f0; font-family: Georgia, serif; line-height: 1.7; min-height: 600px; }
            .brand-editor .ql-stroke { stroke: #94a3b8 !important; }
            .brand-editor .ql-fill { fill: #94a3b8 !important; }
            .brand-editor .ql-picker { color: #94a3b8 !important; }
          `}</style>
          <div className="brand-editor">
            <ReactQuill
              value={html}
              onChange={setHtml}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1,2,3,false] }],
                  ['bold','italic','underline'],
                  [{ color: [] }, { background: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link'],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}