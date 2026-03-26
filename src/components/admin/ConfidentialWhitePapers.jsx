import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Lock,
  Download,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

export default function ConfidentialWhitePapers() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
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
      setForm({ title: "", content: "" });
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

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setEditForm({ title: doc.title, content: doc.content });
  };

  const handleUpdate = (id) => {
    updateMutation.mutate({ id, data: editForm });
  };

  const downloadPDF = (doc) => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 15;
    const maxWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
    pdf.setFontSize(18);
    pdf.text(doc.title, margin, margin + 10);
    pdf.setFontSize(10);
    pdf.text("CONFIDENTIAL", margin, margin + 18);
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(doc.content, maxWidth);
    pdf.text(lines, margin, margin + 30);
    pdf.save(`${doc.title.replace(/\s+/g, "-")}-CONFIDENTIAL.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Confidential White Papers</h2>
            <p className="text-sm text-white/50">Admin-only internal documents and strategic papers</p>
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

      {/* Confidential Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
        <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300">
          These documents are <strong>strictly confidential</strong> and visible to admins only. Do not share or distribute outside of authorized personnel.
        </p>
      </div>

      {/* Create Form */}
      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-white/5 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-400" />
                New Confidential White Paper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/70 mb-1 block">Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="White paper title..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <Label className="text-white/70 mb-1 block">Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your white paper content here..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[200px]"
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
                  onClick={() => { setCreating(false); setForm({ title: "", content: "" }); }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* White Papers List */}
      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin mx-auto" />
        </div>
      ) : whitePapers.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No white papers yet</h3>
            <p className="text-white/50">Create your first confidential white paper above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {whitePapers.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/5 border-white/10 hover:border-red-500/30 transition-all">
                <CardContent className="py-4">
                  {editingId === doc.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                      />
                      <Textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white min-h-[150px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdate(doc.id)}
                          disabled={updateMutation.isPending}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                        >
                          {updateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="border-white/20 text-white hover:bg-white/10">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="font-medium text-white truncate">{doc.title}</p>
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs flex-shrink-0">
                            <Lock className="w-2.5 h-2.5 mr-1" />
                            Confidential
                          </Badge>
                        </div>
                        <p className="text-xs text-white/40 mb-2">
                          {new Date(doc.created_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                        {viewingId === doc.id && (
                          <div className="bg-white/5 rounded-lg p-3 mt-2 max-h-60 overflow-y-auto">
                            <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">{doc.content}</pre>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewingId(viewingId === doc.id ? null : doc.id)}
                          className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8"
                        >
                          {viewingId === doc.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(doc)}
                          className="text-white/40 hover:text-white hover:bg-white/10 w-8 h-8"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => downloadPDF(doc)}
                          className="text-white/40 hover:text-amber-400 hover:bg-white/10 w-8 h-8"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => confirm("Permanently delete this white paper?") && deleteMutation.mutate(doc.id)}
                          className="text-white/40 hover:text-red-400 hover:bg-red-500/10 w-8 h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}