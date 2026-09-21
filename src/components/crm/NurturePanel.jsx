import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus, HeartCrack } from "lucide-react";

const DAY = 86400000;
const cooled = (c) => !c.last_nurtured_at || Date.now() - new Date(c.last_nurtured_at).getTime() > 7 * DAY;

export function nurtureQueues(contacts) {
  const eligible = contacts.filter((c) => !c.nurture_paused && c.newsletter_status !== "unsubscribed" && cooled(c));
  return {
    convert: eligible.filter((c) => !c.is_member),
    retain: eligible.filter(
      (c) =>
        c.is_member &&
        (c.loyalty_risk === "high" ||
          c.lifecycle_stage === "dormant" ||
          (c.last_activity_at && Date.now() - new Date(c.last_activity_at).getTime() > 30 * DAY))
    )
  };
}

export default function NurturePanel({ contacts, onDone }) {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const { convert, retain } = nurtureQueues(contacts);

  const run = async (track) => {
    setRunning(track);
    setResult(null);
    const res = await base44.functions.invoke("nurtureContacts", { track, limit: 15 });
    setRunning(null);
    setResult(res.data);
    onDone();
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/25 mb-8">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-white font-semibold">Nurture engine</p>
        </div>
        <p className="text-xs text-white/45 mb-4">
          Personalized emails to subscribers who never joined and members at risk of leaving — each send also refreshes
          their profile so all marketing gets sharper. Runs automatically every Tuesday; anyone contacted is rested for a week.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-sky-300" />
              <p className="text-sm text-white/80">Subscribers not yet joined</p>
            </div>
            <p className="text-2xl font-bold text-white">{convert.length}</p>
            <Button
              size="sm"
              onClick={() => run("convert")}
              disabled={!!running || convert.length === 0}
              className="mt-3 bg-sky-500/20 text-sky-200 border border-sky-500/30 hover:bg-sky-500/30"
            >
              {running === "convert" ? "Nurturing..." : "Nurture these"}
            </Button>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <HeartCrack className="w-4 h-4 text-rose-300" />
              <p className="text-sm text-white/80">Members at risk of leaving</p>
            </div>
            <p className="text-2xl font-bold text-white">{retain.length}</p>
            <Button
              size="sm"
              onClick={() => run("retain")}
              disabled={!!running || retain.length === 0}
              className="mt-3 bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30"
            >
              {running === "retain" ? "Nurturing..." : "Win these back"}
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-white/70">
              {result.nurtured || 0} nurtured{result.failed ? `, ${result.failed} could not be emailed` : ""}.
            </p>
            {(result.results || []).slice(0, 6).map((r) => (
              <p key={r.email} className="text-[11px] text-white/40 mt-1 truncate">
                {r.email} — {r.subject || "no subject"} ({r.status})
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}