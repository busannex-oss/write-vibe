import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function InsightStatCard({ icon: Icon, label, value, hint, accent = "text-amber-400" }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${accent}`} />
          <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {hint && <p className="text-xs text-white/35 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}