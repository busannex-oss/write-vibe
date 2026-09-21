import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import BrandedCover from "./BrandedCover";
import { cn } from "@/lib/utils";

const POSITION_OPTIONS = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" }
];

export default function BrandOverlayControls({ book, user, onUpdate }) {
  const o = book.logo_overlay || {};
  const set = (patch) => onUpdate({ logo_overlay: { ...o, ...patch } }, true);

  const preview = {
    ...book,
    logo_overlay: { enabled: true, position: "bottom-right", size: 22, opacity: 100, ...o }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-base">Brand Overlay</CardTitle>
        <p className="text-sm text-white/50 mt-1">
          Your logo sits on top of the cover art — the cover itself is never replaced.
        </p>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Label className="text-white/70">Show logo on cover</Label>
            <Switch checked={o.enabled !== false} onCheckedChange={(v) => set({ enabled: v })} />
          </div>

          <div>
            <Label className="text-white/70 mb-2 block">Brand tagline</Label>
            <Input
              value={book.author_tagline || ""}
              onChange={(e) => onUpdate({ author_tagline: e.target.value }, true)}
              placeholder={user?.website_tagline || "Stories that stay with you"}
              maxLength={60}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-white/40">Shown under the logo</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">On cover</span>
                <Switch checked={!!o.show_tagline} onCheckedChange={(v) => set({ show_tagline: v })} />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-white/70 mb-2 block">Position</Label>
            <div className="flex flex-wrap gap-2">
              {POSITION_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => set({ position: p.value })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border transition-all",
                    (o.position || "bottom-right") === p.value
                      ? "bg-amber-500/20 border-amber-400 text-amber-200"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white/70 mb-2 block">Size — {o.size ?? 22}% of cover width</Label>
            <Slider value={[o.size ?? 22]} min={8} max={50} step={1} onValueChange={([v]) => set({ size: v })} />
          </div>

          <div>
            <Label className="text-white/70 mb-2 block">Opacity — {o.opacity ?? 100}%</Label>
            <Slider value={[o.opacity ?? 100]} min={20} max={100} step={5} onValueChange={([v]) => set({ opacity: v })} />
          </div>

          {user?.website_logo_url && user.website_logo_url !== book.author_logo_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdate(
                  { author_logo_url: user.website_logo_url, author_tagline: book.author_tagline || user.website_tagline || "" },
                  true
                )
              }
            >
              Use my brand identity
            </Button>
          )}
        </div>

        <div>
          <p className="text-xs text-white/40 mb-2">Live preview</p>
          <BrandedCover book={preview} className="aspect-[2/3] max-w-[240px] border border-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}