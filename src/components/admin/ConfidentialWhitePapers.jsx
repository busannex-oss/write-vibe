// v2 — AI Generation + Trend Monitor + Auto-Update
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  FileText, Plus, Trash2, Edit3, Save, X, Lock, Download,
  Loader2, Eye, EyeOff, Sparkles, TrendingUp, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

const URGENCY_CONFIG = {
  low:    { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
  medium: { color: "bg-amber-500/20 text-amber-300 border-amber-500/30",       icon: AlertTriangle },
  high:   { color: "bg-red-500/20 text-red-300 border-red-500/30",             icon: AlertTriangle }
};

function TrendReport({ report, onAutoUpdate, isUpdating }) {
  if (!report) return null;
  const cfg = URGENCY_CONFIG[report.urgency] || URGENCY_CONFIG.low;
  const Icon = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-3">
      <div className={`rounded-xl border p-3 ${cfg.color}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon className="w-4 h-4" />
            Trend Monitor — {report.urgency?.toUpperCase()} urgency
          </div>
          {report.changes_detected && (
            <Button
              size="sm"
              onClick={onAutoUpdate}
              disabled={isUpdating}
              className="bg-white/20 hover:bg-white/30 text-white border-0 h-7 text-xs"
            >
              {isUpdating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Auto-Update Now
            </Button>
          )}
        </div>
        <p className="text-xs opacity-80">{report.summary}</p>
      </div>
      {report.new_trends?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-white/40 font-medium">NEW TRENDS DETECTED</p>
          {report.new_trends.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/60">
              <TrendingUp className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              {t}
            </div>
          ))}
        </div>
      )}
      {report.outdated_sections?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-white/40 font-medium">SECTIONS NEEDING UPDATE</p>
          {report.outdated_sections.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-300/70">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
        </div>
      )}
      {report.new_data_points?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-white/40 font-medium">NEW DATA POINTS</p>
          {report.new_data_points.map((d, i) => (
            <div key={i} className="text-xs text-white/50 pl-4">• {d}</div>
          ))}
        </div>
      )}
      <p className="text-xs text-white/30 italic">{report.recommendation}</p>
    </motion.div>
  );
}

export default function ConfidentialWhitePapers() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [trendReports, setTrendReports] = useState({});
  const [monitoringId, setMonitoringId] = useState(null);
  const [autoUpdatingId, setAutoUpdatingId] = useState(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [form, setForm] = useState({ title: "", industry: "AI book publishing", focus: "", content: "" });
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  const { data: whitePapers = [], isLoading } = useQuery({
    queryKey: ["white-papers"],
    queryFn: () => base44.entities.Document.filter({ type: "white_paper" })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["white-papers"] });
      setCreating(false);
      setForm({ title: "", industry: "AI book publishing", focus: "", content: "" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["white-papers"] });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["white-papers"] })
  });

  const handleGenerateContent = async () => {
    if (!form.title) return;
    setGeneratingContent(true);
    try {
      const res = await base44.functions.invoke("generateWhitePaper", {
        action: "generate",
        title: form.title,
        industry: form.industry,
        focus: form.focus
      });
      setForm(f => ({ ...f, content: res.data?.content || "" }));
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    createMutation.mutate({
      type: "white_paper",
      title: form.title,
      content: form.content,
      status: "final",
      book_id: "admin"
    });
  };

  const handleMonitorTrends = async (doc) => {
    setMonitoringId(doc.id);
    try {
      const res = await base44.functions.invoke("generateWhitePaper", {
        action: "monitor",
        document_id: doc.id,
        title: doc.title,
        content_preview: doc.content
      });
      setTrendReports(prev => ({ ...prev, [doc.id]: res.data?.trends }));
    } finally {
      setMonitoringId(null);
    }
  };

  const handleAutoUpdate = async (doc) => {
    setAutoUpdatingId(doc.id);
    try {
      const res = await base44.functions.invoke("generateWhitePaper", {
        action: "auto_update",
        document_id: doc.id,
        title: doc.title,
        existing_content: doc.content
      });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ["white-papers"] });
        setTrendReports(prev => ({ ...prev, [doc.id]: null }));
      }
    } finally {
      setAutoUpdatingId(null);
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setEditForm({ title: doc.title, content: doc.content });
  };

  const drawHorizBar = (pdf, x, y, maxW, val, maxVal, label, valLabel, colorRGB) => {
    const [r, g, b] = colorRGB;
    pdf.setFillColor(25, 35, 55); pdf.rect(x, y, maxW, 5, "F");
    pdf.setFillColor(r, g, b); pdf.rect(x, y, (val / maxVal) * maxW, 5, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(148, 163, 184);
    pdf.text(label, x - 2, y + 4, { align: "right" });
    pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold");
    pdf.text(valLabel, x + maxW + 2, y + 4);
  };

  const downloadPDF = (doc) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pw - 2 * margin;

    // ══════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════════════════════
    pdf.setFillColor(8, 12, 24);
    pdf.rect(0, 0, pw, ph, "F");
    // Left red accent
    pdf.setFillColor(220, 38, 38); pdf.rect(0, 0, 5, ph, "F");
    // Subtle grid lines (decorative)
    pdf.setDrawColor(20, 30, 50); pdf.setLineWidth(0.3);
    for (let gx = 12; gx < pw; gx += 18) { pdf.line(gx, 0, gx, ph); }

    // AuthorForge logo block — top right
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(pw - 60, 12, 46, 17, 2, 2, "F");
    pdf.setFillColor(239, 68, 68);
    pdf.roundedRect(pw - 59, 13, 6, 15, 1, 1, "F");
    pdf.setFontSize(8.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("AUTHORFORGE", pw - 51, 21.5);
    pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 116, 139);
    pdf.text("AI BOOK CREATION PLATFORM", pw - 51, 26);

    // Classification badge
    pdf.setFillColor(127, 29, 29);
    pdf.roundedRect(margin, 14, 72, 10, 2, 2, "F");
    pdf.setFontSize(7); pdf.setFont("helvetica", "bold"); pdf.setTextColor(252, 165, 165);
    pdf.text("STRICTLY CONFIDENTIAL  ·  INTERNAL USE ONLY", margin + 3, 20.5);

    // Main title
    pdf.setFontSize(24); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    const titleLines = pdf.splitTextToSize(doc.title, contentW);
    pdf.text(titleLines, margin, 55);

    // Document subtitle
    pdf.setFontSize(11); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 116, 139);
    pdf.text("AuthorForge  ·  Investment Research & Industry Analysis", margin, 55 + titleLines.length * 12 + 5);

    // Rule
    const ruleY = 82;
    pdf.setFillColor(220, 38, 38); pdf.rect(margin, ruleY, 30, 0.8, "F");
    pdf.setFillColor(30, 41, 59); pdf.rect(margin + 32, ruleY, contentW - 32, 0.8, "F");

    // Meta block
    const metaY = 90;
    pdf.setFillColor(12, 18, 34); pdf.roundedRect(margin, metaY, contentW, 56, 3, 3, "F");
    pdf.setFillColor(127, 29, 29); pdf.roundedRect(margin, metaY, contentW, 9, 3, 3, "F");
    pdf.rect(margin, metaY + 4, contentW, 5, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(252, 165, 165);
    pdf.text("DOCUMENT METADATA", margin + 4, metaY + 6.5);

    const col2 = margin + contentW / 2 + 4;
    const metaItems = [
      ["DATE ISSUED", new Date(doc.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
      ["DOCUMENT TYPE", "Investment-Grade White Paper"],
      ["PREPARED BY", "AuthorForge Research Division"],
      ["CLASSIFICATION", "STRICTLY CONFIDENTIAL"],
      ["DISTRIBUTION", "Board of Directors · Senior Leadership"],
      ["VERSION", "v1.0 — Initial Publication"]
    ];
    metaItems.forEach((item, i) => {
      const cx = i < 3 ? margin + 4 : col2;
      const row = i % 3;
      const iy = metaY + 16 + row * 14;
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
      pdf.text(item[0], cx, iy);
      pdf.setFontSize(7.5); pdf.setFont("helvetica", "bold");
      pdf.setTextColor(item[0] === "CLASSIFICATION" ? 252 : 203, item[0] === "CLASSIFICATION" ? 165 : 213, item[0] === "CLASSIFICATION" ? 165 : 225);
      pdf.text(item[1], cx, iy + 5.5);
    });

    // Platform snapshot box
    const snapY = metaY + 60;
    pdf.setFillColor(15, 23, 42); pdf.roundedRect(margin, snapY, contentW, 30, 3, 3, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(100, 116, 139);
    pdf.text("AUTHORFORGE AT A GLANCE", margin + 4, snapY + 7);
    const snap = [
      { k: "Founded", v: "2025" }, { k: "HQ", v: "Chicago, IL" }, { k: "TAM", v: "$47B" },
      { k: "Target ARR Yr5", v: "$24M" }, { k: "Gross Margin", v: "78%+" }, { k: "AI Features", v: "12+" }
    ];
    snap.forEach((s, i) => {
      const sx = margin + 4 + i * (contentW / 6);
      pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105); pdf.text(s.k, sx, snapY + 17);
      pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(239, 68, 68); pdf.text(s.v, sx, snapY + 24);
    });

    // Cover footer
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(25, 35, 55);
    pdf.text("PROPRIETARY & CONFIDENTIAL — This document is intended solely for authorized recipients. Unauthorized use is prohibited.", pw / 2, ph - 8, { align: "center" });

    // ══════════════════════════════════════════════════════════════
    // PAGE 2 — FINANCIAL CHARTS
    // ══════════════════════════════════════════════════════════════
    pdf.addPage();
    pdf.setFillColor(8, 12, 24); pdf.rect(0, 0, pw, ph, "F");
    pdf.setFillColor(220, 38, 38); pdf.rect(0, 0, 5, ph, "F");

    const wpPageHeader = () => {
      pdf.setFillColor(15, 23, 42); pdf.rect(0, 0, pw, 14, "F");
      pdf.setFillColor(220, 38, 38); pdf.rect(0, 13.5, pw, 0.5, "F");
      pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(239, 68, 68);
      pdf.text("AUTHORFORGE  ·  CONFIDENTIAL WHITE PAPER", margin, 9);
      pdf.setTextColor(71, 85, 105); pdf.setFont("helvetica", "normal");
      pdf.text(doc.title.slice(0, 55), pw - margin, 9, { align: "right" });
    };
    wpPageHeader();

    pdf.setFontSize(13); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("MARKET INTELLIGENCE OVERVIEW", margin, 25);
    pdf.setFillColor(239, 68, 68); pdf.rect(margin, 28, 35, 0.7, "F");
    pdf.setFontSize(7); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
    pdf.text("AuthorForge Platform — Financial & Market Data", margin, 33);

    // Revenue projection chart
    pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("AUTHORFORGE PROJECTED ARR ($USD MILLIONS)", margin, 42);
    const arrData = [
      { yr: "Yr 1", v: 0.18, label: "$180K" }, { yr: "Yr 2", v: 1.2, label: "$1.2M" },
      { yr: "Yr 3", v: 5.8, label: "$5.8M" }, { yr: "Yr 5", v: 24, label: "$24M" },
      { yr: "Yr 7", v: 68, label: "$68M" }, { yr: "Yr 10", v: 118, label: "$118M" }
    ];
    const chartX = margin, chartY = 46, chartW = contentW, chartH = 40;
    pdf.setFillColor(17, 24, 39); pdf.rect(chartX, chartY, chartW, chartH, "F");
    const maxV = 118;
    const bw = Math.floor((chartW - 14) / arrData.length) - 4;
    arrData.forEach((d, i) => {
      const bh = Math.max(2, (d.v / maxV) * (chartH - 14));
      const bx = chartX + 7 + i * (bw + 4);
      const by = chartY + chartH - 8 - bh;
      pdf.setFillColor(239, 68, 68); pdf.rect(bx, by, bw, bh, "F");
      pdf.setFontSize(5.5); pdf.setTextColor(148, 163, 184); pdf.setFont("helvetica", "normal");
      pdf.text(d.yr, bx + bw / 2, chartY + chartH - 3, { align: "center" });
      pdf.setTextColor(255, 255, 255);
      pdf.text(d.label, bx + bw / 2, by - 1.5, { align: "center" });
    });

    // Market sizing horizontal bars
    pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("MARKET OPPORTUNITY SIZING", margin, 96);
    pdf.setFillColor(239, 68, 68); pdf.rect(margin, 98.5, 28, 0.6, "F");
    const barMaxW = contentW - 38;
    const barStartX = margin + 32;
    drawHorizBar(pdf, barStartX, 104, barMaxW, 47, 47, "TAM", "$47B Global Publishing", [239, 68, 68]);
    drawHorizBar(pdf, barStartX, 114, barMaxW, 8.2, 47, "SAM", "$8.2B Self-Publishing Tools", [245, 158, 11]);
    drawHorizBar(pdf, barStartX, 124, barMaxW, 0.85, 47, "SOM", "$850M AI-Assisted Authoring", [16, 185, 129]);
    pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
    pdf.text("CAGR 34% through 2030 · Source: AuthorForge Strategic Research, 2025", margin, 133);

    // SaaS metrics
    const smY2 = 138;
    pdf.setFillColor(12, 18, 34); pdf.roundedRect(margin, smY2, contentW, 36, 3, 3, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(100, 116, 139);
    pdf.text("PLATFORM SAAS BENCHMARKS (TARGET)", margin + 4, smY2 + 7);
    const metrics2 = [
      { k: "Gross Margin", v: "78%" }, { k: "Churn Target", v: "<2%/mo" },
      { k: "LTV", v: "$2,400" }, { k: "CAC", v: "$180" },
      { k: "LTV:CAC", v: "13:1" }, { k: "NPS Target", v: "60+" }
    ];
    metrics2.forEach((m, i) => {
      const mx = margin + 4 + i * (contentW / 6);
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
      pdf.text(m.k, mx, smY2 + 18);
      pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.setTextColor(239, 68, 68);
      pdf.text(m.v, mx, smY2 + 27);
    });

    // Competitive landscape table
    const compY = 180;
    pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("COMPETITIVE LANDSCAPE", margin, compY);
    pdf.setFillColor(239, 68, 68); pdf.rect(margin, compY + 2.5, 26, 0.6, "F");
    const compHeaders = ["Platform", "AI Writing", "AI Cover", "AI Audio", "Distribution", "White-Label", "Pricing"];
    const compRows = [
      ["AuthorForge", "✓", "✓", "✓", "✓", "✓", "$29-$999/mo"],
      ["Scrivener", "✗", "✗", "✗", "✗", "✗", "$59 one-time"],
      ["Jasper AI", "✓", "✗", "✗", "✗", "✗", "$49-$125/mo"],
      ["Reedsy", "✗", "✓", "✗", "✓", "✗", "Project fees"],
    ];
    const colW = contentW / compHeaders.length;
    let tY = compY + 8;
    pdf.setFillColor(30, 41, 59); pdf.rect(margin - 2, tY - 3, contentW + 4, 7, "F");
    compHeaders.forEach((h, i) => {
      pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(100, 116, 139);
      pdf.text(h, margin + i * colW, tY + 1);
    });
    tY += 9;
    compRows.forEach((row, ri) => {
      if (ri === 0) { pdf.setFillColor(30, 58, 80); } else { pdf.setFillColor(ri % 2 === 0 ? 17 : 13, ri % 2 === 0 ? 24 : 18, ri % 2 === 0 ? 39 : 30); }
      pdf.rect(margin - 2, tY - 3, contentW + 4, 7, "F");
      row.forEach((cell, ci) => {
        pdf.setFontSize(6.5); pdf.setFont("helvetica", ci === 0 ? "bold" : "normal");
        pdf.setTextColor(cell === "✓" ? 52 : cell === "✗" ? 239 : ci === 0 && ri === 0 ? 96 : 180, cell === "✓" ? 211 : cell === "✗" ? 68 : ci === 0 && ri === 0 ? 165 : 190, cell === "✓" ? 153 : cell === "✗" ? 68 : ci === 0 && ri === 0 ? 250 : 210);
        pdf.text(cell, margin + ci * colW, tY + 1.5);
      });
      tY += 8;
    });

    // ══════════════════════════════════════════════════════════════
    // CONTENT PAGES
    // ══════════════════════════════════════════════════════════════
    const lines = (doc.content || "").split("\n");
    pdf.addPage();
    pdf.setFillColor(8, 12, 24); pdf.rect(0, 0, pw, ph, "F");
    pdf.setFillColor(220, 38, 38); pdf.rect(0, 0, 5, ph, "F");
    let y = 22;
    let pageNum = 3;

    const addPageHeader = () => {
      pdf.setFillColor(15, 23, 42); pdf.rect(0, 0, pw, 14, "F");
      pdf.setFillColor(220, 38, 38); pdf.rect(0, 13.5, pw, 0.5, "F");
      pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(239, 68, 68);
      pdf.text("AUTHORFORGE  ·  CONFIDENTIAL WHITE PAPER", margin, 9);
      pdf.setTextColor(71, 85, 105); pdf.setFont("helvetica", "normal");
      pdf.text(doc.title.slice(0, 55), pw - margin, 9, { align: "right" });
      y = 22;
    };
    const addPageFooter = (pn) => {
      pdf.setFillColor(15, 23, 42); pdf.rect(0, ph - 10, pw, 10, "F");
      pdf.setFillColor(220, 38, 38); pdf.rect(0, ph - 10, pw, 0.5, "F");
      pdf.setFontSize(6.5); pdf.setTextColor(71, 85, 105);
      pdf.text(`Page ${pn}`, pw / 2, ph - 4, { align: "center" });
      pdf.text("© AuthorForge " + new Date().getFullYear() + "  ·  CONFIDENTIAL", margin, ph - 4);
    };
    addPageHeader();

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) { y += 3; return; }
      const isHeader = /^[A-Z][A-Z\s&:()\/\-]{8,}$/.test(line) || /^\d+\.\s+[A-Z]/.test(line);
      const isBullet = /^[-•*]\s/.test(line);

      if (isHeader) {
        if (y > ph - 40) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
        if (y > 24) y += 3;
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin - 2, y - 4, contentW + 4, 11, "F");
        pdf.setFillColor(220, 38, 38);
        pdf.rect(margin - 2, y - 4, 3, 11, "F");
        pdf.setFontSize(8.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(239, 68, 68);
        pdf.text(line, margin + 5, y + 3);
        y += 14;
      } else if (isBullet) {
        const text = line.replace(/^[-•*]\s/, "");
        const wrapped = pdf.splitTextToSize(text, contentW - 8);
        wrapped.forEach((wl, wi) => {
          if (y > ph - 18) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
          pdf.setFontSize(8.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(148, 163, 184);
          if (wi === 0) { pdf.setFillColor(220, 38, 38); pdf.rect(margin, y - 2, 1.5, 1.5, "F"); }
          pdf.text(wl, margin + 5, y);
          y += 5;
        });
        y += 1;
      } else {
        pdf.setFontSize(8.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(180, 190, 210);
        const wrapped = pdf.splitTextToSize(line, contentW);
        wrapped.forEach((wl) => {
          if (y > ph - 18) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
          pdf.text(wl, margin, y);
          y += 5.2;
        });
      }
    });
    addPageFooter(pageNum);
    pdf.save(`${doc.title.replace(/\s+/g, "-")}-CONFIDENTIAL-AuthorForge.pdf`);
  };

  const extractDate = (content) => {
    if (!content) return null;
    const m = content.match(/\[(Generated|Last Updated):?\s+([^\]]+)\]/);
    return m ? m[0] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Confidential White Papers</h2>
            <p className="text-sm text-white/50">AI-generated, trend-monitored internal documents</p>
          </div>
        </div>
        <Button
          onClick={() => setCreating(!creating)}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          New White Paper
        </Button>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
        <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300">
          <strong>Strictly confidential.</strong> Visible to admins only. AI-generated with real-time market trend monitoring.
        </p>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="bg-white/5 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  New White Paper — AI-Powered Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 mb-1 block">Title / Topic *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. AI-Driven Self-Publishing in 2026"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 mb-1 block">Industry Context</Label>
                    <Input
                      value={form.industry}
                      onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))}
                      placeholder="e.g. AI book publishing, SaaS..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 mb-1 block">Focus Area (optional)</Label>
                  <Input
                    value={form.focus}
                    onChange={(e) => setForm(f => ({ ...f, focus: e.target.value }))}
                    placeholder="e.g. Market opportunity for indie authors using AI tools"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateContent}
                    disabled={!form.title || generatingContent}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  >
                    {generatingContent
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating white paper…</>
                      : <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>}
                  </Button>
                </div>
                {generatingContent && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Writing full industry-standard white paper with executive summary, market data, strategic recommendations…
                  </div>
                )}
                <div>
                  <Label className="text-white/70 mb-1 block">Content</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="AI-generated content will appear here, or write manually…"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[300px] font-mono text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !form.title || !form.content}
                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save White Paper
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setCreating(false); setForm({ title: "", industry: "AI book publishing", focus: "", content: "" }); }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin mx-auto" />
        </div>
      ) : whitePapers.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No white papers yet</h3>
            <p className="text-white/50">Use "New White Paper" and let AI generate an industry-standard document</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {whitePapers.map((doc, index) => {
            const dateTag = extractDate(doc.content);
            const trendReport = trendReports[doc.id];
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="bg-white/5 border-white/10 hover:border-red-500/20 transition-all">
                  <CardContent className="py-4">
                    {editingId === doc.id ? (
                      <div className="space-y-3">
                        <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} className="bg-white/5 border-white/20 text-white" />
                        <Textarea value={editForm.content} onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))} className="bg-white/5 border-white/20 text-white min-h-[200px] font-mono text-xs" />
                        <div className="flex gap-2">
                          <Button onClick={() => updateMutation.mutate({ id: doc.id, data: editForm })} disabled={updateMutation.isPending} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                            {updateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="font-medium text-white">{doc.title}</p>
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs flex-shrink-0">
                                <Lock className="w-2.5 h-2.5 mr-1" /> Confidential
                              </Badge>
                              {dateTag && (
                                <Badge className="bg-white/5 text-white/40 border-white/10 text-xs flex-shrink-0">
                                  <Clock className="w-2.5 h-2.5 mr-1" />{dateTag}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-white/30">
                              Created {new Date(doc.created_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              {doc.updated_date !== doc.created_date && ` · Updated ${new Date(doc.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button size="sm" variant="outline" onClick={() => handleMonitorTrends(doc)} disabled={monitoringId === doc.id} title="Check market trends" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-8 text-xs px-2">
                              {monitoringId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setViewingId(viewingId === doc.id ? null : doc.id)} className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8">
                              {viewingId === doc.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => startEdit(doc)} className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => downloadPDF(doc)} className="text-white/40 hover:text-amber-400 hover:bg-white/10 w-8 h-8">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => confirm("Permanently delete?") && deleteMutation.mutate(doc.id)} className="text-white/40 hover:text-red-400 hover:bg-red-500/10 w-8 h-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {viewingId === doc.id && (
                          <div className="bg-black/30 rounded-lg p-4 mt-3 max-h-80 overflow-y-auto">
                            <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed">{doc.content}</pre>
                          </div>
                        )}
                        <TrendReport report={trendReport} onAutoUpdate={() => handleAutoUpdate(doc)} isUpdating={autoUpdatingId === doc.id} />
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}