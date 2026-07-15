import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, BookOpen, List, Type, Palette } from "lucide-react";
import jsPDF from "jspdf";

const FONTS = [
  { value: "times",     label: "Times New Roman (Classic)" },
  { value: "helvetica", label: "Helvetica (Modern)" },
  { value: "courier",   label: "Courier (Typewriter)" },
];

const FONT_SIZES = [
  { value: 10, label: "10pt — Compact" },
  { value: 11, label: "11pt — Standard" },
  { value: 12, label: "12pt — Comfortable" },
  { value: 14, label: "14pt — Large Print" },
];

export default function BookPDFExporter({ book }) {
  const [generating, setGenerating] = useState(false);

  // Title page config
  const [showTitlePage, setShowTitlePage] = useState(true);
  const [titlePageTitle, setTitlePageTitle] = useState(book.title || "");
  const [titlePageSubtitle, setTitlePageSubtitle] = useState(book.subtitle || "");
  const [titlePageAuthor, setTitlePageAuthor] = useState("");

  // TOC config
  const [showTOC, setShowTOC] = useState(true);

  // Font config
  const [fontFamily, setFontFamily] = useState("times");
  const [fontSize, setFontSize] = useState(11);

  // Layout
  const [lineSpacing, setLineSpacing] = useState("double");

  const getChapters = () => {
    if (book.manuscript_chapters?.length > 0) return book.manuscript_chapters;
    if (book.table_of_contents?.length > 0)
      return book.table_of_contents.map(ch => ({
        chapter_number: ch.chapter_number,
        chapter_title: ch.chapter_title,
        content: book.outline?.find(o => o.chapter_number === ch.chapter_number)?.summary || ""
      }));
    return [];
  };

  const generatePDF = async () => {
    const chapters = getChapters();
    if (chapters.length === 0 && !book.formatted_manuscript) {
      alert("No manuscript content found. Please write or format your manuscript first.");
      return;
    }

    setGenerating(true);

    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });

      const marginL = 72; // 1 inch
      const marginR = 72;
      const marginT = 72;
      const marginB = 72;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const contentW = pageW - marginL - marginR;
      const lineH = fontSize * (lineSpacing === "double" ? 2 : lineSpacing === "1.5" ? 1.5 : 1.2);

      doc.setFont(fontFamily);

      let pageNum = 0;

      const addPageNumber = (num) => {
        // Running header (book title — author)
        doc.setFontSize(9);
        doc.setFont(fontFamily, "normal");
        doc.setTextColor(150, 150, 150);
        const hLeft = titlePageTitle || book.title || "";
        const hRight = titlePageAuthor || "";
        if (hLeft) doc.text(hLeft, marginL, 40);
        if (hRight) doc.text(hRight, pageW - marginR, 40, { align: "right" });
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.6);
        doc.line(marginL, 46, pageW - marginR, 46);

        // Page number
        doc.setFontSize(9);
        doc.setFont(fontFamily, "normal");
        doc.setTextColor(120, 120, 120);
        const label = `${num}`;
        const textW = doc.getTextWidth(label);
        doc.text(label, pageW / 2 - textW / 2, pageH - 36);
        doc.setTextColor(0, 0, 0);
      };

      // ── TITLE PAGE ──────────────────────────────────────────────────────────
      if (showTitlePage) {
        const midY = pageH / 2 - 60;

        doc.setFont(fontFamily, "bold");
        doc.setFontSize(fontSize + 14);
        const titleLines = doc.splitTextToSize(titlePageTitle, contentW);
        let ty = midY;
        titleLines.forEach(line => {
          const lw = doc.getTextWidth(line);
          doc.text(line, (pageW - lw) / 2, ty);
          ty += (fontSize + 14) * 1.4;
        });

        if (titlePageSubtitle) {
          doc.setFont(fontFamily, "italic");
          doc.setFontSize(fontSize + 4);
          const subLines = doc.splitTextToSize(titlePageSubtitle, contentW);
          ty += 8;
          subLines.forEach(line => {
            const lw = doc.getTextWidth(line);
            doc.text(line, (pageW - lw) / 2, ty);
            ty += (fontSize + 4) * 1.4;
          });
        }

        if (titlePageAuthor) {
          doc.setFont(fontFamily, "normal");
          doc.setFontSize(fontSize + 2);
          const byLine = `by ${titlePageAuthor}`;
          const bw = doc.getTextWidth(byLine);
          doc.text(byLine, (pageW - bw) / 2, ty + 20);
        }

        // Gold accent rule
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1);
        doc.line((pageW - 120) / 2, pageH - 96, (pageW + 120) / 2, pageH - 96);

        // Branded footer
        doc.setFontSize(8);
        doc.setFont(fontFamily, "normal");
        doc.setTextColor(150, 150, 150);
        const foot = "WRITE VIBE  ·  AI BOOK CREATION PLATFORM";
        const fw = doc.getTextWidth(foot);
        doc.text(foot, pageW / 2 - fw / 2, pageH - 60);

        doc.addPage();
        pageNum = 1;
      }

      // ── TABLE OF CONTENTS ────────────────────────────────────────────────────
      if (showTOC && chapters.length > 0) {
        let y = marginT;

        doc.setFont(fontFamily, "bold");
        doc.setFontSize(fontSize + 6);
        doc.text("Contents", marginL, y);
        y += (fontSize + 6) * 2;

        doc.setFont(fontFamily, "normal");
        doc.setFontSize(fontSize);

        chapters.forEach((ch, idx) => {
          if (y > pageH - marginB) {
            addPageNumber(pageNum + 1);
            doc.addPage();
            pageNum++;
            y = marginT;
          }
          const label = `Chapter ${ch.chapter_number}: ${ch.chapter_title}`;
          const pageLabel = `${idx + (showTitlePage ? 3 : 2)}`;
          const dots = ".".repeat(Math.max(2, Math.floor((contentW - doc.getTextWidth(label) - doc.getTextWidth(pageLabel)) / doc.getTextWidth("."))));
          doc.text(`${label}${dots}${pageLabel}`, marginL, y);
          y += lineH;
        });

        addPageNumber(pageNum + 1);
        doc.addPage();
        pageNum++;
      }

      // ── CHAPTERS ─────────────────────────────────────────────────────────────
      const writeText = (text, y, doc) => {
        doc.setFont(fontFamily, "normal");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentW);
        lines.forEach(line => {
          if (y > pageH - marginB) {
            addPageNumber(pageNum + 1);
            doc.addPage();
            pageNum++;
            y = marginT;
          }
          doc.text(line, marginL, y);
          y += lineH;
        });
        return y;
      };

      if (chapters.length > 0) {
        chapters.forEach((ch) => {
          let y = marginT;

          // Chapter heading
          doc.setDrawColor(245, 158, 11);
          doc.setLineWidth(2);
          doc.line(marginL, y - 8, marginL + 44, y - 8);
          doc.setFont(fontFamily, "bold");
          doc.setFontSize(fontSize + 8);
          doc.setTextColor(245, 158, 11);
          doc.text(`Chapter ${ch.chapter_number}`, marginL, y);
          doc.setTextColor(0, 0, 0);
          y += (fontSize + 8) * 1.6;

          doc.setFont(fontFamily, "bold");
          doc.setFontSize(fontSize + 4);
          const titleLines = doc.splitTextToSize(ch.chapter_title || "", contentW);
          titleLines.forEach(line => { doc.text(line, marginL, y); y += (fontSize + 4) * 1.4; });
          y += 12;

          // Chapter body
          doc.setFont(fontFamily, "normal");
          doc.setFontSize(fontSize);

          const content = ch.content || ch.summary || "(Chapter content not yet written)";
          const paragraphs = content.split(/\n\n+/);
          paragraphs.forEach(para => {
            if (para.trim()) {
              y = writeText(para.trim(), y, doc);
              y += lineH * 0.5; // paragraph gap
            }
          });

          addPageNumber(pageNum + 1);
          doc.addPage();
          pageNum++;
        });
      } else if (book.formatted_manuscript) {
        // Fallback: render formatted manuscript as plain text
        let y = marginT;
        const paragraphs = book.formatted_manuscript.split(/\n\n+/);
        paragraphs.forEach(para => {
          if (para.trim()) {
            y = writeText(para.trim(), y, doc);
            y += lineH * 0.5;
          }
        });
        addPageNumber(pageNum + 1);
      }

      // Remove last blank page added after the final chapter
      const totalPages = doc.internal.getNumberOfPages();
      if (totalPages > 1) {
        doc.deletePage(totalPages);
      }

      doc.save(`${book.title || "book"}-export.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const chapters = getChapters();
  const hasContent = chapters.length > 0 || !!book.formatted_manuscript;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Export to PDF
        </CardTitle>
        <CardDescription className="text-slate-400">
          Generate a professionally formatted PDF with custom styling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {!hasContent && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
            No manuscript content yet. Write your chapters or format your manuscript first.
          </div>
        )}

        {/* Content summary */}
        {hasContent && (
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
              {chapters.length > 0 ? `${chapters.length} chapters` : "Formatted manuscript"}
            </Badge>
            {book.table_of_contents?.length > 0 && (
              <Badge className="bg-blue-500/20 text-blue-300 border-0">TOC available</Badge>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Title Page ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium text-sm">Title Page</span>
              <Switch checked={showTitlePage} onCheckedChange={setShowTitlePage} />
            </div>
            {showTitlePage && (
              <div className="space-y-3 pl-7">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Book Title</Label>
                  <Input
                    value={titlePageTitle}
                    onChange={e => setTitlePageTitle(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Subtitle (optional)</Label>
                  <Input
                    value={titlePageSubtitle}
                    onChange={e => setTitlePageSubtitle(e.target.value)}
                    placeholder="Leave blank to omit"
                    className="bg-slate-700/50 border-slate-600 text-white h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Author Name</Label>
                  <Input
                    value={titlePageAuthor}
                    onChange={e => setTitlePageAuthor(e.target.value)}
                    placeholder="Your name or pen name"
                    className="bg-slate-700/50 border-slate-600 text-white h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── TOC & Typography ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <List className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium text-sm">Table of Contents</span>
              <Switch checked={showTOC} onCheckedChange={setShowTOC} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Type className="w-4 h-4 text-amber-400" />
                <span className="text-white font-medium text-sm">Typography</span>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Font Size</Label>
                <Select value={String(fontSize)} onValueChange={v => setFontSize(Number(v))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map(f => (
                      <SelectItem key={f.value} value={String(f.value)}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Line Spacing</Label>
                <Select value={lineSpacing} onValueChange={setLineSpacing}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="1.5">1.5 Lines</SelectItem>
                    <SelectItem value="double">Double (Publishing Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={generatePDF}
          disabled={generating || !hasContent}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold border-0 gap-2"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
          ) : (
            <><Download className="w-4 h-4" /> Download PDF</>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          US Letter format · 1-inch margins · Page numbers included
        </p>
      </CardContent>
    </Card>
  );
}