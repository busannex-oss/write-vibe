import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Mail, 
  Newspaper, 
  Image,
  Plus,
  Loader2,
  Sparkles,
  Download,
  Edit3,
  Trash2,
  Check,
  BookOpen,
  RefreshCw,
  FileDown,
  Printer,
  Save,
  Copy,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "bg-pink-500", icon: "📷", shareUrl: (text) => `https://www.instagram.com/` },
  { key: "twitter",   label: "X / Twitter", color: "bg-sky-500",  icon: "🐦", shareUrl: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
  { key: "facebook",  label: "Facebook",  color: "bg-blue-600", icon: "📘", shareUrl: (text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}` },
  { key: "tiktok",    label: "TikTok",    color: "bg-black",    icon: "🎵", shareUrl: (text) => `https://www.tiktok.com/` },
  { key: "linkedin",  label: "LinkedIn",  color: "bg-blue-700", icon: "💼", shareUrl: (text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}` },
];

function parseCaptions(content) {
  if (!content) return [];
  // Split on numbered platform sections like "1. **Platform: Instagram**" or "---"
  const sections = content.split(/(?=\d+\.\s+\*\*Platform)/i).filter(Boolean);
  if (sections.length < 2) return null; // fallback to raw
  return sections.map((section) => {
    const platformMatch = section.match(/Platform:\s*\*?\*?([^\n*]+)/i);
    const captionMatch  = section.match(/Caption:\*?\*?\s*([\s\S]*?)(?=\*\*Hashtags|\*\*Call|$)/i);
    const hashtagMatch  = section.match(/Hashtags:\*?\*?\s*([^\n]+)/i);
    const ctaMatch      = section.match(/Call to Action:\*?\*?\s*([^\n]+)/i);
    return {
      platform: platformMatch?.[1]?.trim() || "Unknown",
      caption:  captionMatch?.[1]?.trim()  || section.trim(),
      hashtags: hashtagMatch?.[1]?.trim()  || "",
      cta:      ctaMatch?.[1]?.trim()      || "",
    };
  }).filter(c => c.caption);
}

export default function Documents() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("publisher_letter");
  const [selectedBook, setSelectedBook] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copyCaption = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', selectedBook],
    queryFn: () => selectedBook 
      ? base44.entities.Document.filter({ book_id: selectedBook })
      : base44.entities.Document.list(),
    enabled: true
  });

  const createDocMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] })
  });

  const updateDocMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setEditingDoc(null);
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] })
  });

  const generateDocument = async (type) => {
    if (!selectedBook) return;
    const book = books.find(b => b.id === selectedBook);
    if (!book) return;

    setGenerating(true);
    try {
      let prompt = "";
      let title = "";

      switch (type) {
        case "publisher_letter":
          title = "Publisher Query Letter";
          prompt = `Write a professional publisher query letter for:
          
Book: "${book.title}"
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Summary: ${book.book_summary}

Include:
1. Professional greeting
2. Hook paragraph
3. Book synopsis (brief)
4. Author bio placeholder
5. Closing with call to action

Make it compelling and follow industry standards.`;
          break;
        case "press_release":
          title = "Press Release";
          prompt = `Write a professional press release for book launch:
          
Book: "${book.title}"
Genre: ${book.category}
Summary: ${book.book_summary}

Include:
1. FOR IMMEDIATE RELEASE header
2. Compelling headline
3. Dateline and lead paragraph
4. Book details and description
5. Author quote placeholder
6. About the author section
7. Contact information placeholder
8. ### ending

Follow AP style guidelines.`;
          break;
        case "social_image":
          title = "Social Media Caption Pack";
          prompt = `Create 5 engaging social media captions for promoting:
          
Book: "${book.title}"
Genre: ${book.category}
Themes: ${book.subjects?.join(', ')}
Summary: ${book.book_summary?.slice(0, 200)}

For each caption include:
1. Platform (Instagram/Twitter/Facebook/TikTok/LinkedIn)
2. Caption text with emojis
3. Relevant hashtags
4. Call to action

Make them engaging and shareable.`;
          break;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            content: { type: "string" }
          }
        }
      });

      await createDocMutation.mutateAsync({
        book_id: selectedBook,
        type,
        title,
        content: response.content,
        status: "draft"
      });

    } catch (error) {
      console.error("Error generating document:", error);
    }
    setGenerating(false);
  };

  const filteredDocs = documents.filter(d => d.type === activeTab);

  const downloadDocument = (doc) => {
    const element = document.createElement('a');
    const file = new Blob([doc.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printToPDF = (doc) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(doc.title, margin, margin + 10);
    
    // Add content
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(doc.content, maxWidth);
    pdf.text(lines, margin, margin + 25);
    
    pdf.save(`${doc.title.replace(/\s+/g, '-')}.pdf`);
  };

  const handleRegenerateDoc = async (doc) => {
    await generateDocument(doc.type);
  };

  const docTypes = [
    { id: "publisher_letter", label: "Publisher Letters", icon: Mail },
    { id: "press_release", label: "Press Releases", icon: Newspaper },
    { id: "social_image", label: "Social Content", icon: Image }
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Documents</h1>
          <p className="text-white/50 mt-1">Marketing materials and promotional content</p>
        </div>
        <Select value={selectedBook} onValueChange={setSelectedBook}>
          <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white">
            <BookOpen className="w-4 h-4 mr-2 text-white/50" />
            <SelectValue placeholder="Select a book" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {book.title || "Untitled Book"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document Types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          {docTypes.map((type) => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {docTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            {/* Generate Button */}
            {selectedBook && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4">
                  <Button
                    onClick={() => generateDocument(type.id)}
                    disabled={generating}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate New {type.label.slice(0, -1)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Documents List */}
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <type.icon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No {type.label.toLowerCase()} yet</h3>
                  <p className="text-white/50">
                    {selectedBook 
                      ? `Generate your first ${type.label.toLowerCase().slice(0, -1)}`
                      : "Select a book to get started"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg flex items-center gap-2">
                            <type.icon className="w-5 h-5 text-amber-400" />
                            {doc.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              doc.status === 'final' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : 'bg-white/10 text-white/60 border-0'
                            }`}>
                              {doc.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingDoc(editingDoc === doc.id ? null : doc.id)}
                              className="text-white/40 hover:text-white hover:bg-white/10"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDocMutation.mutate(doc.id)}
                              className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingDoc === doc.id ? (
                          <div className="space-y-4">
                            <Textarea
                              value={doc.content}
                              onChange={(e) => {
                                // Update local state for now
                              }}
                              className="bg-white/5 border-white/20 text-white min-h-[300px] font-mono text-sm"
                            />
                             <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => updateDocMutation.mutate({ id: doc.id, data: { status: 'final' } })}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Mark as Final
                              </Button>
                              <Button
                                onClick={() => updateDocMutation.mutate({ id: doc.id, data: { content: doc.content } })}
                                disabled={updateDocMutation.isPending}
                                className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                              >
                                {updateDocMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingDoc(null)}
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Social Caption Pack — rich card layout */}
                            {doc.type === "social_image" ? (() => {
                              const captions = parseCaptions(doc.content);
                              if (captions) {
                                return (
                                  <div className="space-y-3 mb-4">
                                    {captions.map((cap, ci) => {
                                      const platInfo = SOCIAL_PLATFORMS.find(p =>
                                        cap.platform.toLowerCase().includes(p.key)
                                      );
                                      const fullText = [cap.caption, cap.hashtags, cap.cta].filter(Boolean).join("\n\n");
                                      const copyKey = `${doc.id}-${ci}`;
                                      return (
                                        <div key={ci} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                                          {/* Platform header */}
                                          <div className={`flex items-center justify-between px-4 py-2 ${platInfo ? platInfo.color : 'bg-white/10'} bg-opacity-80`}>
                                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                                              {platInfo?.icon} {cap.platform}
                                            </span>
                                            <div className="flex gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyCaption(fullText, copyKey)}
                                                className="h-7 px-2 text-white/80 hover:text-white hover:bg-white/20"
                                              >
                                                {copiedId === copyKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                <span className="ml-1 text-xs">{copiedId === copyKey ? "Copied!" : "Copy"}</span>
                                              </Button>
                                              {platInfo && (
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => window.open(platInfo.shareUrl(fullText), '_blank')}
                                                  className="h-7 px-2 text-white/80 hover:text-white hover:bg-white/20"
                                                >
                                                  <Share2 className="w-3 h-3" />
                                                  <span className="ml-1 text-xs">Share</span>
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                          {/* Caption body */}
                                          <div className="px-4 py-3 space-y-2">
                                            <p className="text-sm text-white/85 whitespace-pre-wrap leading-relaxed">{cap.caption}</p>
                                            {cap.hashtags && (
                                              <p className="text-xs text-pink-300 font-medium">{cap.hashtags}</p>
                                            )}
                                            {cap.cta && (
                                              <p className="text-xs text-amber-300 italic">{cap.cta}</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }
                              // fallback raw view
                              return (
                                <div className="bg-white/5 rounded-lg p-4 max-h-48 overflow-y-auto mb-4">
                                  <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">{doc.content}</pre>
                                </div>
                              );
                            })() : (
                              <div className="bg-white/5 rounded-lg p-4 max-h-48 overflow-y-auto mb-4">
                                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">
                                  {doc.content}
                                </pre>
                              </div>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => handleRegenerateDoc(doc)}
                                disabled={generating}
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <RefreshCw className="w-3 h-3 mr-2" />
                                Regenerate
                              </Button>
                              <Button
                                onClick={() => downloadDocument(doc)}
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Download className="w-3 h-3 mr-2" />
                                Download
                              </Button>
                              <Button
                                onClick={() => printToPDF(doc)}
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <FileDown className="w-3 h-3 mr-2" />
                                PDF
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}