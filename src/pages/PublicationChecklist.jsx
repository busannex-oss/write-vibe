import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronRight,
  BookOpen, Users, FileText, Image, Volume2, Video, Globe,
  RefreshCw, Sparkles, AlignLeft, Star, Loader2, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Advisory board members and their relevant review stages
const ADVISORY_REVIEWS = [
  { stage: "manuscript", advisor: "Toni Morrison", role: "Literary Excellence", focus: "Voice, prose quality & cultural authenticity", icon: "✍️" },
  { stage: "outline", advisor: "J. K. Rowling", role: "World-Building & Franchise", focus: "Story structure & series potential", icon: "🗺️" },
  { stage: "marketing", advisor: "Shonda Rhimes", role: "Narrative & IP Expansion", focus: "Multi-platform potential & audience reach", icon: "📡" },
  { stage: "business", advisor: "Tyler Perry", role: "Creative Empire", focus: "Ownership strategy & revenue structure", icon: "🏛️" },
  { stage: "legal", advisor: "Thurgood Marshall", role: "Legal Strategy", focus: "IP protection & contract readiness", icon: "⚖️" },
  { stage: "vision", advisor: "Slade Kevin Morrison", role: "Visionary Founder", focus: "Mission alignment & long-term impact", icon: "🎯" },
];

// Map book fields to checklist items
function buildChecklist(book) {
  const chapters = book?.manuscript_chapters || [];
  const totalChapters = book?.table_of_contents?.length || 0;
  const writtenChapters = chapters.length;
  const allChaptersWritten = totalChapters > 0 && writtenChapters >= totalChapters;

  return [
    {
      id: "title",
      section: "Foundation",
      label: "Book Title",
      description: "A compelling, market-tested title has been set",
      icon: Sparkles,
      done: !!book?.title && book.title !== "Untitled Book",
      detail: book?.title || "No title yet",
    },
    {
      id: "characters",
      section: "Foundation",
      label: "Characters Defined",
      description: "Key characters have profiles, backstories & traits",
      icon: Users,
      done: (book?.characters?.length || 0) > 0,
      detail: `${book?.characters?.length || 0} character(s) created`,
    },
    {
      id: "outline",
      section: "Foundation",
      label: "Story Outline Complete",
      description: "Chapter-by-chapter outline exists and is reviewed",
      icon: FileText,
      done: (book?.table_of_contents?.length || 0) > 0,
      detail: `${book?.table_of_contents?.length || 0} chapter(s) outlined`,
      advisory: ADVISORY_REVIEWS.find(a => a.stage === "outline"),
    },
    {
      id: "summary",
      section: "Foundation",
      label: "Book Summary Written",
      description: "Back cover copy and marketing synopsis are ready",
      icon: AlignLeft,
      done: !!book?.book_summary,
      detail: book?.book_summary ? "Summary complete" : "Not yet written",
    },
    {
      id: "manuscript_progress",
      section: "Manuscript",
      label: "Manuscript Progress",
      description: `${writtenChapters} of ${totalChapters || "?"} chapters written`,
      icon: BookOpen,
      done: allChaptersWritten,
      partial: writtenChapters > 0 && !allChaptersWritten,
      detail: totalChapters > 0 ? `${Math.round((writtenChapters / totalChapters) * 100)}% complete` : "No outline yet",
      progress: totalChapters > 0 ? Math.round((writtenChapters / totalChapters) * 100) : 0,
      advisory: ADVISORY_REVIEWS.find(a => a.stage === "manuscript"),
    },
    {
      id: "formatted",
      section: "Manuscript",
      label: "Manuscript Formatted",
      description: "Formatted for KDP, ACX, or chosen platform",
      icon: RefreshCw,
      done: !!book?.formatted_manuscript,
      detail: book?.formatted_manuscript ? "Formatted & ready" : "Not yet formatted",
    },
    {
      id: "cover",
      section: "Production",
      label: "Cover Design Complete",
      description: "Front cover is finalized and ready for publishing",
      icon: Image,
      done: !!book?.front_cover_url,
      detail: book?.front_cover_url ? "Cover ready" : "No cover yet",
    },
    {
      id: "audiobook",
      section: "Production",
      label: "Audiobook Produced",
      description: "AI narration generated and reviewed",
      icon: Volume2,
      done: !!book?.audiobook_url,
      optional: true,
      detail: book?.audiobook_url ? "Audiobook ready" : "Not produced",
    },
    {
      id: "video",
      section: "Production",
      label: "Promo Video Created",
      description: "Book trailer for social and website",
      icon: Video,
      done: !!book?.video_commercial_url,
      optional: true,
      detail: book?.video_commercial_url ? "Video ready" : "Not created",
    },
    {
      id: "website",
      section: "Marketing",
      label: "Author Website Live",
      description: "Book website is published and accessible",
      icon: Globe,
      done: book?.website_config?.status === "live",
      detail: book?.website_config?.status === "live" ? "Website live" : book?.website_config?.status === "coming_soon" ? "Coming soon page up" : "Not configured",
      advisory: ADVISORY_REVIEWS.find(a => a.stage === "marketing"),
    },
    {
      id: "business_review",
      section: "Advisory",
      label: "Creative Empire Review",
      description: "Tyler Perry — ownership & revenue strategy reviewed",
      icon: Star,
      done: false,
      advisory: ADVISORY_REVIEWS.find(a => a.stage === "business"),
      manual: true,
    },
    {
      id: "legal_review",
      section: "Advisory",
      label: "IP & Legal Strategy Review",
      description: "Thurgood Marshall — IP protection & contracts reviewed",
      icon: Star,
      done: false,
      advisory: ADVISORY_REVIEWS.find(a => a.stage === "legal"),
      manual: true,
    },
    {
      id: "vision_review",
      section: "Advisory",
      label: "Mission Alignment Review",
      description: "Slade Kevin Morrison — vision & long-term impact confirmed",
      icon: Star,
      done: false,
      advisory: ADVISORY_REVIEWS.find(a => a.stage === "vision"),
      manual: true,
    },
  ];
}

