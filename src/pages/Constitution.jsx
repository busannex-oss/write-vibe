import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scale, Save, Loader2, Download, Lock, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";

export default function Constitution() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["constitution-doc"],
    queryFn: () => base44.entities.Document.filter({ type: "constitution", book_id: "admin" })
  });

  const existing = docs[0];

  useEffect(() => {
    if (!hydrated && !isLoading) {
      if (existing) {
        setTitle(existing.title || "");
        setContent(existing.content || "");
      }
      setHydrated(true);
    }
  }, [hydrated, isLoading, existing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalTitle = title.trim() || "Platform Constitution";
      if (existing) {
        await base44.entities.Document.update(existing.id, {
          title: finalTitle,
          content,
          status: "final"
        });
      } else {
        await base44.entities.Document.create({
          type: "constitution",
          book_id: "admin",
          title: finalTitle,
          content,
          status: "final"
        });
      }
      queryClient.invalidateQueries({ queryKey: ["constitution-doc"] });
    } catch (error) {
      console.error("Error saving constitution:", error);
    }
    setSaving(false);
  };

  const downloadTxt = () => {
    const el = document.createElement("a");
    const file = new Blob([content || ""], { type: "text/plain" });
    el.href = URL.createObjectURL(file);
    el.download = `${(title || "Platform Constitution").replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pw - 2 * margin;
    pdf.setFontSize(16);
    pdf.text(title || "Platform Constitution", margin, margin + 10);
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(content || "", maxW);
    pdf.text(lines, margin, margin + 25);
    pdf.save(`${(title || "Platform Constitution").replace(/\s+/g, "-")}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Scale className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Constitution</h1>
          <p className="text-white/50 mt-1">The platform's governing constitution (admin only)</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3 mb-6">
        <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-300">
          <strong>Admin only.</strong> This document defines the foundational principles and governance for the platform.
        </p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>{existing ? "Edit Constitution" : "Create Constitution"}</span>
            {existing && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Saved</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-white/50">
            {existing
              ? "Update the governing constitution document"
              : "Draft the foundational constitution for the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white/70 mb-2 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Platform Constitution"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
          </div>
          <div>
            <Label className="text-white/70 mb-2 block">Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the constitution here..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[400px] font-mono text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {existing ? "Save Changes" : "Create Constitution"}
            </Button>
            <Button variant="outline" onClick={downloadTxt} className="border-white/20 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" /> Text
            </Button>
            <Button variant="outline" onClick={downloadPDF} className="border-white/20 text-white hover:bg-white/10">
              <FileDown className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}