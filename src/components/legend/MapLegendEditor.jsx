import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function MapLegendEditor({ initialHtml, onSave, onCancel, editorContentRef }) {
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editorContentRef) editorContentRef.current = html;
  }, [html]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(html);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCancel}><ArrowLeft className="w-4 h-4" /></Button>
            <h1 className="text-white font-bold">Edit Map Legend</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save & Publish
          </Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-3">
        <p className="text-white/40 text-sm font-sans">Edit the legend HTML directly. Changes auto-save every 60 seconds.</p>
        <textarea
          value={html}
          onChange={e => setHtml(e.target.value)}
          className="w-full h-[70vh] bg-slate-900 border border-white/10 rounded-xl p-4 text-white/70 text-xs font-mono resize-none focus:outline-none focus:border-amber-500/40"
          spellCheck={false}
        />
      </div>
    </div>
  );
}