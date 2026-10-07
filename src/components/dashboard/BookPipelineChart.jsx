import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STAGES = [
  ["draft", "Draft", "#64748b"], ["outline", "Outline", "#3b82f6"], ["writing", "Writing", "#f59e0b"],
  ["editing", "Editing", "#a855f7"], ["cover_design", "Cover", "#ec4899"], ["marketing", "Marketing", "#10b981"],
  ["published", "Published", "#22c55e"],
];

export default function BookPipelineChart({ books }) {
  const data = STAGES.map(([key, name, color]) => ({ name, color, count: books.filter((b) => (b.status || "draft") === key).length }));
  const words = books
    .map((b) => ({ name: (b.title || "Untitled").slice(0, 14), words: (b.manuscript_chapters || []).reduce((s, c) => s + (c.word_count || 0), 0) }))
    .filter((b) => b.words > 0).slice(0, 6);

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <ChartCard title="Book pipeline" subtitle="Projects at each stage">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={tip} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Words written" subtitle="Manuscript length per book">
        {words.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-white/40">No chapters written yet.</div>
        ) : (
          <BarChart data={words} layout="vertical">
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={tip} />
            <Bar dataKey="words" fill="#f59e0b" radius={[0, 6, 6, 0]} />
          </BarChart>
        )}
      </ChartCard>
    </div>
  );
}

export const tip = { background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 };

export function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-white font-semibold">{title}</p>
      <p className="text-xs text-white/40 mb-4">{subtitle}</p>
      <div className="h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  );
}