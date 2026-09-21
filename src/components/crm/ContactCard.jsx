import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, RefreshCw, Target, Heart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_COLORS = {
  subscriber: "bg-sky-500/15 text-sky-300",
  lead: "bg-amber-500/15 text-amber-300",
  engaged: "bg-violet-500/15 text-violet-300",
  member: "bg-blue-500/15 text-blue-300",
  customer: "bg-emerald-500/15 text-emerald-300",
  advocate: "bg-pink-500/15 text-pink-300",
  dormant: "bg-white/10 text-white/50"
};

export default function ContactCard({ contact, onEnrich, enriching }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-medium truncate">{contact.name || contact.email}</p>
              <Badge className={cn("border-0 text-[10px]", STAGE_COLORS[contact.lifecycle_stage] || STAGE_COLORS.subscriber)}>
                {contact.lifecycle_stage}
              </Badge>
              {contact.advocacy_potential === "high" && (
                <Badge className="bg-pink-500/15 text-pink-300 border-0 text-[10px]">
                  <Heart className="w-2.5 h-2.5 mr-1" /> advocate potential
                </Badge>
              )}
              {contact.loyalty_risk === "high" && (
                <Badge className="bg-red-500/15 text-red-300 border-0 text-[10px]">
                  <AlertTriangle className="w-2.5 h-2.5 mr-1" /> at risk
                </Badge>
              )}
            </div>
            <p className="text-xs text-white/35 mt-1 truncate">
              {contact.email} · {contact.segment || "unsegmented"} · via {contact.source}
            </p>
          </div>
          <div className="w-24 hidden sm:block">
            <p className="text-[10px] text-white/40 mb-1">Score {contact.lead_score || 0}</p>
            <Progress value={contact.lead_score || 0} className="h-1.5 bg-white/10" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="text-white/40 hover:text-white">
            <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
          </Button>
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm">
            {contact.persona && <p className="text-white/70">{contact.persona}</p>}
            {contact.enrichment_summary && <p className="text-white/50 text-xs">{contact.enrichment_summary}</p>}

            {contact.recommended_next_action && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Next best action</p>
                </div>
                <p className="text-white/80 text-sm">{contact.recommended_next_action}</p>
                {contact.recommended_content && (
                  <p className="text-white/45 text-xs mt-1">Send: {contact.recommended_content}</p>
                )}
              </div>
            )}

            {(contact.interests?.length > 0 || contact.motivations?.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {contact.interests?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {contact.interests.map((i) => <Badge key={i} className="bg-white/10 text-white/60 border-0 text-[10px]">{i}</Badge>)}
                    </div>
                  </div>
                )}
                {contact.motivations?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Motivations</p>
                    <div className="flex flex-wrap gap-1">
                      {contact.motivations.map((i) => <Badge key={i} className="bg-white/10 text-white/60 border-0 text-[10px]">{i}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {contact.objections?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Hesitations to overcome</p>
                <div className="flex flex-wrap gap-1">
                  {contact.objections.map((o) => <Badge key={o} className="bg-white/10 text-white/60 border-0 text-[10px]">{o}</Badge>)}
                </div>
              </div>
            )}

            {contact.nurture_touches?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                  Nurture history · {contact.nurture_stage || 0} sent ({contact.nurture_track})
                </p>
                {contact.nurture_touches.slice(-3).reverse().map((t, i) => (
                  <p key={i} className="text-[11px] text-white/45 truncate">
                    {t.sent_at ? new Date(t.sent_at).toLocaleDateString() : ""} — {t.subject || t.focus} ({t.status})
                  </p>
                ))}
              </div>
            )}

            <Button
              onClick={() => onEnrich(contact.email)}
              disabled={enriching}
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 mr-2", enriching && "animate-spin")} />
              Re-enrich profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}