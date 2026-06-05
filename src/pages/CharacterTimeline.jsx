import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Users, BookOpen, Loader2, ChevronLeft, ChevronRight, Filter,
  GitBranch, MessageSquare, Star, Download, Sparkles, Milestone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TimelineTrack from "@/components/timeline/TimelineTrack";
import MilestonePanel from "@/components/timeline/MilestonePanel";

const CHARACTER_PALETTE = [
  "#f59e0b", "#3b82f6", "#10b981", "#a855f7", "#ef4444",
  "#14b8a6", "#f97316", "#ec4899", "#6366f1", "#84cc16",
];

const TYPE_LEGEND = [
  { type: "introduction", color: "#3b82f6", label: "Introduction" },
  { type: "growth", color: "#10b981", label: "Growth" },
  { type: "conflict", color: "#ef4444", label: "Conflict" },
  { type: "revelation", color: "#a855f7", label: "Revelation" },
  { type: "transformation", color: "#f59e0b", label: "Transformation" },
  { type: "arc_peak", color: "#f97316", label: "Arc Peak" },
  { type: "advisory_review", color: "#6366f1", label: "Adv. Review" },
  { type: "resolution", color: "#14b8a6", label: "Resolution" },
];

export default function CharacterTimeline() {
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [visibleChapters, setVisibleChapters] = useState({ start: 1, end: 10 });
  const [filterAdvisor, setFilterAdvisor] = useState("");
  const scrollRef = useRef(null);

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["books-timeline"],
    queryFn: () => base44.entities.Book.list("-updated_date", 50),
  });

  const { data: milestones = [], isLoading: msLoading } = useQuery({
    queryKey: ["milestones", selectedBook?.id],
    queryFn: () => base44.entities.CharacterMilestone.filter({ book_id: selectedBook?.id }),
    enabled: !!selectedBook?.id,
  });

  useEffect(() => {
    if (books.length > 0 && !selectedBook) setSelectedBook(books[0]);
  }, [books]);

  // Derive characters and chapter range from milestones + book
  const characters = [...new Set(milestones.map(m => m.character_name))];
  const bookChapters = (selectedBook?.table_of_contents?.length || selectedBook?.manuscript_chapters?.length || 0);
  const totalChapters = Math.max(bookChapters, milestones.reduce((m, ms) => Math.max(m, ms.chapter_number), 1), 10);

  const charsWithColors = characters.map((name, i) => ({
    name,
    color: CHARACTER_PALETTE[i % CHARACTER_PALETTE.length],
  }));

  const filteredMilestones = filterAdvisor
    ? milestones.filter(m => m.advisor_notes?.some(n => n.advisor_id === filterAdvisor || n.advisor_name?.toLowerCase().includes(filterAdvisor.toLowerCase())))
    : milestones;

  const visibleCount = visibleChapters.end - visibleChapters.start + 1;
  const chapterNumbers = Array.from({ length: visibleCount }, (_, i) => visibleChapters.start + i);

  const scrollLeft = () => {
    if (visibleChapters.start <= 1) return;
    const shift = Math.min(5, visibleChapters.start - 1);
    setVisibleChapters(p => ({ start: p.start - shift, end: p.end - shift }));
  };

  const scrollRight = () => {
    if (visibleChapters.end >= totalChapters) return;
    const shift = Math.min(5, totalChapters - visibleChapters.end);
    setVisibleChapters(p => ({ start: p.start + shift, end: p.end + shift }));
  };

  const saveMilestone = async (form) => {
    const data = { ...form, book_id: selectedBook.id };
    if (form.id) {
      await base44.entities.CharacterMilestone.update(form.id, data);
    } else {
      await base44.entities.CharacterMilestone.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ["milestones", selectedBook?.id] });
    setSelectedMilestone(null);
    setIsNew(false);
  };

  const deleteMilestone = async (id) => {
    if (!confirm("Delete this milestone?")) return;
    await base44.entities.CharacterMilestone.delete(id);
    queryClient.invalidateQueries({ queryKey: ["milestones", selectedBook?.id] });
    setSelectedMilestone(null);
  };

  const openNew = (characterName, chapterNumber) => {
    setSelectedMilestone({ character_name: characterName, chapter_number: chapterNumber, milestone_type: "growth", completed: false });
    setIsNew(true);
  };

  if (booksLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Character Development Timeline</h1>
              <p className="text-white/30 text-xs">{milestones.length} milestones · {characters.length} characters tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Book selector */}
            <select value={selectedBook?.id || ""} onChange={e => setSelectedBook(books.find(b => b.id === e.target.value))}
              className="bg-slate-800 border border-white/15 text-white text-sm rounded-lg px-3 py-1.5 max-w-[200px]">
              {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <Button onClick={() => openNew("", 1)} disabled={!selectedBook}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-8 text-sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main timeline area */}
        <div className={cn("flex-1 flex flex-col overflow-hidden", selectedMilestone ? "lg:w-auto" : "")}>
          {!selectedBook ? (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a book to view its timeline</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-6 overflow-auto">
              {/* Stats row */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <Card className="bg-white/5 border-white/10 flex-1 min-w-[120px]">
                  <CardContent className="py-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <div><p className="text-white font-semibold">{characters.length}</p><p className="text-white/40 text-xs">Characters</p></div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 flex-1 min-w-[120px]">
                  <CardContent className="py-3 flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-amber-400" />
                    <div><p className="text-white font-semibold">{milestones.length}</p><p className="text-white/40 text-xs">Milestones</p></div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 flex-1 min-w-[120px]">
                  <CardContent className="py-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="text-white font-semibold">{milestones.reduce((s, m) => s + (m.advisor_notes?.length || 0), 0)}</p>
                      <p className="text-white/40 text-xs">Advisor Notes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 flex-1 min-w-[120px]">
                  <CardContent className="py-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <div><p className="text-white font-semibold">{totalChapters}</p><p className="text-white/40 text-xs">Chapters</p></div>
                  </CardContent>
                </Card>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 mb-5">
                {TYPE_LEGEND.map(t => (
                  <div key={t.type} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-white/40 text-xs">{t.label}</span>
                  </div>
                ))}
              </div>

              {/* Chapter navigation */}
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" onClick={scrollLeft} disabled={visibleChapters.start <= 1}
                  className="text-white/50 hover:text-white h-7 w-7">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <p className="text-white/30 text-xs">Chapters {visibleChapters.start} – {visibleChapters.end} of {totalChapters}</p>
                <Button variant="ghost" size="icon" onClick={scrollRight} disabled={visibleChapters.end >= totalChapters}
                  className="text-white/50 hover:text-white h-7 w-7">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Timeline grid */}
              <div className="flex-1 bg-slate-900/40 rounded-2xl border border-white/8 overflow-hidden">
                {/* Chapter headers */}
                <div className="flex border-b border-white/8">
                  <div className="w-36 shrink-0 px-4 py-2.5 bg-slate-900/60 border-r border-white/8">
                    <p className="text-white/30 text-xs font-medium uppercase tracking-wider">Character</p>
                  </div>
                  <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${visibleCount}, 1fr)` }}>
                    {chapterNumbers.map(ch => {
                      const chTitle = selectedBook?.table_of_contents?.find(t => t.chapter_number === ch)?.chapter_title || selectedBook?.manuscript_chapters?.find(c => c.chapter_number === ch)?.chapter_title;
                      const hasMilestones = filteredMilestones.some(m => m.chapter_number === ch);
                      return (
                        <div key={ch} className={cn("py-2.5 px-2 text-center border-r border-white/5 last:border-0", hasMilestones && "bg-amber-500/5")}>
                          <p className="text-white/60 text-xs font-semibold">Ch.{ch}</p>
                          {chTitle && <p className="text-white/25 text-[9px] truncate mt-0.5" title={chTitle}>{chTitle}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Character rows */}
                {characters.length === 0 ? (
                  <div className="flex items-center justify-center py-20 text-center">
                    <div>
                      <GitBranch className="w-10 h-10 text-white/15 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No milestones yet.</p>
                      <p className="text-white/20 text-xs mt-1">Add a milestone to start building your character timeline.</p>
                      <Button onClick={() => openNew("", 1)} size="sm"
                        className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add First Milestone
                      </Button>
                    </div>
                  </div>
                ) : (
                  characters.map((charName, rowIdx) => {
                    const charColor = charsWithColors.find(c => c.name === charName)?.color || "#f59e0b";
                    const charMilestones = filteredMilestones.filter(m => m.character_name === charName && m.chapter_number >= visibleChapters.start && m.chapter_number <= visibleChapters.end);

                    return (
                      <div key={charName} className="flex border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors group">
                        {/* Character label */}
                        <div className="w-36 shrink-0 px-4 py-4 border-r border-white/8 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: charColor }} />
                          <p className="text-white/70 text-sm font-medium truncate">{charName}</p>
                        </div>

                        {/* Milestone track */}
                        <div className="flex-1 relative min-h-[64px] grid" style={{ gridTemplateColumns: `repeat(${visibleCount}, 1fr)` }}>
                          {/* Connecting line */}
                          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 opacity-20" style={{ background: charColor }} />

                          {/* Column click zones */}
                          {chapterNumbers.map(ch => (
                            <div key={ch}
                              className="border-r border-white/4 last:border-0 flex items-center justify-center cursor-pointer hover:bg-amber-500/5 transition-colors"
                              onClick={() => openNew(charName, ch)}
                              title={`Add milestone for ${charName} at Ch.${ch}`}
                            />
                          ))}

                          {/* Milestone nodes — positioned absolutely over grid */}
                          {charMilestones.map(ms => (
                            <div key={ms.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                              <div className="relative h-full" style={{ pointerEvents: "auto" }}>
                                <TimelineTrack
                                  milestone={ms}
                                  onClick={(m) => { setSelectedMilestone(m); setIsNew(false); }}
                                  isSelected={selectedMilestone?.id === ms.id}
                                  chapterWidth={visibleCount}
                                  startChapter={visibleChapters.start}

                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Character color legend */}
              {charsWithColors.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {charsWithColors.map(c => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                      <span className="text-white/50 text-xs">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden shrink-0 h-full"
            >
              <div style={{ width: 360, height: "100%" }}>
                <MilestonePanel
                  milestone={isNew ? null : selectedMilestone}
                  onClose={() => { setSelectedMilestone(null); setIsNew(false); }}
                  onSave={isNew ? saveMilestone : async (form) => { await saveMilestone({ ...form, id: selectedMilestone.id }); }}
                  onDelete={deleteMilestone}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}