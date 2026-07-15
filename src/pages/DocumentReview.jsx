import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import CommentThread from "@/components/book/CommentThread";
import ShareBookDialog from "@/components/book/ShareBookDialog";
import { BookOpen, Users, Share2, FileText, User, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookId, setBookId] = useState(null);
  const [view, setView] = useState("chapters"); // chapters | characters
  const [targetKey, setTargetKey] = useState(null); // identifier for selected target
  const [shareOpen, setShareOpen] = useState(false);

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["review-books"],
    queryFn: () => base44.entities.Book.list("-updated_date"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["shared-book", bookId],
    queryFn: async () => {
      const res = await base44.functions.invoke("sharedBook", { action: "get", book_id: bookId });
      return res.data;
    },
    enabled: !!bookId,
  });

  const book = data?.book;
  const comments = data?.comments || [];
  const access = data?.access || {};
  const canComment = access.isOwner || access.isAdmin || access.isMember;

  const chapters = book?.manuscript_chapters?.length
    ? book.manuscript_chapters
    : (book?.outline || []);
  const characters = book?.characters || [];

  const selectedChapter = chapters.find((c) => `${c.chapter_number}` === targetKey);
  const selectedCharacter = characters.find((c) => c.name === targetKey);

  const targetComments = comments.filter((c) => {
    if (view === "chapters" && selectedChapter) {
      return c.target_type === "chapter" && Number(c.chapter_number) === Number(selectedChapter.chapter_number);
    }
    if (view === "characters" && selectedCharacter) {
      return c.target_type === "character" && c.character_name === selectedCharacter.name;
    }
    return false;
  });

  const addMutation = useMutation({
    mutationFn: (content) =>
      base44.functions.invoke("sharedBook", {
        action: "comment",
        book_id: bookId,
        target_type: view === "chapters" ? "chapter" : "character",
        chapter_number: view === "chapters" ? selectedChapter?.chapter_number : null,
        character_name: view === "characters" ? selectedCharacter?.name : null,
        content,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-book", bookId] }),
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resolveMutation = useMutation({
    mutationFn: (comment) =>
      base44.functions.invoke("sharedBook", {
        action: "resolve",
        book_id: bookId,
        comment_id: comment.id,
        status: comment.status === "open" ? "addressed" : "open",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-book", bookId] }),
  });

  const countFor = (type, id) =>
    comments.filter((c) => type === "chapter"
      ? c.target_type === "chapter" && Number(c.chapter_number) === Number(id)
      : c.target_type === "character" && c.character_name === id).length;

  // Book picker
  if (!bookId) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Document Review</h1>
            <p className="text-sm text-white/50">Share drafts & profiles with your team and collect inline comments.</p>
          </div>
        </div>
        {booksLoading ? (
          <p className="text-white/40 text-sm">Loading…</p>
        ) : books.length === 0 ? (
          <p className="text-white/40 text-sm">No books yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((b) => (
              <button key={b.id} onClick={() => { setBookId(b.id); setTargetKey(null); }} className="text-left">
                <Card className="bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all h-full">
                  <CardContent className="py-4">
                    <FileText className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="font-medium text-white text-sm truncate">{b.title}</p>
                    <p className="text-xs text-white/40 mt-1">{b.category || "Uncategorized"}</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => { setBookId(null); setTargetKey(null); }} className="text-white/50 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> All books
      </Button>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{book?.title}</h1>
          <p className="text-xs text-white/40">{canComment ? "You can view and comment" : "View only"}</p>
        </div>
        <Button size="sm" onClick={() => setShareOpen(true)}>
          <Share2 className="w-4 h-4" />Share for review
        </Button>
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={view === "chapters" ? "default" : "outline"} onClick={() => { setView("chapters"); setTargetKey(null); }}>
          <FileText className="w-4 h-4" />Chapters ({chapters.length})
        </Button>
        <Button size="sm" variant={view === "characters" ? "default" : "outline"} onClick={() => { setView("characters"); setTargetKey(null); }}>
          <User className="w-4 h-4" />Characters ({characters.length})
        </Button>
      </div>

      {isLoading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr_340px] gap-4">
          {/* List */}
          <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto pr-1">
            {view === "chapters" && (chapters.length === 0 && <p className="text-xs text-white/30 italic">No chapters yet.</p>)}
            {view === "chapters" && chapters.map((c) => (
              <button key={`${c.chapter_number}`} onClick={() => setTargetKey(`${c.chapter_number}`)} className={cn("w-full text-left px-3 py-2.5 rounded-lg border transition-all", targetKey === `${c.chapter_number}` ? "border-amber-500/50 bg-amber-500/10" : "border-white/10 bg-white/5 hover:bg-white/10")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/40">Ch. {c.chapter_number}</span>
                  {countFor("chapter", c.chapter_number) > 0 && <Badge className="bg-amber-500/20 text-amber-300 border-0 text-xs">{countFor("chapter", c.chapter_number)}</Badge>}
                </div>
                <p className="text-sm text-white/80 truncate">{c.chapter_title || `Chapter ${c.chapter_number}`}</p>
              </button>
            ))}
            {view === "characters" && (characters.length === 0 && <p className="text-xs text-white/30 italic">No characters yet.</p>)}
            {view === "characters" && characters.map((c) => (
              <button key={c.name} onClick={() => setTargetKey(c.name)} className={cn("w-full text-left px-3 py-2.5 rounded-lg border transition-all", targetKey === c.name ? "border-amber-500/50 bg-amber-500/10" : "border-white/10 bg-white/5 hover:bg-white/10")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white/80 truncate">{c.name}</span>
                  {countFor("character", c.name) > 0 && <Badge className="bg-amber-500/20 text-amber-300 border-0 text-xs">{countFor("character", c.name)}</Badge>}
                </div>
                <p className="text-xs text-white/40 truncate">{c.role}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:max-h-[70vh] lg:overflow-y-auto pr-1">
            {!targetKey ? (
              <Card className="bg-white/5 border-white/10 h-full min-h-[300px] flex items-center justify-center">
                <CardContent className="py-12 text-center">
                  <ChevronRight className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/40">Select a {view === "chapters" ? "chapter" : "character"} to review.</p>
                </CardContent>
              </Card>
            ) : view === "chapters" && selectedChapter ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-5">
                  <p className="text-xs text-amber-400/70 mb-1">Chapter {selectedChapter.chapter_number}</p>
                  <h2 className="text-lg font-semibold text-white mb-3">{selectedChapter.chapter_title || `Chapter ${selectedChapter.chapter_number}`}</h2>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{selectedChapter.content || selectedChapter.summary || "No content written yet for this chapter."}</p>
                  </div>
                </CardContent>
              </Card>
            ) : view === "characters" && selectedCharacter ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                      {selectedCharacter.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedCharacter.name}</h2>
                      <p className="text-xs text-white/40">{selectedCharacter.role}</p>
                    </div>
                  </div>
                  {selectedCharacter.description && <p className="text-sm text-white/70">{selectedCharacter.description}</p>}
                  {selectedCharacter.backstory && <div><p className="text-xs text-amber-400/70 mb-1">Backstory</p><p className="text-sm text-white/60">{selectedCharacter.backstory}</p></div>}
                  {selectedCharacter.traits?.length > 0 && <div><p className="text-xs text-amber-400/70 mb-1">Traits</p><div className="flex flex-wrap gap-1.5">{selectedCharacter.traits.map((t,i) => <Badge key={i} className="bg-white/10 text-white/60 border-0">{t}</Badge>)}</div></div>}
                  {selectedCharacter.appearance && <div><p className="text-xs text-amber-400/70 mb-1">Appearance</p><p className="text-sm text-white/60">{selectedCharacter.appearance}</p></div>}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Comments */}
          <Card className="bg-white/5 border-white/10 lg:max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              {targetKey ? (
                <CommentThread
                  comments={targetComments}
                  onAdd={(text) => addMutation.mutate(text)}
                  onResolve={(c) => resolveMutation.mutate(c)}
                  isAdding={addMutation.isPending}
                  canComment={canComment}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <p className="text-sm text-white/30">Pick a {view === "chapters" ? "chapter" : "character"} to see its comment thread.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {shareOpen && book && (
        <ShareBookDialog bookId={bookId} bookTitle={book.title} onClose={() => setShareOpen(false)} onShared={() => queryClient.invalidateQueries({ queryKey: ["shared-book", bookId] })} />
      )}
    </div>
  );
}