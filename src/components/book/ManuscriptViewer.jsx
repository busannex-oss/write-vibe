import React, { useState } from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Edit2, Save, FileDown, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ManuscriptViewer({ book, onUpdate, isUpdating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(book.formatted_manuscript || "");
  const [exporting, setExporting] = useState(false);

  const manuscriptContent = isEditing ? editedContent : (book.formatted_manuscript || "");

  const handleSaveEdits = async () => {
    if (editedContent === book.formatted_manuscript) {
      setIsEditing(false);
      return;
    }
    
    await onUpdate({ formatted_manuscript: editedContent }, true);
    setIsEditing(false);
  };

  const exportToPDF = () => {
    if (!manuscriptContent) return;

    setExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const lineHeight = 5;

      // Add title
      pdf.setFontSize(24);
      pdf.setFont(undefined, "bold");
      pdf.text(book.title, pageWidth / 2, margin + 10, { align: "center" });

      if (book.subtitle) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, "italic");
        pdf.text(book.subtitle, pageWidth / 2, margin + 20, { align: "center" });
      }

      // Add metadata
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text(`Author: ${book.created_by || "Unknown"}`, pageWidth / 2, margin + 30, { align: "center" });
      pdf.text(`Genre: ${book.category || "Fiction"}`, pageWidth / 2, margin + 36, { align: "center" });

      // Add content
      pdf.setFontSize(11);
      let yPosition = margin + 50;

      const lines = pdf.splitTextToSize(manuscriptContent, maxWidth);

      lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      pdf.save(`${book.title}-manuscript.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const exportToEPUB = () => {
    if (!manuscriptContent) return;

    setExporting(true);
    try {
      // Create EPUB-compatible HTML
      const epubContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <title>${book.title}</title>
  <style>
    body { font-family: serif; margin: 1em; }
    h1 { text-align: center; font-size: 2em; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; margin-top: 1em; margin-bottom: 0.5em; }
    p { text-align: justify; text-indent: 1em; margin: 0; line-height: 1.6; }
    p + p { margin-top: 0; }
    .metadata { text-align: center; font-size: 0.9em; margin-bottom: 2em; }
  </style>
</head>
<body>
  <h1>${book.title}</h1>
  ${book.subtitle ? `<h2>${book.subtitle}</h2>` : ""}
  <div class="metadata">
    <p><strong>Author:</strong> ${book.created_by || "Unknown"}</p>
    <p><strong>Genre:</strong> ${book.category || "Fiction"}</p>
  </div>
  <div>${manuscriptContent.split("\n").map(para => `<p>${para}</p>`).join("")}</div>
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([epubContent], { type: "application/epub+zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title}-manuscript.epub`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("EPUB export error:", error);
      alert("Failed to export EPUB");
    } finally {
      setExporting(false);
    }
  };

  const downloadAsText = () => {
    if (!manuscriptContent) return;

    const content = `${book.title}${book.subtitle ? ` - ${book.subtitle}` : ""}

Author: ${book.created_by || "Unknown"}
Genre: ${book.category || "Fiction"}

---

${manuscriptContent}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title}-manuscript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!manuscriptContent) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Manuscript Yet</h3>
          <p className="text-white/50">Generate and format your manuscript first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Manuscript Viewer & Editor
              </CardTitle>
              <CardDescription className="text-white/50">
                {book.formatted_manuscript?.split(/\s+/).length || 0} words • {book.category || "Unknown"} genre
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-white/5 border-white/20 text-white font-mono text-sm min-h-96"
                placeholder="Edit your manuscript content here..."
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSaveEdits}
                  disabled={isUpdating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setEditedContent(book.formatted_manuscript || "");
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white/5 rounded-lg p-6 max-h-96 overflow-y-auto border border-white/10">
                <div className="prose prose-invert max-w-none text-sm text-white/80 whitespace-pre-wrap">
                  {manuscriptContent}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
                <Button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 text-sm"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-1" />
                  )}
                  PDF
                </Button>
                <Button
                  onClick={exportToEPUB}
                  disabled={exporting}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0 text-sm"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-1" />
                  )}
                  EPUB
                </Button>
                <Button
                  onClick={downloadAsText}
                  disabled={exporting}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  TXT
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(manuscriptContent);
                    alert("Copied to clipboard!");
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}