const SECTION_ORDER = ["Foundation", "Manuscript", "Production", "Marketing", "Advisory"];

const statusColor = (item) => {
  if (item.done) return "text-emerald-400";
  if (item.partial) return "text-amber-400";
  if (item.optional) return "text-slate-500";
  return "text-red-400";
};

const statusIcon = (item) => {
  if (item.done) return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
  if (item.partial) return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
  return <Circle className="w-5 h-5 text-slate-600 shrink-0" />;
};

export default function PublicationChecklist() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualChecks, setManualChecks] = useState({});
  const [expandedSections, setExpandedSections] = useState({ Foundation: true, Manuscript: true, Production: true, Marketing: true, Advisory: true });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const allBooks = await base44.entities.Book.list();
    setBooks(allBooks);
    if (allBooks.length > 0) setSelectedBookId(allBooks[0].id);
    setLoading(false);
  };

  const selectedBook = books.find(b => b.id === selectedBookId) || null;
  const rawChecklist = selectedBook ? buildChecklist(selectedBook) : [];

  // Merge manual advisory checks
  const checklist = rawChecklist.map(item =>
    item.manual ? { ...item, done: !!manualChecks[item.id] } : item
  );

  const doneCount = checklist.filter(i => i.done).length;
  const requiredItems = checklist.filter(i => !i.optional);
  const requiredDone = requiredItems.filter(i => i.done).length;
  const overallProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

  const grouped = SECTION_ORDER.reduce((acc, sec) => {
    acc[sec] = checklist.filter(i => i.section === sec);
    return acc;
  }, {});

  const toggleSection = (sec) => setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  const toggleManual = (id) => setManualChecks(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl("Books")} className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Books
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">Publication Checklist</h1>
          <p className="text-white/40 text-sm">Track every step from draft to published, including advisory board reviews.</p>
        </div>

        {/* Book selector */}
        {books.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {books.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBookId(b.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedBookId === b.id ? "bg-amber-500 text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}
              >
                {b.title || "Untitled Book"}
              </button>
            ))}
          </div>
        )}

        {!selectedBook ? (
          <Card className="bg-slate-900/60 border-white/10 text-center py-16">
            <p className="text-white/40">No books found. <Link to={createPageUrl("Books")} className="text-amber-400 underline">Create your first book</Link>.</p>
          </Card>
        ) : (
          <>
            {/* Overall Progress */}
            <Card className="mb-6 bg-slate-900/60 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-white font-semibold text-lg">{selectedBook.title || "Untitled Book"}</h2>
                    <p className="text-white/40 text-sm">{requiredDone} of {requiredItems.length} required steps complete</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-amber-400">{overallProgress}%</span>
                    <p className="text-white/30 text-xs mt-0.5">Publication Ready</p>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2.5 bg-white/10" />
                <div className="flex gap-4 mt-4 text-xs text-white/40">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{doneCount} complete</span>
                  <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-400" />{checklist.filter(i => i.partial).length} in progress</span>
                  <span className="flex items-center gap-1.5"><Circle className="w-3.5 h-3.5 text-slate-500" />{checklist.filter(i => !i.done && !i.partial).length} remaining</span>
                </div>
              </CardContent>
            </Card>

            {/* Checklist sections */}
            {SECTION_ORDER.map(section => {
              const items = grouped[section];
              if (!items || items.length === 0) return null;
              const sectionDone = items.filter(i => i.done).length;
              const expanded = expandedSections[section];

              return (
                <div key={section} className="mb-4">
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors mb-2"
                  >
                    <div className="flex items-center gap-3">
                      {expanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                      <span className="text-white font-semibold">{section}</span>
                      <Badge className="bg-white/10 text-white/50 border-0 text-xs">{sectionDone}/{items.length}</Badge>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${items.length > 0 ? (sectionDone / items.length) * 100 : 0}%` }} />
                    </div>
                  </button>

                  {expanded && (
                    <div className="space-y-2">
                      {items.map(item => (
                        <Card
                          key={item.id}
                          className={`border transition-all ${item.done ? "bg-emerald-950/20 border-emerald-500/20" : item.partial ? "bg-amber-950/20 border-amber-500/20" : "bg-slate-900/40 border-white/8"}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {item.manual ? (
                                <button
                                  onClick={() => toggleManual(item.id)}
                                  className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                                >
                                  {item.done
                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    : <Circle className="w-5 h-5 text-slate-600 hover:text-amber-400" />
                                  }
                                </button>
                              ) : (
                                <div className="mt-0.5">{statusIcon(item)}</div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-medium text-sm ${item.done ? "text-emerald-300" : "text-white"}`}>
                                    {item.label}
                                  </span>
                                  {item.optional && <Badge className="bg-white/8 text-white/30 border-0 text-xs">Optional</Badge>}
                                  {item.manual && !item.done && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Mark Complete</Badge>}
                                </div>
                                <p className="text-white/40 text-xs mt-0.5">{item.description}</p>

                                {item.progress !== undefined && !item.done && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs text-white/30 mb-1">
                                      <span>{item.detail}</span>
                                      <span>{item.progress}%</span>
                                    </div>
                                    <Progress value={item.progress} className="h-1.5 bg-white/10" />
                                  </div>
                                )}

                                {item.detail && item.progress === undefined && (
                                  <p className={`text-xs mt-1 ${item.done ? "text-emerald-400/70" : "text-white/25"}`}>{item.detail}</p>
                                )}

                                {/* Advisory board callout */}
                                {item.advisory && (
                                  <div className="mt-3 flex items-start gap-2 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2">
                                    <span className="text-base leading-none mt-0.5">{item.advisory.icon}</span>
                                    <div>
                                      <p className="text-amber-300 text-xs font-medium">{item.advisory.advisor} · {item.advisory.role}</p>
                                      <p className="text-amber-400/60 text-xs">{item.advisory.focus}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Quick link to BookEditor for auto-detected items */}
                              {!item.manual && !item.done && selectedBookId && (
                                <Link
                                  to={`/BookEditor?id=${selectedBookId}`}
                                  className="shrink-0 text-xs text-white/25 hover:text-amber-400 transition-colors mt-0.5"
                                  title="Go to Book Editor"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Completion banner */}
            {overallProgress === 100 && (
              <Card className="mt-6 bg-gradient-to-r from-emerald-900/40 to-amber-900/30 border-emerald-500/30">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-xl mb-1">Your Book is Publication Ready! 🎉</h3>
                  <p className="text-white/50 text-sm">All steps complete — your Advisory Board has signed off. Time to launch.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}