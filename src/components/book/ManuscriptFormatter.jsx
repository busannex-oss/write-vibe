import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Sparkles, CheckCircle2, Loader2, Book, Globe, FileCode } from "lucide-react";
import AIGenerateButton from "../AIGenerateButton";

export default function ManuscriptFormatter({ book, onUpdate }) {
  const [formatting, setFormatting] = useState(false);
  const [manuscript, setManuscript] = useState(book.formatted_manuscript || "");
  const [platform, setPlatform] = useState("ebook");
  const [format, setFormat] = useState("standard");
  const [formattedOutput, setFormattedOutput] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const formatOptions = [
    { value: "standard", label: "Standard Publishing" },
    { value: "academic", label: "Academic/Professional" },
    { value: "creative", label: "Creative/Literary" },
    { value: "technical", label: "Technical/Reference" }
  ];

  const platformOptions = [
    { value: "ebook", label: "eBook (Kindle/ePub)", icon: Book },
    { value: "web", label: "Web/Landing Page", icon: Globe },
    { value: "pdf", label: "PDF/Print", icon: FileText }
  ];

  const startFormatting = async () => {
    if (!manuscript && !book.outline?.length) {
      alert("Please add manuscript content or create an outline first");
      return;
    }

    setFormatting(true);
    try {
      // Create conversation with Text Formatter agent
      const conversation = await base44.agents.createConversation({
        agent_name: "text_formatter",
        metadata: {
          name: `Format: ${book.title}`,
          book_id: book.id
        }
      });
      setConversationId(conversation.id);

      const contentToFormat = manuscript || book.outline?.map((ch, i) => 
        `Chapter ${ch.chapter_number}: ${ch.chapter_title}\n\n${ch.summary}\n\nKey Events:\n${ch.key_events?.join('\n- ') || ''}`
      ).join('\n\n---\n\n');

      const prompt = `Format this book manuscript for ${platform} platform using ${format} formatting style.

Book Title: ${book.title}
${book.subtitle ? `Subtitle: ${book.subtitle}` : ''}
Category: ${book.category}
Author: ${book.created_by}

Requirements:
- Create proper heading hierarchy (H1/H2/H3)
- Optimize paragraph structure and flow
- Apply consistent typography and styling
- Ensure grammar and punctuation accuracy
- Generate Table of Contents
- Add page breaks at appropriate sections
- ${platform === 'ebook' ? 'Format for Kindle/ePub standards with chapter navigation' : ''}
- ${platform === 'web' ? 'Optimize for web readability with SEO-friendly structure' : ''}
- ${platform === 'pdf' ? 'Format for print-ready PDF with proper margins and page numbering' : ''}

MANUSCRIPT CONTENT:
${contentToFormat}

Please provide:
1. Fully formatted manuscript ready for ${platform}
2. Table of Contents
3. Style and consistency audit report
4. Readability improvements made`;

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: prompt
      });

      // Subscribe to updates
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage?.content) {
          setFormattedOutput(lastMessage.content);
        }
      });

      // Cleanup after 2 minutes
      setTimeout(() => {
        unsubscribe();
        setFormatting(false);
      }, 120000);

    } catch (error) {
      console.error("Formatting error:", error);
      alert("Failed to format manuscript. Please try again.");
      setFormatting(false);
    }
  };

  const saveFormatted = async () => {
    if (!formattedOutput) return;

    try {
      await onUpdate({
        formatted_manuscript: formattedOutput,
        manuscript_platform: platform,
        manuscript_format: format
      });
      alert("Formatted manuscript saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save formatted manuscript");
    }
  };

  const downloadFormatted = () => {
    if (!formattedOutput) return;

    const blob = new Blob([formattedOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title}-formatted-${platform}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Manuscript Formatter
          </CardTitle>
          <CardDescription className="text-slate-400">
            AI-powered formatting for professional, platform-ready manuscripts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Target Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Format Style</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Manuscript Content (Optional - will use outline if empty)</Label>
              <Textarea
                value={manuscript}
                onChange={(e) => setManuscript(e.target.value)}
                placeholder="Paste your manuscript content here, or leave empty to format your outline..."
                className="min-h-[200px] bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <AIGenerateButton
              onClick={startFormatting}
              loading={formatting}
              label="Format Manuscript"
              loadingLabel="Formatting..."
              className="w-full"
            />
          </div>

          {/* Output Section */}
          {formattedOutput && (
            <div className="space-y-4 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Formatting Complete</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={downloadFormatted}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={saveFormatted}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Save to Book
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                <div className="prose prose-invert max-w-none text-sm">
                  <pre className="whitespace-pre-wrap text-slate-300 font-sans">
                    {formattedOutput}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {formatting && !formattedOutput && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-slate-400">Analyzing and formatting your manuscript...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Structure</h4>
                <p className="text-xs text-slate-400">
                  Proper headings, paragraphs, and hierarchy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Style</h4>
                <p className="text-xs text-slate-400">
                  Consistent typography and brand voice
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Quality</h4>
                <p className="text-xs text-slate-400">
                  Grammar, punctuation, and readability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}