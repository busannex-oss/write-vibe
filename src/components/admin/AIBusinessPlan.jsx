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
    company_name: "AuthorForge",
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

  const downloadPDF = (doc) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pw - 2 * margin;
    const title = displayTitle(doc);

    // ── Cover Page ─────────────────────────────────────────────
    pdf.setFillColor(10, 15, 30);
    pdf.rect(0, 0, pw, ph, "F");
    // Blue accent bar
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 6, ph, "F");
    // Header badge
    pdf.setFillColor(17, 24, 39);
    pdf.roundedRect(margin, 28, contentW, 18, 3, 3, "F");
    pdf.setTextColor(96, 165, 250);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("AUTHORFORGE  ·  30-YEAR STRATEGIC BUSINESS PLAN", margin + 6, 39);
    // Main title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(title, contentW);
    pdf.text(titleLines, margin, 76);
    // Tagline
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 116, 139);
    pdf.text("Comprehensive Strategic Business Plan — 30-Year Horizon", margin, 76 + titleLines.length * 11 + 7);
    // Gold divider
    pdf.setFillColor(245, 158, 11);
    pdf.rect(margin, 120, 40, 1.5, "F");
    // Meta block
    const metaY = 135;
    pdf.setFillColor(17, 24, 39);
    pdf.roundedRect(margin, metaY, contentW, 62, 3, 3, "F");
    const col2 = margin + contentW / 2 + 4;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text("DATE GENERATED", margin + 8, metaY + 11);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(new Date(doc.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), margin + 8, metaY + 19);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text("CLASSIFICATION", margin + 8, metaY + 31);
    pdf.setTextColor(239, 68, 68);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("STRICTLY CONFIDENTIAL", margin + 8, metaY + 39);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text("DOCUMENT TYPE", col2, metaY + 11);
    pdf.setTextColor(96, 165, 250);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Strategic Business Plan", col2, metaY + 19);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text("PLANNING HORIZON", col2, metaY + 31);
    pdf.setTextColor(245, 158, 11);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("30 Years (2025–2055)", col2, metaY + 39);
    // Footer
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text("This document contains proprietary and confidential strategic information. Unauthorized disclosure is prohibited.", margin, ph - 14);

    // ── Content Pages ───────────────────────────────────────────
    const lines = (doc.content || "").split("\n");
    pdf.addPage();
    let y = 20;
    let pageNum = 2;

    const addPageHeader = () => {
      pdf.setFillColor(10, 15, 30);
      pdf.rect(0, 0, pw, 13, "F");
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pw, 1.5, "F");
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text("CONFIDENTIAL — AUTHORFORGE STRATEGIC PLAN", margin, 9);
      pdf.text(title.slice(0, 55), pw - margin, 9, { align: "right" });
      y = 22;
    };
    const addPageFooter = (pn) => {
      pdf.setFillColor(10, 15, 30);
      pdf.rect(0, ph - 11, pw, 11, "F");
      pdf.setFontSize(7);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`Page ${pn}`, pw / 2, ph - 4, { align: "center" });
      pdf.text("© AuthorForge " + new Date().getFullYear(), margin, ph - 4);
    };

    addPageHeader();

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) { y += 4; return; }

      // Phase / section headers
      const isPhaseHeader = /^PHASE \d/i.test(line);
      const isMainHeader = /^[A-Z][A-Z\s&:()\-\/]{8,}$/.test(line) || /^\d+\.\s+[A-Z]/.test(line);

      if (isPhaseHeader) {
        if (y > ph - 45) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin - 2, y - 5, contentW + 4, 13, "F");
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text(line, margin + 4, y + 3);
        y += 18;
      } else if (isMainHeader) {
        if (y > ph - 40) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
        pdf.setFillColor(17, 24, 39);
        pdf.rect(margin - 2, y - 4, contentW + 4, 11, "F");
        pdf.setFillColor(245, 158, 11);
        pdf.rect(margin - 2, y - 4, 3, 11, "F");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(245, 158, 11);
        pdf.text(line, margin + 5, y + 3);
        y += 15;
      } else {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(51, 65, 85);
        const wrapped = pdf.splitTextToSize(line, contentW);
        wrapped.forEach((wl) => {
          if (y > ph - 20) { addPageFooter(pageNum); pdf.addPage(); pageNum++; addPageHeader(); }
          pdf.text(wl, margin, y);
          y += 5.5;
        });
      }
    });
    addPageFooter(pageNum);
    pdf.save(`${title.replace(/\s+/g, "-")}-30YR-BIZPLAN.pdf`);
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