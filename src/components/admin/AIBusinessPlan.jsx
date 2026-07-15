// v1 — AI 30-Year Strategic Business Plan
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
  Briefcase, Plus, Trash2, Edit3, Save, X, Lock, Download,
  Loader2, Eye, EyeOff, Sparkles, Calendar, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

const PHASES = [
  { label: "Phase 1 (Years 1–5)", key: "phase1", color: "text-emerald-400" },
  { label: "Phase 2 (Years 6–10)", key: "phase2", color: "text-amber-400" },
  { label: "Phase 3 (Years 11–20)", key: "phase3", color: "text-blue-400" },
  { label: "Phase 4 (Years 21–30)", key: "phase4", color: "text-purple-400" },
];

export default function AIBusinessPlan() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [form, setForm] = useState({
    company_name: "Write Vibe",
    tagline: "AI-Powered Book Creation Platform",
    industry: "AI SaaS / Publishing Technology",
    headquarters: "",
    founded: "2025",
    mission: ""
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["business-plans"],
    queryFn: () => base44.entities.Document.filter({ type: "white_paper", status: "draft" })
      .then(docs => docs.filter(d => d.title?.startsWith("[BIZPLAN]")))
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-plans"] });
      setCreating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-plans"] });
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-plans"] })
  });

  const saveFinalMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.update(id, { status: "final" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-plans"] })
  });

  const handleGenerate = async () => {
    if (!form.company_name) return;
    setGeneratingId("new");
    try {
      const res = await base44.functions.invoke("generateWhitePaper", {
        action: "bizplan",
        company_name: form.company_name,
        tagline: form.tagline,
        industry: form.industry,
        headquarters: form.headquarters,
        founded: form.founded,
        mission: form.mission
      });

      const content = res.data?.content || "";

      createMutation.mutate({
        type: "white_paper",
        status: "draft",
        book_id: "admin",
        title: `[BIZPLAN] ${form.company_name} — 30-Year Strategic Business Plan`,
        content: content
      });
    } finally {
      setGeneratingId(null);
    }
  };

  // Draw a bar chart using jsPDF primitives
  const drawBarChart = (pdf, x, y, w, h, data, chartTitle, color) => {
    const [r, g, b] = color;
    pdf.setFillColor(17, 24, 39);
    pdf.rect(x, y, w, h, "F");
    pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(chartTitle, x + 2, y - 2);
    const maxVal = Math.max(...data.map(d => d.value));
    const barW = Math.floor((w - 12) / data.length) - 3;
    data.forEach((d, i) => {
      const barH = Math.max(2, ((d.value / maxVal) * (h - 16)));
      const bx = x + 6 + i * (barW + 3);
      const by = y + h - 10 - barH;
      pdf.setFillColor(r, g, b);
      pdf.rect(bx, by, barW, barH, "F");
      pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal");
      pdf.setTextColor(148, 163, 184);
      pdf.text(d.label, bx + barW / 2, y + h - 4, { align: "center" });
      pdf.setTextColor(255, 255, 255);
      pdf.text(d.display, bx + barW / 2, by - 1.5, { align: "center" });
    });
  };

  const drawHorizBar = (pdf, x, y, maxW, val, maxVal, label, valLabel, color) => {
    const [r, g, b] = color;
    const barW = (val / maxVal) * maxW;
    pdf.setFillColor(30, 41, 59); pdf.rect(x, y, maxW, 5, "F");
    pdf.setFillColor(r, g, b); pdf.rect(x, y, barW, 5, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "normal");
    pdf.setTextColor(203, 213, 225);
    pdf.text(label, x - 2, y + 4, { align: "right" });
    pdf.setTextColor(255, 255, 255);
    pdf.text(valLabel, x + maxW + 2, y + 4);
  };

  const downloadPDF = (doc) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pw - 2 * margin;
    const title = displayTitle(doc);
    const companyName = title.replace(/ — 30-Year Strategic Business Plan.*/, "").replace("[BIZPLAN] ", "");

    // ══════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════════════════════
    pdf.setFillColor(7, 11, 22);
    pdf.rect(0, 0, pw, ph, "F");
    // Left accent stripe
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 5, ph, "F");
    // Gold accent stripe
    pdf.setFillColor(245, 158, 11);
    pdf.rect(0, ph / 2 - 1, 5, 2, "F");

    // Write Vibe logo block (top-right)
    pdf.setFillColor(17, 24, 39);
    pdf.roundedRect(pw - 58, 12, 44, 16, 2, 2, "F");
    pdf.setFillColor(245, 158, 11);
    pdf.roundedRect(pw - 57, 13, 6, 14, 1, 1, "F");
    pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("WRITE VIBE", pw - 49, 21.5);
    pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 116, 139);
    pdf.text("AI BOOK CREATION PLATFORM", pw - 49, 25.5);

    // Document type badge
    pdf.setFillColor(30, 58, 138);
    pdf.roundedRect(margin, 15, 80, 10, 2, 2, "F");
    pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(147, 197, 253);
    pdf.text("STRATEGIC BUSINESS PLAN  ·  30-YEAR HORIZON", margin + 4, 21.5);

    // Main title
    pdf.setFontSize(26); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    const titleLines = pdf.splitTextToSize(companyName, contentW - 4);
    pdf.text(titleLines, margin, 55);

    // Subtitle line
    pdf.setFontSize(12); pdf.setFont("helvetica", "normal");
    pdf.setTextColor(96, 165, 250);
    pdf.text("Comprehensive 30-Year Strategic Business Plan", margin, 55 + titleLines.length * 13 + 4);

    // Gold rule
    const ruleY = 82;
    pdf.setFillColor(245, 158, 11);
    pdf.rect(margin, ruleY, 50, 0.8, "F");
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin + 52, ruleY, contentW - 52, 0.8, "F");

    // Meta info grid
    const metaY = 90;
    pdf.setFillColor(13, 20, 38);
    pdf.roundedRect(margin, metaY, contentW, 58, 3, 3, "F");
    pdf.setFillColor(30, 58, 138);
    pdf.roundedRect(margin, metaY, contentW, 9, 3, 3, "F");
    pdf.rect(margin, metaY + 4, contentW, 5, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(147, 197, 253);
    pdf.text("DOCUMENT METADATA", margin + 4, metaY + 6.5);

    const metaItems = [
      ["DATE GENERATED", new Date(doc.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
      ["DOCUMENT CLASS", "Strictly Confidential — Board Use Only"],
      ["PLANNING HORIZON", "30 Years · 2025–2055"],
      ["PREPARED BY", "Write Vibe Strategic Intelligence"],
      ["DOCUMENT VERSION", "v1.0 — Initial Release"],
      ["STATUS", doc.status === "final" ? "FINAL — APPROVED" : "DRAFT — PENDING APPROVAL"]
    ];
    const col1X = margin + 4, col2X = margin + contentW / 2 + 4;
    metaItems.forEach((item, i) => {
      const col = i < 3 ? col1X : col2X;
      const row = i % 3;
      const iy = metaY + 16 + row * 14;
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
      pdf.text(item[0], col, iy);
      pdf.setFontSize(7.5); pdf.setFont("helvetica", "bold");
      pdf.setTextColor(item[0] === "STATUS" && doc.status === "final" ? 52 : 255, item[0] === "STATUS" && doc.status === "final" ? 211 : 255, item[0] === "STATUS" && doc.status === "final" ? 153 : 255);
      pdf.text(item[1], col, iy + 5.5);
    });

    // Revenue at a glance
    const glanceY = metaY + 62;
    pdf.setFillColor(17, 24, 39);
    pdf.roundedRect(margin, glanceY, contentW, 32, 3, 3, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(100, 116, 139);
    pdf.text("PROJECTED ARR MILESTONES", margin + 4, glanceY + 7);
    const snapshots = [
      { yr: "Yr 1", v: "$180K" }, { yr: "Yr 3", v: "$5.8M" }, { yr: "Yr 5", v: "$24M" },
      { yr: "Yr 10", v: "$118M" }, { yr: "Yr 20", v: "$490M" }, { yr: "Yr 30", v: "$1.9B" }
    ];
    snapshots.forEach((s, i) => {
      const sx = margin + 4 + i * (contentW / 6);
      pdf.setFontSize(5.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
      pdf.text(s.yr, sx, glanceY + 17);
      pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(245, 158, 11);
      pdf.text(s.v, sx, glanceY + 24);
    });

    // Cover footer
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(30, 41, 59);
    pdf.text("PROPRIETARY & CONFIDENTIAL — Unauthorized reproduction or distribution of this document is strictly prohibited.", pw / 2, ph - 8, { align: "center" });

    // ══════════════════════════════════════════════════════════════
    // PAGE 2 — TABLE OF CONTENTS
    // ══════════════════════════════════════════════════════════════
    pdf.addPage();
    pdf.setFillColor(7, 11, 22); pdf.rect(0, 0, pw, ph, "F");
    pdf.setFillColor(59, 130, 246); pdf.rect(0, 0, 5, ph, "F");

    const tocHeader = () => {
      pdf.setFillColor(17, 24, 39); pdf.rect(0, 0, pw, 14, "F");
      pdf.setFillColor(245, 158, 11); pdf.rect(0, 13.5, pw, 0.5, "F");
      pdf.setFontSize(7); pdf.setFont("helvetica", "bold"); pdf.setTextColor(245, 158, 11);
      pdf.text("WRITE VIBE  ·  STRATEGIC BUSINESS PLAN  ·  CONFIDENTIAL", margin, 9);
    };
    tocHeader();
    pdf.setFontSize(16); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("TABLE OF CONTENTS", margin, 28);
    pdf.setFillColor(245, 158, 11); pdf.rect(margin, 31, 35, 0.8, "F");

    const tocSections = [
      { n: "1", t: "Executive Summary", p: "3" },
      { n: "2", t: "Company Overview & Value Proposition", p: "3" },
      { n: "3", t: "Market Analysis & Sizing", p: "4" },
      { n: "4", t: "Product Roadmap", p: "4" },
      { n: "5", t: "Phase 1 Strategy — Years 1–5 (2025–2030)", p: "5" },
      { n: "6", t: "Phase 2 Strategy — Years 6–10 (2031–2035)", p: "5" },
      { n: "7", t: "Phase 3 Strategy — Years 11–20 (2036–2045)", p: "6" },
      { n: "8", t: "Phase 4 Strategy — Years 21–30 (2046–2055)", p: "6" },
      { n: "9", t: "Financial Projections & SaaS Metrics", p: "7" },
      { n: "10", t: "Risk Analysis & Mitigation", p: "8" },
      { n: "11", t: "Technology & AI Strategy", p: "8" },
      { n: "12", t: "Organizational Design", p: "9" },
      { n: "13", t: "Investor Value Proposition", p: "9" },
      { n: "14", t: "Conclusion & 90-Day Action Plan", p: "10" },
    ];
    let tocY = 40;
    tocSections.forEach((s, i) => {
      const isAlt = i % 2 === 0;
      if (isAlt) { pdf.setFillColor(17, 24, 39); pdf.rect(margin - 2, tocY - 3, contentW + 4, 8, "F"); }
      pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(96, 165, 250);
      pdf.text(s.n + ".", margin + 1, tocY + 2);
      pdf.setFont("helvetica", "normal"); pdf.setTextColor(203, 213, 225);
      pdf.text(s.t, margin + 10, tocY + 2);
      pdf.setTextColor(71, 85, 105);
      pdf.text(s.p, pw - margin, tocY + 2, { align: "right" });
      tocY += 9;
    });

    // ══════════════════════════════════════════════════════════════
    // PAGE 3 — FINANCIAL CHARTS
    // ══════════════════════════════════════════════════════════════
    pdf.addPage();
    pdf.setFillColor(7, 11, 22); pdf.rect(0, 0, pw, ph, "F");
    pdf.setFillColor(59, 130, 246); pdf.rect(0, 0, 5, ph, "F");
    tocHeader();

    pdf.setFontSize(13); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("FINANCIAL OVERVIEW", margin, 26);
    pdf.setFillColor(245, 158, 11); pdf.rect(margin, 29, 30, 0.8, "F");
    pdf.setFontSize(7); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
    pdf.text("Projected ARR · EBITDA · Market Sizing", margin, 34);

    // ARR Bar Chart
    const revenueData = [
      { label: "Yr 1", value: 0.18, display: "$180K" },
      { label: "Yr 2", value: 1.2, display: "$1.2M" },
      { label: "Yr 3", value: 5.8, display: "$5.8M" },
      { label: "Yr 5", value: 24, display: "$24M" },
      { label: "Yr 10", value: 118, display: "$118M" },
      { label: "Yr 20", value: 490, display: "$490M" },
    ];
    drawBarChart(pdf, margin, 42, contentW, 45, revenueData, "PROJECTED ARR (USD)", [59, 130, 246]);

    // EBITDA Bar Chart
    const ebitdaData = [
      { label: "Yr 1", value: 0.1, display: "-$420K" },
      { label: "Yr 2", value: 0.5, display: "-$180K" },
      { label: "Yr 3", value: 1.5, display: "$580K" },
      { label: "Yr 5", value: 6.2, display: "$6.2M" },
      { label: "Yr 10", value: 38, display: "$38M" },
      { label: "Yr 20", value: 172, display: "$172M" },
    ];
    drawBarChart(pdf, margin, 98, contentW, 42, ebitdaData, "PROJECTED EBITDA (USD)", [16, 185, 129]);

    // Market sizing horizontal bars
    pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
    pdf.text("MARKET OPPORTUNITY", margin, 152);
    pdf.setFillColor(245, 158, 11); pdf.rect(margin, 154.5, 30, 0.6, "F");
    const barMaxW = contentW - 40;
    const barX = margin + 36;
    drawHorizBar(pdf, barX, 160, barMaxW, 47, 47, "TAM", "$47B", [59, 130, 246]);
    drawHorizBar(pdf, barX, 170, barMaxW, 8.2, 47, "SAM", "$8.2B", [245, 158, 11]);
    drawHorizBar(pdf, barX, 180, barMaxW, 0.85, 47, "SOM", "$850M", [16, 185, 129]);
    pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
    pdf.text("TAM = Total Addressable Market (Global Publishing)  ·  SAM = Self-Publishing Tools  ·  SOM = AI-Assisted Authoring (2025)", margin, 193);

    // SaaS metrics panel
    const smY = 198;
    pdf.setFillColor(13, 20, 38); pdf.roundedRect(margin, smY, contentW, 36, 3, 3, "F");
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(100, 116, 139);
    pdf.text("KEY SAAS METRICS (TARGET)", margin + 4, smY + 7);
    const metrics = [
      { k: "Gross Margin", v: "78%+" }, { k: "Monthly Churn", v: "<2%" },
      { k: "LTV", v: "$2,400" }, { k: "CAC", v: "$180" },
      { k: "LTV:CAC", v: "13:1" }, { k: "NPS Target", v: "60+" }
    ];
    metrics.forEach((m, i) => {
      const mx = margin + 4 + i * (contentW / 6);
      pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(71, 85, 105);
      pdf.text(m.k, mx, smY + 17);
      pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.setTextColor(96, 165, 250);
      pdf.text(m.v, mx, smY + 26);
    });

    // ══════════════════════════════════════════════════════════════
    // CONTENT PAGES
    // ══════════════════════════════════════════════════════════════
    const lines = (doc.content || "").split("\n");
    pdf.addPage();
    let y = 22;
    let pageNum = 4;

    const addPageHeader = () => {
      pdf.setFillColor(7, 11, 22); pdf.rect(0, 0, pw, 14, "F");
      pdf.setFillColor(245, 158, 11); pdf.rect(0, 13.5, pw, 0.5, "F");
      pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(245, 158, 11);
      pdf.text("WRITE VIBE  ·  STRATEGIC BUSINESS PLAN  ·  CONFIDENTIAL", margin, 9);
      pdf.setTextColor(71, 85, 105); pdf.setFont("helvetica", "normal");
      pdf.text(companyName.slice(0, 50), pw - margin, 9, { align: "right" });
      y = 22;
    };
    const addPageFooter = (pn) => {
      pdf.setFillColor(7, 11, 22); pdf.rect(0, ph - 10, pw, 10, "F");
      pdf.setFillColor(59, 130, 246); pdf.rect(0, ph - 10, pw, 0.5, "F");
      pdf.setFontSize(6.5); pdf.setTextColor(71, 85, 105);
      pdf.text(`Page ${pn}`, pw / 2, ph - 4, { align: "center" });
      pdf.text("© Write Vibe " + new Date().getFullYear() + "  ·  CONFIDENTIAL", margin, ph - 4);
    };
    addPageHeader();

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) { y += 3.5; return; }
      const isPhaseHeader = /^PHASE \d/i.test(line);
      const isMainHeader = /^[A-Z][A-Z\s&:()\/\-]{8,}$/.test(line) || /^\d+\.\s+[A-Z]/.test(line) || /^TABLE OF CONTENTS/i.test(line);
      const isBullet = /^[-•*]\s/.test(line);

      if (isPhaseHeader) {
        if (y > ph - 50) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
        pdf.setFillColor(30, 58, 138);
        pdf.roundedRect(margin - 2, y - 5, contentW + 4, 14, 2, 2, "F");
        pdf.setFillColor(245, 158, 11);
        pdf.rect(margin - 2, y - 5, 4, 14, "F");
        pdf.setFontSize(10); pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
        pdf.text(line, margin + 6, y + 4);
        y += 18;
      } else if (isMainHeader) {
        if (y > ph - 40) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
        if (y > 24) y += 3;
        pdf.setFillColor(17, 24, 39);
        pdf.rect(margin - 2, y - 4, contentW + 4, 11, "F");
        pdf.setFillColor(245, 158, 11);
        pdf.rect(margin - 2, y - 4, 3, 11, "F");
        pdf.setFontSize(8.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(245, 158, 11);
        pdf.text(line, margin + 5, y + 3);
        y += 14;
      } else if (isBullet) {
        const text = line.replace(/^[-•*]\s/, "");
        pdf.setFontSize(8.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(148, 163, 184);
        const wrapped = pdf.splitTextToSize(text, contentW - 8);
        wrapped.forEach((wl, wi) => {
          if (y > ph - 18) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
          if (wi === 0) { pdf.setFillColor(245, 158, 11); pdf.rect(margin, y - 2, 1.5, 1.5, "F"); }
          pdf.setTextColor(148, 163, 184);
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
    pdf.save(`${companyName.replace(/\s+/g, "-")}-30YR-Strategic-Plan.pdf`);
  };

  const displayTitle = (doc) => doc.title.replace("[BIZPLAN] ", "");

  const parsePhases = (content) => {
    if (!content) return {};
    const result = {};
    PHASES.forEach(p => {
      const regex = new RegExp(`PHASE ${p.key.replace("phase", "")}[^\\n]*\\n([\\s\\S]*?)(?=PHASE \\d|FINANCIAL PROJECTIONS|RISK ANALYSIS|$)`, "i");
      const match = content.match(regex);
      result[p.key] = match ? match[1].trim().slice(0, 800) : null;
    });
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Business Plans</h2>
            <p className="text-sm text-white/50">Comprehensive 30-year strategic plans written by AI</p>
          </div>
        </div>
        <Button
          onClick={() => setCreating(!creating)}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Business Plan
        </Button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center gap-3">
        <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          <strong>Strictly confidential.</strong> AI-generated 30-year strategic business plans for internal use only.
        </p>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="bg-white/5 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Generate 30-Year Strategic Business Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 mb-1 block">Company Name *</Label>
                    <Input value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} className="bg-white/5 border-white/20 text-white" />
                  </div>
                  <div>
                    <Label className="text-white/70 mb-1 block">Tagline</Label>
                    <Input value={form.tagline} onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))} className="bg-white/5 border-white/20 text-white" />
                  </div>
                  <div>
                    <Label className="text-white/70 mb-1 block">Industry</Label>
                    <Input value={form.industry} onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))} className="bg-white/5 border-white/20 text-white" />
                  </div>
                  <div>
                    <Label className="text-white/70 mb-1 block">Headquarters</Label>
                    <Input value={form.headquarters} onChange={(e) => setForm(f => ({ ...f, headquarters: e.target.value }))} placeholder="e.g. Austin, TX" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 mb-1 block">Mission Statement</Label>
                  <Textarea value={form.mission} onChange={(e) => setForm(f => ({ ...f, mission: e.target.value }))} placeholder="e.g. To democratize professional book publishing through AI..." className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[80px]" />
                </div>

                {generatingId === "new" && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-medium text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claude Sonnet is writing your 30-year business plan…
                    </div>
                    <p className="text-xs text-amber-300/60">This takes 30–60 seconds. Generating executive summary, 4 strategic phases, financial projections, risk analysis, org design…</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={!form.company_name || generatingId === "new"}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                  >
                    {generatingId === "new"
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                      : <><Sparkles className="w-4 h-4 mr-2" />Generate with Claude AI</>}
                  </Button>
                  <Button variant="outline" onClick={() => setCreating(false)} className="border-white/20 text-white hover:bg-white/10">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans List */}
      {isLoading ? (
        <div className="py-12 text-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" /></div>
      ) : plans.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No business plans yet</h3>
            <p className="text-white/50">Generate a comprehensive AI-written 30-year strategic business plan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((doc, index) => {
            const phases = parsePhases(doc.content);
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="bg-white/5 border-white/10 hover:border-blue-500/20 transition-all">
                  <CardContent className="py-4">
                    {editingId === doc.id ? (
                      <div className="space-y-3">
                        <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} className="bg-white/5 border-white/20 text-white" />
                        <Textarea value={editForm.content} onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))} className="bg-white/5 border-white/20 text-white min-h-[300px] font-mono text-xs" />
                        <div className="flex gap-2">
                          <Button onClick={() => updateMutation.mutate({ id: doc.id, data: editForm })} disabled={updateMutation.isPending} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                            {updateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <p className="font-semibold text-white">{displayTitle(doc)}</p>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">30-Year Plan</Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                <Lock className="w-2.5 h-2.5 mr-1" />Confidential
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/30">
                              <Calendar className="w-3 h-3" />
                              Generated {new Date(doc.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => setViewingId(viewingId === doc.id ? null : doc.id)} className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8">
                              {viewingId === doc.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setEditingId(doc.id); setEditForm({ title: doc.title, content: doc.content }); }} className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            {doc.status !== "final" && (
                              <Button size="sm" variant="ghost" onClick={() => saveFinalMutation.mutate(doc.id)} disabled={saveFinalMutation.isPending} title="Save as Final" className="text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 px-2 text-xs">
                                {saveFinalMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                                Save
                              </Button>
                            )}
                            {doc.status === "final" && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs h-8 px-2 flex items-center">Final</Badge>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => downloadPDF(doc)} className="text-white/40 hover:text-blue-400 hover:bg-white/10 w-8 h-8" title="Download PDF">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => confirm("Delete this business plan?") && deleteMutation.mutate(doc.id)} className="text-white/40 hover:text-red-400 hover:bg-red-500/10 w-8 h-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Phase quick-view */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {PHASES.map(p => (
                            <button
                              key={p.key}
                              onClick={() => setExpandedSection(expandedSection === `${doc.id}-${p.key}` ? null : `${doc.id}-${p.key}`)}
                              className="text-left rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-2 transition-all"
                            >
                              <div className={`text-xs font-medium ${p.color} flex items-center justify-between`}>
                                {p.label}
                                {expandedSection === `${doc.id}-${p.key}` ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Expanded phase */}
                        <AnimatePresence>
                          {PHASES.map(p => expandedSection === `${doc.id}-${p.key}` && phases[p.key] && (
                            <motion.div key={p.key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="mt-2 bg-black/20 rounded-lg p-3 text-xs text-white/60 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                {phases[p.key]}…
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Full view */}
                        {viewingId === doc.id && (
                          <div className="bg-black/30 rounded-lg p-4 mt-3 max-h-[500px] overflow-y-auto">
                            <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed">{doc.content}</pre>
                          </div>
                        )}
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