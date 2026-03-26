import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Download, FileText, FileSpreadsheet, Plus, Search,
  DollarSign, TrendingUp, CreditCard, RefreshCw,
  CheckCircle2, XCircle, Clock, AlertCircle, Loader2, Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

// ── helpers ──────────────────────────────────────────────────────────────────

const PLAN_PRICES = { starter: 19, professional: 49, enterprise: 99, white_label: 299 };

const STATUS_STYLES = {
  paid:     "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  pending:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  failed:   "bg-red-500/20 text-red-300 border-red-500/30",
  refunded: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  disputed: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

function fmtUSD(n) { return `$${(n || 0).toFixed(2)}`; }
function fmtDate(d) { return d ? format(new Date(d), "MMM d, yyyy") : "—"; }

function nextInvoiceNumber(payments) {
  const nums = payments.map(p => parseInt(p.invoice_number?.replace(/\D/g, "") || "0")).filter(Boolean);
  const max = nums.length ? Math.max(...nums) : 1000;
  return `INV-${max + 1}`;
}

// ── CSV / accounting export ───────────────────────────────────────────────────

function toCSV(rows) {
  const headers = [
    "Invoice Number","Date","Customer Name","Customer Email","Plan","Billing Cycle",
    "Amount (USD)","Currency","Status","Payment Method","Card Last 4",
    "Stripe Payment ID","Period Start","Period End","Description","Notes"
  ];
  const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  rows.forEach(p => {
    lines.push([
      p.invoice_number, fmtDate(p.created_date), p.user_name, p.user_email,
      p.plan, p.billing_cycle, (p.amount || 0).toFixed(2), p.currency || "USD",
      p.status, p.payment_method, p.payment_method_last4 || "",
      p.stripe_payment_id || "", fmtDate(p.period_start), fmtDate(p.period_end),
      p.description || "", p.notes || ""
    ].map(escape).join(","));
  });
  return lines.join("\r\n");
}

// QuickBooks IIF export
function toIIF(rows) {
  const header = `!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\n!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\n!ENDTRNS`;
  const trns = rows.map((p, i) => {
    const d = format(new Date(p.created_date || Date.now()), "MM/dd/yyyy");
    const amt = (p.amount || 0).toFixed(2);
    return [
      `TRNS\t${i + 1}\tINVOICE\t${d}\tAccounts Receivable\t${p.user_name || p.user_email}\t${amt}\t${p.invoice_number}\t${p.plan} membership`,
      `SPL\t${i + 1}\tINVOICE\t${d}\tMembership Revenue\t${p.user_name || p.user_email}\t-${amt}\t${p.invoice_number}\t${p.plan} membership`,
      `ENDTRNS`
    ].join("\n");
  });
  return [header, ...trns].join("\n");
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── PDF export (pure JS, no library) ─────────────────────────────────────────

async function exportPDF(rows, dateRange) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297; const margin = 14;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("AuthorForge — Payments & Revenue Report", margin, 12);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 180, 180);
  doc.text(`Generated: ${format(new Date(), "PPP")}   |   Period: ${dateRange}`, margin, 20);

  // Summary row
  const totalPaid = rows.filter(r => r.status === "paid").reduce((s, r) => s + (r.amount || 0), 0);
  const totalRefunded = rows.filter(r => r.status === "refunded").reduce((s, r) => s + (r.amount || 0), 0);
  const totalFailed = rows.filter(r => r.status === "failed").length;
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 28, pageW, 18, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(`Total Revenue: $${totalPaid.toFixed(2)}`, margin, 39);
  doc.text(`Refunded: $${totalRefunded.toFixed(2)}`, 100, 39);
  doc.text(`Net Revenue: $${(totalPaid - totalRefunded).toFixed(2)}`, 170, 39);
  doc.text(`Transactions: ${rows.length}  |  Failed: ${totalFailed}`, 240, 39);

  // Table
  const cols = ["Invoice","Date","Customer","Plan","Cycle","Amount","Method","Status"];
  const colW =  [28, 25, 55, 25, 18, 22, 22, 20];
  let y = 54;
  doc.setFillColor(51, 65, 85);
  doc.rect(margin, y - 5, pageW - margin * 2, 8, "F");
  doc.setTextColor(245, 158, 11); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  let x = margin;
  cols.forEach((c, i) => { doc.text(c, x + 1, y); x += colW[i]; });
  y += 6;
  doc.setFont("helvetica", "normal"); doc.setTextColor(220, 220, 220);
  rows.forEach((p, idx) => {
    if (y > 185) { doc.addPage(); y = 20; }
    if (idx % 2 === 0) { doc.setFillColor(20, 30, 48); doc.rect(margin, y - 4, pageW - margin * 2, 7, "F"); }
    x = margin;
    const vals = [
      p.invoice_number || "—", fmtDate(p.created_date),
      (p.user_name || p.user_email || "").slice(0, 28),
      p.plan || "—", p.billing_cycle || "—",
      fmtUSD(p.amount), p.payment_method || "card", p.status || "—"
    ];
    vals.forEach((v, i) => { doc.text(String(v), x + 1, y); x += colW[i]; });
    y += 7;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(100, 100, 100);
    doc.text("CONFIDENTIAL — AuthorForge Financial Report", margin, 205);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin - 20, 205);
  }

  doc.save(`authorforge-payments-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// ── Add Payment Modal ─────────────────────────────────────────────────────────

function AddPaymentModal({ onClose, onSave, nextInvoice }) {
  const [form, setForm] = useState({
    user_email: "", user_name: "", plan: "professional", billing_cycle: "monthly",
    amount: "", status: "paid", payment_method: "card", payment_method_last4: "",
    stripe_payment_id: "", invoice_number: nextInvoice, description: "", notes: "",
    period_start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    period_end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Record Payment</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Customer Email *", key: "user_email", type: "email" },
            { label: "Customer Name", key: "user_name" },
            { label: "Invoice #", key: "invoice_number" },
            { label: "Amount (USD) *", key: "amount", type: "number" },
            { label: "Stripe Payment ID", key: "stripe_payment_id" },
            { label: "Card Last 4", key: "payment_method_last4" },
            { label: "Period Start", key: "period_start", type: "date" },
            { label: "Period End", key: "period_end", type: "date" },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-white/60 text-xs mb-1 block">{f.label}</Label>
              <Input type={f.type || "text"} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                className="bg-white/5 border-white/20 text-white text-sm" />
            </div>
          ))}
          {[
            { label: "Plan", key: "plan", opts: ["starter","professional","enterprise","white_label"] },
            { label: "Billing Cycle", key: "billing_cycle", opts: ["monthly","yearly"] },
            { label: "Status", key: "status", opts: ["paid","pending","failed","refunded","disputed"] },
            { label: "Payment Method", key: "payment_method", opts: ["card","apple_pay","google_pay","bank_transfer"] },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-white/60 text-xs mb-1 block">{f.label}</Label>
              <select value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white text-sm">
                {f.opts.map(o => <option key={o} value={o}>{o.replace(/_/g," ")}</option>)}
              </select>
            </div>
          ))}
          <div className="col-span-2">
            <Label className="text-white/60 text-xs mb-1 block">Description</Label>
            <Input value={form.description} onChange={e => set("description", e.target.value)}
              className="bg-white/5 border-white/20 text-white text-sm" />
          </div>
          <div className="col-span-2">
            <Label className="text-white/60 text-xs mb-1 block">Internal Notes</Label>
            <Input value={form.notes} onChange={e => set("notes", e.target.value)}
              className="bg-white/5 border-white/20 text-white text-sm" />
          </div>
        </div>
        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">Cancel</Button>
          <Button onClick={() => onSave(form)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            Save Payment
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PaymentsAccounting() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [exportLoading, setExportLoading] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500)
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Payment.create({ ...data, amount: parseFloat(data.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payments"] }); setShowAdd(false); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Payment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] })
  });

  // Month options
  const monthOptions = useMemo(() => {
    const opts = [{ label: "All Time", value: "all" }];
    for (let i = 0; i < 12; i++) {
      const d = subMonths(new Date(), i);
      opts.push({ label: format(d, "MMMM yyyy"), value: format(d, "yyyy-MM") });
    }
    return opts;
  }, []);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !search || [p.user_email, p.user_name, p.invoice_number].some(v => v?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchPlan = filterPlan === "all" || p.plan === filterPlan;
      const matchMonth = filterMonth === "all" || format(new Date(p.created_date || Date.now()), "yyyy-MM") === filterMonth;
      return matchSearch && matchStatus && matchPlan && matchMonth;
    });
  }, [payments, search, filterStatus, filterPlan, filterMonth]);

  const stats = useMemo(() => {
    const paid = filtered.filter(p => p.status === "paid");
    const refunded = filtered.filter(p => p.status === "refunded");
    return {
      totalRevenue: paid.reduce((s, p) => s + (p.amount || 0), 0),
      totalRefunded: refunded.reduce((s, p) => s + (p.amount || 0), 0),
      netRevenue: paid.reduce((s, p) => s + (p.amount || 0), 0) - refunded.reduce((s, p) => s + (p.amount || 0), 0),
      count: filtered.length,
      mrr: paid.filter(p => p.billing_cycle === "monthly").reduce((s, p) => s + (p.amount || 0), 0),
    };
  }, [filtered]);

  const dateRange = filterMonth === "all" ? "All Time" : format(new Date(filterMonth + "-01"), "MMMM yyyy");

  const handleExport = async (type) => {
    setExportLoading(type);
    try {
      if (type === "pdf") {
        await exportPDF(filtered, dateRange);
      } else if (type === "csv") {
        downloadFile(toCSV(filtered), `authorforge-payments-${format(new Date(), "yyyy-MM-dd")}.csv`, "text/csv;charset=utf-8;");
      } else if (type === "iif") {
        downloadFile(toIIF(filtered), `authorforge-quickbooks-${format(new Date(), "yyyy-MM-dd")}.iif`, "text/plain");
      } else if (type === "json") {
        // Sage / generic JSON export (standard accounting JSON)
        const export_data = {
          export_info: { generated: new Date().toISOString(), platform: "AuthorForge", period: dateRange },
          summary: { total_revenue: stats.totalRevenue, total_refunded: stats.totalRefunded, net_revenue: stats.netRevenue, transaction_count: stats.count },
          transactions: filtered.map(p => ({
            id: p.invoice_number, date: fmtDate(p.created_date), customer_email: p.user_email,
            customer_name: p.user_name, product: p.plan + " membership (" + p.billing_cycle + ")",
            amount: p.amount, currency: p.currency || "USD", status: p.status,
            payment_method: p.payment_method, reference: p.stripe_payment_id,
            period_start: p.period_start, period_end: p.period_end, notes: p.notes
          }))
        };
        downloadFile(JSON.stringify(export_data, null, 2), `authorforge-accounting-${format(new Date(), "yyyy-MM-dd")}.json`, "application/json");
      }
    } finally {
      setExportLoading("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue", value: fmtUSD(stats.totalRevenue), icon: DollarSign, color: "text-emerald-400" },
          { label: "Net Revenue", value: fmtUSD(stats.netRevenue), icon: TrendingUp, color: "text-amber-400" },
          { label: "MRR", value: fmtUSD(stats.mrr), icon: RefreshCw, color: "text-blue-400" },
          { label: "Refunded", value: fmtUSD(stats.totalRefunded), icon: CreditCard, color: "text-orange-400" },
          { label: "Transactions", value: stats.count, icon: FileText, color: "text-purple-400" },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="py-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color} flex-shrink-0`} />
              <div>
                <p className="text-xs text-white/40">{s.label}</p>
                <p className="text-lg font-bold text-white">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search customer, invoice…" className="pl-9 bg-white/5 border-white/20 text-white w-56" />
              </div>
              {[
                { label: "Status", state: filterStatus, set: setFilterStatus, opts: ["all","paid","pending","failed","refunded","disputed"] },
                { label: "Plan", state: filterPlan, set: setFilterPlan, opts: ["all","starter","professional","enterprise","white_label"] },
              ].map(f => (
                <select key={f.label} value={f.state} onChange={e => f.set(e.target.value)}
                  className="h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white text-sm">
                  {f.opts.map(o => <option key={o} value={o}>{o === "all" ? `All ${f.label}s` : o.replace(/_/g," ")}</option>)}
                </select>
              ))}
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white text-sm">
                {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Export buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => handleExport("pdf")} disabled={!!exportLoading}
                className="border-red-500/30 text-red-300 hover:bg-red-500/10 gap-1.5">
                {exportLoading === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport("csv")} disabled={!!exportLoading}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 gap-1.5">
                {exportLoading === "csv" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                CSV / Excel
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport("iif")} disabled={!!exportLoading}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 gap-1.5">
                {exportLoading === "iif" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                QuickBooks
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport("json")} disabled={!!exportLoading}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5">
                {exportLoading === "json" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Sage / JSON
              </Button>
              <Button size="sm" onClick={() => setShowAdd(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility note */}
      <div className="flex items-center gap-2 text-xs text-white/30 px-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
        Exports compatible with QuickBooks (IIF), Sage, Xero, FreshBooks, Wave, Zoho Books, and any platform that imports CSV or JSON.
      </div>

      {/* Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Transactions</CardTitle>
          <CardDescription className="text-white/40">{filtered.length} records · {dateRange}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                    {["Invoice","Date","Customer","Plan","Cycle","Amount","Method","Status","Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 text-white/60 font-mono text-xs">{p.invoice_number || "—"}</td>
                      <td className="py-3 px-2 text-white/60 whitespace-nowrap">{fmtDate(p.created_date)}</td>
                      <td className="py-3 px-2">
                        <div className="text-white font-medium truncate max-w-[140px]">{p.user_name || p.user_email}</div>
                        <div className="text-white/40 text-xs truncate max-w-[140px]">{p.user_name ? p.user_email : ""}</div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs capitalize">{p.plan}</Badge>
                      </td>
                      <td className="py-3 px-2 text-white/50 capitalize text-xs">{p.billing_cycle}</td>
                      <td className="py-3 px-2 text-white font-semibold">{fmtUSD(p.amount)}</td>
                      <td className="py-3 px-2 text-white/50 text-xs capitalize">{(p.payment_method || "card").replace(/_/g," ")}</td>
                      <td className="py-3 px-2">
                        <Badge className={`text-xs capitalize ${STATUS_STYLES[p.status] || ""}`}>{p.status}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        {p.status === "paid" && (
                          <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: p.id, data: { status: "refunded" } })}
                            className="text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 h-7 px-2">
                            Refund
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showAdd && (
        <AddPaymentModal
          nextInvoice={nextInvoiceNumber(payments)}
          onClose={() => setShowAdd(false)}
          onSave={data => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}