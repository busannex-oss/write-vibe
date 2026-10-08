import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Filter, Loader2 } from "lucide-react";

const PAID = (u) => u.subscription_tier && !["trial", "free"].includes(u.subscription_tier);

export default function TrialConversionFunnel() {
  const { data, isLoading } = useQuery({
    queryKey: ["trial-funnel"],
    queryFn: async () => {
      const [users, books] = await Promise.all([
        base44.entities.User.list("-created_date", 1000),
        base44.entities.Book.list("-created_date", 1000),
      ]);
      const authors = new Set(books.map((b) => b.created_by_id));
      const trial = users.filter((u) => u.trial_started_at || u.subscription_tier === "trial" || PAID(u));
      const started = trial.filter((u) => authors.has(u.id));
      const onboarded = started.filter((u) => u.member_onboarding_completed || PAID(u));
      const paid = users.filter(PAID);
      return [
        { label: "Signed up", count: users.length },
        { label: "Started trial", count: trial.length },
        { label: "Created a book", count: started.length },
        { label: "Converted to paid", count: paid.length },
      ].map((s, i, arr) => ({ ...s, drop: i ? arr[i - 1].count - s.count : 0 }));
    },
  });

  const top = data?.[0]?.count || 1;

  return (
    <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-1">
        <Filter className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-white">Trial → Paid Funnel</h3>
      </div>
      <p className="text-sm text-white/50 mb-5">Where potential customers drop off before paying.</p>
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      ) : (
        <div className="space-y-3">
          {data.map((s, i) => {
            const pct = Math.round((s.count / top) * 100);
            const stepPct = i ? Math.round((s.count / (data[i - 1].count || 1)) * 100) : 100;
            return (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">{s.label}</span>
                  <span className="text-white">
                    {s.count} <span className="text-white/40">({pct}%)</span>
                  </span>
                </div>
                <div className="h-8 rounded-lg bg-white/5 overflow-hidden">
                  <div className="h-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                </div>
                {i > 0 && s.drop > 0 && (
                  <p className="text-xs text-red-400/80 mt-1">−{s.drop} lost here · {stepPct}% continued from previous step</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}