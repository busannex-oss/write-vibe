import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import SalesCharts from "@/components/dashboard/SalesCharts";

const usd = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function SalesWidget() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["dashboard-sales"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500),
  });

  const paid = payments.filter((p) => p.status === "paid");
  const monthStart = startOfMonth(new Date());
  const total = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const month = paid.filter((p) => new Date(p.created_date) >= monthStart).reduce((s, p) => s + (p.amount || 0), 0);
  const refunds = payments.filter((p) => p.status === "refunded").length;

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 mb-5">
        <DollarSign className="w-5 h-5 text-emerald-400" />
        <h3 className="text-white font-semibold">Sales</h3>
        <span className="text-[10px] uppercase tracking-wider text-amber-400/70 ml-auto">Admin</span>
      </div>
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[["Total revenue", usd(total)], ["This month", usd(month)], ["Paid orders", paid.length], ["Refunds", refunds]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/40">{l}</p>
                <p className="text-2xl font-bold text-white mt-1">{v}</p>
              </div>
            ))}
          </div>
          <SalesCharts paid={paid} />
          <p className="text-xs uppercase tracking-wider text-white/40 mt-6 mb-2">Recent sales</p>
          <div className="space-y-2">
            {payments.length === 0 && <p className="text-sm text-white/40">No sales recorded yet.</p>}
            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-white/70 truncate">{p.user_name || p.user_email} · <span className="capitalize">{p.plan?.replace("_", " ")}</span></span>
                <span className="text-white/40 text-xs">{format(new Date(p.created_date), "MMM d")} · <span className="text-white">{usd(p.amount || 0)}</span> · {p.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}