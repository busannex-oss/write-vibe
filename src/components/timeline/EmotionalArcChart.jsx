import React, { useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Dot
} from "recharts";
import { cn } from "@/lib/utils";
import { MessageSquare, Star } from "lucide-react";

// Map milestone type → emotional intensity score (1–10)
const TYPE_INTENSITY = {
  introduction: 3,
  growth: 5,
  conflict: 8,
  revelation: 7,
  transformation: 9,
  arc_peak: 10,
  advisory_review: 6,
  resolution: 4,
};

const TYPE_COLORS = {
  introduction: "#3b82f6", growth: "#10b981", conflict: "#ef4444",
  revelation: "#a855f7", transformation: "#f59e0b", resolution: "#14b8a6",
  arc_peak: "#f97316", advisory_review: "#6366f1",
};

const CHARACTER_PALETTE = [
  "#f59e0b", "#3b82f6", "#10b981", "#a855f7", "#ef4444",
  "#14b8a6", "#f97316", "#ec4899", "#6366f1", "#84cc16",
];

// Custom dot that highlights advisory-reviewed milestones
const CustomDot = ({ cx, cy, payload, charColor }) => {
  if (!payload) return null;
  const hasAdvisory = payload.advisorCount > 0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={hasAdvisory ? 7 : 4} fill={charColor} stroke={hasAdvisory ? "#6366f1" : "transparent"} strokeWidth={hasAdvisory ? 2.5 : 0} />
      {hasAdvisory && <circle cx={cx} cy={cy} r={11} fill="none" stroke="#6366f1" strokeWidth={1} opacity={0.4} />}
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-white/15 rounded-xl p-3 shadow-2xl min-w-[180px]">
      <p className="text-white/50 text-xs mb-2">Chapter {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-white/70 text-xs">{entry.name}</span>
          </div>
          <span className="text-white font-semibold text-xs">{entry.value}/10</span>
        </div>
      ))}
      {payload[0]?.payload?.milestoneTitle && (
        <p className="text-amber-400/70 text-[10px] mt-2 border-t border-white/8 pt-2 italic">
          "{payload[0].payload.milestoneTitle}"
        </p>
      )}
      {payload[0]?.payload?.advisorCount > 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          <MessageSquare className="w-2.5 h-2.5 text-indigo-400" />
          <span className="text-indigo-400 text-[10px]">{payload[0].payload.advisorCount} advisory note{payload[0].payload.advisorCount > 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
};

export default function EmotionalArcChart({ milestones, totalChapters }) {
  const characters = useMemo(() => [...new Set(milestones.map(m => m.character_name))], [milestones]);

  // Build per-chapter data for each character
  const chartData = useMemo(() => {
    const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
    return chapters.map(ch => {
      const row = { chapter: ch };
      characters.forEach(char => {
        const charMs = milestones.filter(m => m.character_name === char && m.chapter_number === ch);
        if (charMs.length > 0) {
          // Use highest-intensity milestone for that chapter
          const best = charMs.reduce((max, m) => (TYPE_INTENSITY[m.milestone_type] || 5) > (TYPE_INTENSITY[max.milestone_type] || 5) ? m : max, charMs[0]);
          row[char] = TYPE_INTENSITY[best.milestone_type] || 5;
          row[`${char}_type`] = best.milestone_type;
          row[`${char}_title`] = best.title;
          row[`${char}_advisorCount`] = charMs.reduce((s, m) => s + (m.advisor_notes?.length || 0), 0);
          row[`${char}_avgRating`] = (() => {
            const notes = charMs.flatMap(m => m.advisor_notes || []);
            return notes.length ? (notes.reduce((s, n) => s + (n.rating || 0), 0) / notes.length).toFixed(1) : null;
          })();
        } else {
          row[char] = null;
        }
      });
      // For tooltip - use first character's data
      if (characters[0]) {
        row.milestoneTitle = row[`${characters[0]}_title`];
        row.advisorCount = row[`${characters[0]}_advisorCount`] || 0;
      }
      return row;
    }).filter(row => characters.some(c => row[c] !== null));
  }, [milestones, characters, totalChapters]);

  // Advisory feedback overlay data points
  const advisoryPoints = useMemo(() => {
    return milestones.filter(m => (m.advisor_notes?.length || 0) > 0).map(m => ({
      chapter: m.chapter_number,
      character: m.character_name,
      count: m.advisor_notes.length,
      avgRating: m.advisor_notes.reduce((s, n) => s + (n.rating || 0), 0) / m.advisor_notes.length,
    }));
  }, [milestones]);

  if (characters.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/20 text-sm">
        Add milestones to see the emotional arc chart
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Y-axis label */}
      <div className="flex items-center justify-between px-1">
        <p className="text-white/30 text-xs">Emotional Intensity (1–10)</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-indigo-400" />
            <span className="text-white/30 text-xs">Advisory feedback point</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="chapter"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            tickFormatter={v => `Ch.${v}`}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 9, 10]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Advisory review reference lines */}
          {advisoryPoints.map((pt, i) => (
            <ReferenceLine
              key={i}
              x={pt.chapter}
              stroke="rgba(99,102,241,0.3)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          ))}

          {characters.map((char, i) => {
            const color = CHARACTER_PALETTE[i % CHARACTER_PALETTE.length];
            return (
              <Line
                key={char}
                type="monotone"
                dataKey={char}
                name={char}
                stroke={color}
                strokeWidth={2.5}
                dot={(props) => <CustomDot {...props} charColor={color} />}
                activeDot={{ r: 8, stroke: color, strokeWidth: 2, fill: "#1e293b" }}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Advisory feedback summary bar */}
      {advisoryPoints.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/8">
          <p className="text-white/30 text-xs w-full mb-1">Advisory feedback at chapters:</p>
          {advisoryPoints.map((pt, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
              <span className="text-indigo-400 text-xs font-medium">Ch.{pt.chapter}</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/50 text-xs">{pt.character}</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                <span className="text-amber-400 text-xs">{pt.avgRating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}