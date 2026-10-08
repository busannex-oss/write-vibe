import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
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
  Share2,
  Wand2,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import SocialContentScheduler from "@/components/SocialContentScheduler";

// Note: Instagram and TikTok don't support web share URLs — copy only.
// LinkedIn/Facebook don't support pre-filled text — copy first, then open.
const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "bg-pink-500",  icon: "📷", copyOnly: true,  shareUrl: null },
  { key: "twitter",   label: "X / Twitter", color: "bg-sky-500", icon: "🐦", copyOnly: false, shareUrl: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
  { key: "facebook",  label: "Facebook",  color: "bg-blue-600",  icon: "📘", copyOnly: false, shareUrl: () => `https://www.facebook.com/` },
  { key: "tiktok",    label: "TikTok",    color: "bg-neutral-900", icon: "🎵", copyOnly: true, shareUrl: null },
  { key: "linkedin",  label: "LinkedIn",  color: "bg-blue-700",  icon: "💼", copyOnly: false, shareUrl: () => `https://www.linkedin.com/feed/` },
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
  const [refiningId, setRefiningId] = useState(null);

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

      if (type === "social_image") {
        title = "Social Media Content";
        prompt = `Create 5 engaging social media posts for promoting this book:
          
Book: "${book.title}"
Genre: ${book.category}
Themes: ${book.subjects?.join(', ')}
Summary: ${book.book_summary?.slice(0, 200)}

For EACH post create:
1. A unique, compelling caption (under 280 chars for Twitter)
2. Include relevant hashtags
3. Include call to action
4. Vary tone and messaging across posts

Format as JSON array with structure: [{ caption: "...", hashtags: "..." }, ...]`;
      } else {
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
        }
      }

      const response = await ai.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            content: { type: "string" }
          }
        }
      });

      const docData = {
        book_id: selectedBook,
        type,
        title,
        content: response.content,
        status: "draft"
      };

      // All generated documents are auto-saved as versions — mark prior versions non-current
      const existing = documents.filter(d => d.type === type && d.book_id === selectedBook);
      const nextVersion = (existing.reduce((m, d) => Math.max(m, d.version_number || 0), 0)) + 1;
      if (existing.length > 0) {
        await base44.entities.Document.updateMany(
          { book_id: selectedBook, type },
          { $set: { is_current: false } }
        );
      }
      docData.version_number = nextVersion;
      docData.is_current = true;
      docData.generated_at = new Date().toISOString();

      await createDocMutation.mutateAsync(docData);

    } catch (error) {
      console.error("Error generating document:", error);
    }
    setGenerating(false);
  };

  const filteredDocs = documents.filter(d => d.type === activeTab)
    .slice()
    .sort((a, b) => (b.version_number || 1) - (a.version_number || 1));

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

  const refinePressRelease = async (doc) => {
    const book = books.find(b => b.id === doc.book_id);
    setRefiningId(doc.id);
    try {
      const response = await ai.InvokeLLM({
        prompt: `You are refining an existing book-launch press release. Improve the writing to be more compelling, polished, and professional while following AP style. Keep the standard press release structure (FOR IMMEDIATE RELEASE, headline, dateline/lead, book details, author quote, about the author, contact, ###).

Book: "${book?.title || ''}"
Genre: ${book?.category || ''}
Summary: ${book?.book_summary || ''}

Existing press release:
${doc.content}

Return the refined, complete press release.`,
        response_json_schema: {
          type: "object",
          properties: { content: { type: "string" } }
        }
      });

      const bookPressReleases = documents.filter(d => d.type === "press_release" && d.book_id === doc.book_id);
      const nextVersion = (bookPressReleases.reduce((m, d) => Math.max(m, d.version_number || 0), 0)) + 1;

      await base44.entities.Document.updateMany(
        { book_id: doc.book_id, type: "press_release" },
        { $set: { is_current: false } }
      );

      await createDocMutation.mutateAsync({
        book_id: doc.book_id,
        type: "press_release",
        title: "Press Release",
        content: response.content,
        status: "draft",
        version_number: nextVersion,
        is_current: true,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error refining press release:", error);
    }
    setRefiningId(null);
  };

  const restoreVersion = async (doc) => {
    await base44.entities.Document.updateMany(
      { book_id: doc.book_id, type: doc.type },
      { $set: { is_current: false } }
    );
    await updateDocMutation.mutateAsync({ id: doc.id, data: { is_current: true, status: "draft" } });
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
                            <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              v{doc.version_number || 1}
                            </Badge>
                            {doc.is_current === true && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Current
                              </Badge>
                            )}
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
                            {/* Social Content Scheduler */}
                            {doc.type === "social_image" ? (() => {
                              try {
                                const postsData = JSON.parse(doc.content);
                                const posts = Array.isArray(postsData) ? postsData : [];

                                const formattedPosts = posts.map((post, idx) => ({
                                  id: `${doc.id}-${idx}`,
                                  caption: post.caption || post.text || post,
                                  hashtags: post.hashtags || "",
                                  platforms: ["facebook", "twitter", "google"],
                                  scheduled_days: [],
                                  image_url: null,
                                  posted: false,
                                }));

                                return (
                                  <SocialContentScheduler 
                                    posts={formattedPosts}
                                    onUpdate={(updatedPosts) => {
                                      // Handle update if needed
                                    }}
                                  />
                                );
                              } catch (e) {
                                // Fallback raw view if not valid JSON
                                return (
                                  <div className="bg-white/5 rounded-lg p-4 max-h-48 overflow-y-auto mb-4">
                                    <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">{doc.content}</pre>
                                  </div>
                                );
                              }
                            })() : (
                              <div className="bg-white/5 rounded-lg p-4 max-h-48 overflow-y-auto mb-4">
                                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">
                                  {doc.content}
                                </pre>
                              </div>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              {doc.type === "press_release" && doc.is_current !== false && (
                                <Button
                                  onClick={() => refinePressRelease(doc)}
                                  disabled={refiningId === doc.id}
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                                >
                                  {refiningId === doc.id ? (
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                  ) : (
                                    <Wand2 className="w-3 h-3 mr-2" />
                                  )}
                                  Refine
                                </Button>
                              )}
                              {doc.is_current === false && (
                                <Button
                                  onClick={() => restoreVersion(doc)}
                                  disabled={updateDocMutation.isPending}
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <RotateCcw className="w-3 h-3 mr-2" />
                                  Restore
                                </Button>
                              )}
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