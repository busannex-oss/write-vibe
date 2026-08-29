import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function MilestoneAttentionTable({ milestones }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm">Marketing milestones driving attention</CardTitle>
        <CardDescription className="text-white/40 text-xs">
          Visits and new subscribers in the 72 hours after each milestone went out — ranked by impact.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {milestones.length === 0 ? (
          <p className="text-white/40 text-sm py-6 text-center">
            No published marketing milestones yet — publish a post to start measuring its impact.
          </p>
        ) : (
          milestones.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/85 line-clamp-2">{m.caption}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs text-white/35">{m.dateLabel}</span>
                  {m.platforms.map((p) => (
                    <Badge key={p} className="bg-white/10 text-white/60 border-white/15 text-[10px] px-1.5 py-0">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end text-amber-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-lg font-bold">{m.views}</span>
                </div>
                <p className="text-[10px] text-white/35">visits · {m.subscribers} signups</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}