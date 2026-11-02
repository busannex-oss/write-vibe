import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { BACK_TEXT_DEFAULTS } from "@/components/book/BackCoverTextOverlay";

const sel = "w-full h-9 rounded-md px-2 text-sm";

export default function BackCoverTextControls({ value, onChange, onSave, saving, fallbackBlurb }) {
  const s = { ...BACK_TEXT_DEFAULTS, ...value };
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between">
        <Label className="text-white/70">Show back cover text</Label>
        <Switch checked={s.enabled} onCheckedChange={(v) => set("enabled", v)} />
      </div>
      {s.enabled && (<>
        <div><Label className="text-white/60 text-xs">Headline / tagline</Label>
          <Input value={s.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="One line that hooks the reader" /></div>
        <div><Label className="text-white/60 text-xs">Blurb</Label>
          <Textarea rows={5} value={s.blurb} onChange={(e) => set("blurb", e.target.value)} placeholder={fallbackBlurb || "Back cover description"} />
          {!s.blurb && fallbackBlurb && <p className="text-[11px] text-white/40 mt-1">Using the book summary until you write your own.</p>}</div>
        <div><Label className="text-white/60 text-xs">About the author</Label>
          <Textarea rows={2} value={s.author_bio} onChange={(e) => set("author_bio", e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-2">
          <div><Label className="text-white/60 text-xs">Font</Label>
            <select className={sel} value={s.font} onChange={(e) => set("font", e.target.value)}>
              <option value="serif">Serif</option><option value="sans">Sans</option><option value="mono">Mono</option></select></div>
          <div><Label className="text-white/60 text-xs">Align</Label>
            <select className={sel} value={s.align} onChange={(e) => set("align", e.target.value)}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option></select></div>
          <div><Label className="text-white/60 text-xs">Position</Label>
            <select className={sel} value={s.position} onChange={(e) => set("position", e.target.value)}>
              <option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option></select></div>
        </div>
        <div><Label className="text-white/60 text-xs">Text size: {s.size}%</Label>
          <Slider min={60} max={160} step={5} value={[s.size]} onValueChange={([v]) => set("size", v)} /></div>
        <div><Label className="text-white/60 text-xs">Background shade: {s.band_opacity}%</Label>
          <Slider min={0} max={90} step={5} value={[s.band_opacity]} onValueChange={([v]) => set("band_opacity", v)} /></div>
        <div className="flex items-center justify-between">
          <Label className="text-white/60 text-xs">Text color</Label>
          <input type="color" value={s.color} onChange={(e) => set("color", e.target.value)} className="h-8 w-12 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-white/60 text-xs">Show barcode area</Label>
          <Switch checked={s.show_barcode} onCheckedChange={(v) => set("show_barcode", v)} />
        </div>
      </>)}
      <Button size="sm" onClick={onSave} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save back cover text
      </Button>
    </div>
  );
}