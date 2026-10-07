import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { ChartCard, tip } from "@/components/dashboard/BookPipelineChart";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#a855f7"];

export default function SalesCharts({ paid }) {
  const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
  const trend = months.map((m) => ({
    month: format(m, "MMM"),
    revenue: paid.filter((p) => format(new Date(p.created_date), "yyyy-MM") === format(m, "yyyy-MM")).reduce((s, p) => s + (p.amount || 0), 0),
  }));
  const plans = Object.entries(paid.reduce((a, p) => ({ ...a, [p.plan || "other"]: (a[p.plan || "other"] || 0) + (p.amount || 0) }), {}))
    .map(([name, value]) => ({ name: name.replace("_", " "), value }));

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-5">
      <ChartCard title="Revenue trend" subtitle="Last 6 months">
        <AreaChart data={trend}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={tip} formatter={(v) => `$${v.toLocaleString()}`} />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ChartCard>
      <ChartCard title="Revenue by plan" subtitle="Share of paid sales">
        {plans.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-white/40">No paid sales yet.</div>
        ) : (
          <PieChart>
            <Pie data={plans} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
              {plans.map((p, i) => <Cell key={p.name} fill={COLORS[i % COLORS.length]} stroke="none" />)}
            </Pie>
            <Tooltip contentStyle={tip} formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1", textTransform: "capitalize" }} />
          </PieChart>
        )}
      </ChartCard>
    </div>
  );
}