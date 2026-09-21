import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function CRMStatCard({ label, value, hint, icon: Icon, color = "from-amber-400 to-orange-500" }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/50">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}