import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Printer, Loader2, Calculator } from "lucide-react";

const Row = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-white/40">{label}</span>
    <span className={highlight ? "text-sm font-semibold text-amber-400 tabular-nums" : "text-sm text-white tabular-nums"}>{value}</span>
  </div>
);

export default function PrintEconomicsCard({ bookId }) {
  const [format, setFormat] = useState("paperback");
  const [quantity, setQuantity] = useState(1);
  const [retailPrice, setRetailPrice] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("publishingGateway", {
      action: "calculate_print_cost",
      book_id: bookId,
      format,
      quantity: Number(quantity) || 1,
      retail_price: retailPrice ? Number(retailPrice) : null
    }).catch(() => null);
    setResult(res?.data || null);
    setLoading(false);
  };

  const fmt = (n) => (n == null ? "—" : `$${Number(n).toFixed(2)}`);

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Printer className="w-4 h-4 text-amber-400" /> Print Economics
      </h2>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="text-[11px] text-white/40 block mb-1">Format</label>
          <div className="flex gap-1">
            {["paperback", "hardcover"].map((f) => (
              <Button key={f} size="sm" variant={format === f ? "default" : "outline"}
                className="text-xs h-8 capitalize" onClick={() => setFormat(f)}>
                {f}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-20">
          <label className="text-[11px] text-white/40 block mb-1">Quantity</label>
          <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="w-28">
          <label className="text-[11px] text-white/40 block mb-1">Retail Price ($)</label>
          <Input type="number" min="0" step="0.01" value={retailPrice} onChange={(e) => setRetailPrice(e.target.value)} className="h-8 text-sm" placeholder="Optional" />
        </div>
        <Button size="sm" onClick={calculate} disabled={loading} className="h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Calculator className="w-3 h-3 mr-1" /> Calculate</>}
        </Button>
      </div>

      {result && (
        <div className="rounded-xl bg-white/3 border border-white/8 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">{result.page_count} pages · {result.word_count?.toLocaleString()} words</span>
            <Badge className={result.source === "lulu" ? "bg-emerald-500/20 text-emerald-300 border-0 text-[10px]" : "bg-amber-500/20 text-amber-300 border-0 text-[10px]"}>
              {result.source === "lulu" ? "Live provider quote" : "Internal estimate"}
            </Badge>
          </div>
          <div className="divide-y divide-white/5">
            <Row label={`Print cost (${result.quantity} unit${result.quantity > 1 ? "s" : ""})`} value={fmt(result.print_cost)} />
            <Row label="Shipping estimate" value={fmt(result.shipping_cost)} />
            <Row label="Total fulfillment cost" value={fmt(result.total_cost)} />
            <Row label="Recommended retail price" value={fmt(result.economics?.recommended_retail)} highlight />
            {result.economics?.margin_per_unit != null && (
              <>
                <Row label="Margin per unit" value={fmt(result.economics.margin_per_unit)} />
                <Row label="Author earnings per unit" value={fmt(result.economics.author_earnings_per_unit)} highlight />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}