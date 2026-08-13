import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Wand2, RefreshCw, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { slotForSection } from "@/lib/homepageCopy";

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    subheadline: { type: "string" },
    body_copy: { type: "string" },
    bullet_points: { type: "array", items: { type: "string" } },
    primary_cta: { type: "string" },
    secondary_cta: { type: "string" },
    visual_direction: { type: "string" },
    implementation_notes: { type: "array", items: { type: "string" } },
    rationale: { type: "string" }
  }
};

export default function SectionImproveDialog({ item, open, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  // preview = { newId, previousIds } while changes are live but not yet accepted
  const [preview, setPreview] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const queryClient = useQueryClient();
  const slot = slotForSection(item?.section || "");

  useEffect(() => {
    if (!open || !item) return;
    setResult(null);
    setPreview(null);
    setAccepted(false);
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `${attempt > 0 ? "This is a REGENERATION request — the previous draft was not strong enough. Produce a materially different, sharper, more distinctive version with a new angle, stronger specificity, and bolder structure. Do not repeat the previous phrasing.\n\n" : ""}You are a Fortune 100 Creative Director and StoryBrand-certified copywriter working on the homepage of Write Vibe — an AI-Powered Publishing & Intellectual Property Development company (never positioned as a ghostwriting, editing, or formatting service). Books are strategic assets that generate authority, revenue, opportunities, and legacy.

Rewrite and elevate this homepage section.

Section: ${item.section}
Current score: ${item.score}/100
Assessment: ${item.assessment}
Strengths to preserve: ${(item.strengths || []).join("; ")}
Recommendations to implement: ${(item.recommendations || []).join("; ")}

Produce final, ready-to-publish copy — not advice. Executive-level, specific, inspirational without hype. Avoid clichés like "unlock your potential", "dream big", "next-level", "revolutionary". Naturally support search intent around AI publishing, manuscript development, author branding, and intellectual property. Include a visual direction, and concrete implementation notes (layout, icons, accessibility, mobile). If a field doesn't apply to this section, return an empty string or empty array for it.`,
      response_json_schema: SCHEMA
    }).then(async (res) => {
      setResult(res);
      // Auto-apply to the live homepage as a pending change the user can accept or reject
      if (slot) {
        const existing = await base44.entities.HomepageCopy.filter({ slot, is_active: true });
        if (existing.length) {
          await base44.entities.HomepageCopy.bulkUpdate(existing.map((e) => ({ id: e.id, is_active: false })));
        }
        const created = await base44.entities.HomepageCopy.create({
          section: item.section,
          slot,
          headline: res.headline || "",
          subheadline: res.subheadline || "",
          body_copy: res.body_copy || "",
          bullet_points: res.bullet_points || [],
          primary_cta: res.primary_cta || "",
          secondary_cta: res.secondary_cta || "",
          is_active: true
        });
        queryClient.invalidateQueries({ queryKey: ["homepage-copy"] });
        setPreview({ newId: created.id, previousIds: existing.map((e) => e.id) });
      }
      setLoading(false);
    });
  }, [open, item, attempt]);

  const rejectChanges = async () => {
    if (!preview) return;
    await base44.entities.HomepageCopy.delete(preview.newId);
    if (preview.previousIds.length) {
      await base44.entities.HomepageCopy.bulkUpdate(preview.previousIds.map((id) => ({ id, is_active: true })));
    }
    queryClient.invalidateQueries({ queryKey: ["homepage-copy"] });
    setPreview(null);
  };

  const regenerate = async () => {
    // Roll back the pending changes before generating a new version
    if (preview) await rejectChanges();
    setAttempt((a) => a + 1);
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      result.headline && `HEADLINE: ${result.headline}`,
      result.subheadline && `SUBHEADLINE: ${result.subheadline}`,
      result.body_copy && `BODY: ${result.body_copy}`,
      result.bullet_points?.length && `BULLETS:\n- ${result.bullet_points.join("\n- ")}`,
      result.primary_cta && `PRIMARY CTA: ${result.primary_cta}`,
      result.secondary_cta && `SECONDARY CTA: ${result.secondary_cta}`,
      result.visual_direction && `VISUAL: ${result.visual_direction}`,
      result.implementation_notes?.length && `NOTES:\n- ${result.implementation_notes.join("\n- ")}`
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-lg">Elevate: {item?.section}</div>
              <div className="text-sm text-white/40 font-normal">Rewritten copy built from the audit findings</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
            Writing the improved section…
          </div>
        )}

        {result && (
          <>
            <ScrollArea className="max-h-[55vh] pr-3">
              <div className="space-y-5">
                {result.headline && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Headline</p>
                    <p className="text-xl font-bold text-white">{result.headline}</p>
                  </div>
                )}
                {result.subheadline && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Subheadline</p>
                    <p className="text-white/80">{result.subheadline}</p>
                  </div>
                )}
                {result.body_copy && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Body Copy</p>
                    <p className="text-white/70 leading-relaxed whitespace-pre-line">{result.body_copy}</p>
                  </div>
                )}
                {result.bullet_points?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Key Points</p>
                    <ul className="text-white/70 list-disc pl-5 space-y-1">
                      {result.bullet_points.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                )}
                {(result.primary_cta || result.secondary_cta) && (
                  <div className="flex flex-wrap gap-3">
                    {result.primary_cta && (
                      <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium">
                        {result.primary_cta}
                      </span>
                    )}
                    {result.secondary_cta && (
                      <span className="px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm">
                        {result.secondary_cta}
                      </span>
                    )}
                  </div>
                )}
                {result.visual_direction && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Visual Direction</p>
                    <p className="text-white/60 text-sm">{result.visual_direction}</p>
                  </div>
                )}
                {result.implementation_notes?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Implementation Notes</p>
                    <ul className="text-white/60 text-sm list-disc pl-5 space-y-1">
                      {result.implementation_notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
                {result.rationale && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-200/90">{result.rationale}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {preview && !accepted && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">
                This copy is now live on your homepage. Accept to keep it, or reject to restore the previous version.
              </div>
            )}
            <div className="flex flex-wrap justify-end items-center gap-2 pt-2 border-t border-white/10">
              {!slot && (
                <span className="mr-auto text-xs text-white/40">
                  This section isn't mapped to a live homepage block — copy it and I'll apply it for you.
                </span>
              )}
              <Button variant="outline" onClick={copyAll} className="border-white/20 text-white/70 hover:bg-white/10">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                onClick={regenerate}
                disabled={accepted}
                className="border-white/20 text-white/70 hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              {preview && !accepted && (
                <>
                  <Button
                    variant="outline"
                    onClick={rejectChanges}
                    className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject &amp; Revert
                  </Button>
                  <Button
                    onClick={() => setAccepted(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept Changes
                  </Button>
                </>
              )}
              {accepted && (
                <Button disabled className="bg-emerald-500 text-white opacity-70">
                  <Check className="w-4 h-4 mr-2" />
                  Changes Accepted
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}