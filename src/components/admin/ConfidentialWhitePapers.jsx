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

  const downloadPDF = (doc) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 15;
    const maxWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
    pdf.setFontSize(18);
    pdf.text(doc.title, margin, margin + 10);
    pdf.setFontSize(9);
    pdf.text("CONFIDENTIAL — AuthorForge Internal Document", margin, margin + 18);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(doc.content || "", maxWidth);
    pdf.text(lines, margin, margin + 28);
    pdf.save(`${doc.title.replace(/\s+/g, "-")}-CONFIDENTIAL.pdf`);
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