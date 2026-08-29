import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const LABELS = {
  direct: "Direct / typed link",
  search: "Search engines",
  social: "Social media",
  referral: "Other websites"
};

export default function TrafficSourceList({ sources, total }) {
  const entries = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Where readers came from</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-white/40 text-sm py-6 text-center">No traffic recorded yet</p>
        ) : (
          entries.map(([source, count]) => (
            <div key={source}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/70">{LABELS[source] || source}</span>
                <span className="text-white/50">{count} ({Math.round((count / total) * 100)}%)</span>
              </div>
              <Progress value={(count / total) * 100} className="h-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}