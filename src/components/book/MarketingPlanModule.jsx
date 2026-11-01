import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Loader2, Store, CheckCircle2 } from "lucide-react";
import MarketingPlanChannels from "@/components/book/MarketingPlanChannels";

export default function MarketingPlanModule({ book }) {
  const qc = useQueryClient();
  const key = ["marketingPlan", book.id];
  const { data: plan, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => (await base44.entities.MarketingPlan.filter({ book_id: book.id }, "-created_date", 1))[0] || null,
  });
  const gen = useMutation({
    mutationFn: async () => (await base44.functions.invoke("generateMarketingPlan", { book_id: book.id })).data.plan,
    onSuccess: (p) => qc.setQueryData(key, p),
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-white flex items-center gap-2"><Megaphone className="w-5 h-5 text-amber-400" />Marketing Plan</CardTitle>
          <p className="text-sm text-white/50 mt-1">Multi-channel strategy built from your category, target audience and chosen bookstores.</p>
        </div>
        <Button onClick={() => gen.mutate()} disabled={gen.isPending} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shrink-0">
          {gen.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {gen.isPending ? "Building strategy…" : plan ? "Regenerate" : "Generate Plan"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {gen.isError && <p className="text-sm text-red-300">{gen.error?.response?.data?.error || gen.error.message}</p>}
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" /> : !plan ? (
          <p className="text-sm text-white/40 text-center py-6">No plan yet — generate one to get your promotion strategy.</p>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-white/80">{plan.positioning}</p>
              <p className="text-sm text-white/50">{plan.audience_summary}</p>
            </div>
            <MarketingPlanChannels channels={plan.channels} />
            {plan.budget_split?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Paid budget split</h4>
                {plan.budget_split.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm mb-1.5">
                    <span className="w-40 text-white/70 truncate">{b.channel}</span>
                    <div className="flex-1 h-2 rounded bg-white/10"><div className="h-2 rounded bg-amber-500" style={{ width: `${b.percent}%` }} /></div>
                    <span className="w-10 text-right text-white/60">{b.percent}%</span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Store className="w-4 h-4" />Bookstore tactics</h4>
                {(plan.bookstore_tactics || []).map((s, i) => (
                  <div key={i} className="mb-3"><p className="text-amber-300 text-sm font-medium">{s.store}</p>
                    <ul className="list-disc pl-5 text-sm text-white/70">{(s.tactics || []).map((t, j) => <li key={j}>{t}</li>)}</ul></div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">First 30 days</h4>
                {(plan.first_30_days || []).map((t, i) => (
                  <p key={i} className="text-sm text-white/70 flex gap-2 mb-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{t}</p>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}