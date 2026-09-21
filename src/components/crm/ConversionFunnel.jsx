import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, TrendingDown } from "lucide-react";

const STAGES = [
  { key: "subscriber", label: "Subscribers", bar: "bg-sky-500/70" },
  { key: "lead", label: "Leads", bar: "bg-indigo-500/70" },
  { key: "engaged", label: "Engaged", bar: "bg-violet-500/70" },
  { key: "member", label: "Members", bar: "bg-emerald-500/70" },
  { key: "customer", label: "Customers", bar: "bg-teal-500/70" },
  { key: "advocate", label: "Advocates", bar: "bg-amber-500/70" }
];

export default function ConversionFunnel({ contacts = [], onStageClick }) {
  const { steps, biggestLeak, dormant } = useMemo(() => {
    const order = STAGES.map((s) => s.key);
    const rank = (c) => order.indexOf(c.lifecycle_stage);

    const steps = STAGES.map((s, i) => ({
      ...s,
      // Everyone who reached this stage or beyond
      count: contacts.filter((c) => rank(c) >= i).length
    }));

    let biggestLeak = null;
    steps.forEach((s, i) => {
      if (i === 0) return;
      const prev = steps[i - 1];
      const lost = prev.count - s.count;
      const rate = prev.count ? lost / prev.count : 0;
      if (lost > 0 && (!biggestLeak || rate > biggestLeak.rate)) {
        biggestLeak = { from: prev.label, to: s.label, lost, rate };
      }
    });

    return {
      steps,
      biggestLeak,
      dormant: contacts.filter((c) => c.lifecycle_stage === "dormant").length
    };
  }, [contacts]);

  const top = steps[0]?.count || 0;
  const members = steps.find((s) => s.key === "member")?.count || 0;
  const conversion = top ? Math.round((members / top) * 100) : 0;

  return (
    <Card className="bg-white/5 border-white/10 mb-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-white text-base">Conversion Funnel</CardTitle>
          <p className="text-sm text-white/50 mt-1">
            {conversion}% of subscribers become members. Click a stage to filter the list.
          </p>
        </div>
        {dormant > 0 && (
          <span className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-full px-3 py-1 whitespace-nowrap">
            {dormant} gone dormant
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1] : null;
          const lost = prev ? prev.count - s.count : 0;
          const dropRate = prev && prev.count ? Math.round((lost / prev.count) * 100) : 0;
          const width = top ? Math.max(s.count / top, 0.02) * 100 : 0;
          const isLeak = biggestLeak && prev && biggestLeak.to === s.label;

          return (
            <div key={s.key}>
              {prev && (
                <div className="flex items-center gap-2 pl-1 py-1 text-xs">
                  <TrendingDown className={`w-3 h-3 ${isLeak ? "text-rose-400" : "text-white/25"}`} />
                  <span className={isLeak ? "text-rose-300 font-medium" : "text-white/35"}>
                    {lost > 0 ? `${lost} lost (${dropRate}%)` : "no drop-off"}
                    {isLeak ? " — biggest leak" : ""}
                  </span>
                </div>
              )}
              <button
                onClick={() => onStageClick?.(s.key)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-white/60 group-hover:text-white transition-colors">
                    {s.label}
                  </span>
                  <div className="flex-1 h-8 rounded-lg bg-white/5 overflow-hidden">
                    <div
                      className={`h-full ${s.bar} transition-all group-hover:brightness-125`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-semibold text-white">{s.count}</span>
                  <Filter className="w-3 h-3 text-white/0 group-hover:text-white/40 transition-colors" />
                </div>
              </button>
            </div>
          );
        })}

        {biggestLeak && (
          <p className="text-xs text-white/50 pt-3 border-t border-white/10">
            Most contacts drop off between <span className="text-rose-300">{biggestLeak.from}</span> and{" "}
            <span className="text-rose-300">{biggestLeak.to}</span> — {biggestLeak.lost} contacts
            ({Math.round(biggestLeak.rate * 100)}%). Focus nurturing there.
          </p>
        )}
      </CardContent>
    </Card>
  );
}