import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ViewsTrendChart({ data }) {
  const hasData = data.some((d) => d.views > 0);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Reader visits — last 30 days</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} interval="preserveStartEnd" />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
              />
              <Area type="monotone" dataKey="views" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} name="Visits" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-white/40 text-sm">No visits recorded yet</p>
            <p className="text-white/25 text-xs mt-1">
              Visits start counting as soon as readers open one of your published book pages.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}