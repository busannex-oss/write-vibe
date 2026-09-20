import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot
} from "recharts";
import { Flag } from "lucide-react";

const KIND_COLORS = {
  release: "#34d399",
  kdp: "#38bdf8",
  acx: "#a78bfa",
  social: "#fbbf24"
};

function MilestoneTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-slate-900 border border-white/10 p-3 text-xs max-w-56">
      <p className="text-white font-medium">{d.label}</p>
      <p className="text-amber-300 mt-0.5">{d.views} visits{d.spike ? " · traffic spike" : ""}</p>
      {d.milestones.map((m, i) => (
        <p key={i} className="text-white/60 mt-1 leading-snug">
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: KIND_COLORS[m.kind] }} />
          {m.label}
        </p>
      ))}
    </div>
  );
}

export default function MilestoneTrafficChart({ data }) {
  const hasData = data.some((d) => d.views > 0 || d.milestones.length > 0);
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-400" />
          Marketing milestones vs. website traffic — last 60 days
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height="85%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} interval="preserveStartEnd" minTickGap={24} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} />
                <Tooltip content={<MilestoneTooltip />} />
                <Area type="monotone" dataKey="views" stroke="#f59e0b" fill="#f59e0b26" strokeWidth={2} />
                {data.map((d) =>
                  d.milestones.length ? (
                    <ReferenceDot
                      key={d.key}
                      x={d.label}
                      y={Math.max(d.views, maxViews * 0.06)}
                      r={5}
                      fill={KIND_COLORS[d.milestones[0].kind] || "#fbbf24"}
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      isFront
                    />
                  ) : null
                )}
                {data.map((d) =>
                  d.spike ? (
                    <ReferenceDot key={`s-${d.key}`} x={d.label} y={d.views} r={3} fill="#fff" stroke="none" isFront />
                  ) : null
                )}
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-white/50">
              {Object.entries(KIND_COLORS).map(([kind, color]) => (
                <span key={kind} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {kind === "kdp" ? "KDP" : kind === "acx" ? "Audiobook" : kind}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white" />
                traffic spike
              </span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-white/40 text-sm">No milestones or visits recorded yet</p>
            <p className="text-white/25 text-xs mt-1">
              Publish a marketing post or set a launch date and it will appear here against your traffic.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}