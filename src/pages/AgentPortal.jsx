import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, MessageSquare, Loader2, Send, CheckCircle2,
  User, Calendar, FileText, ChevronDown, ChevronUp, AlertCircle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const invoke = (action, extra = {}) => base44.functions.invoke("agentPortal", { action, ...extra });

const COMMENT_TYPES = [
  { value: "general", label: "General" },
  { value: "pacing", label: "Pacing" },
  { value: "dialogue", label: "Dialogue" },
  { value: "character", label: "Character" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial Viability" },
  { value: "revision_request", label: "Revision Request" }
];

const PRIORITY_COLORS = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30"
};

export default function AgentPortal() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [access, setAccess] = useState(null);
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminBooks, setAdminBooks] = useState([]);
  const [selectedAdminBookId, setSelectedAdminBookId] = useState(null);

  // Comment form
  const [newComment, setNewComment] = useState({ content: "", comment_type: "general", chapter_number: 0, priority: "medium" });
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      // No token — check if admin
      base44.auth.me().then(user => {
        if (user?.role === 'admin') {
          setIsAdminView(true);
          // Load all books for admin
          base44.entities.Book.list().then(books => {
            setAdminBooks(books || []);
            if (books?.length > 0) setSelectedAdminBookId(books[0].id);
            setLoading(false);
          });
        } else {
          setError("No access token provided.");
          setLoading(false);
        }
      }).catch(() => { setError("No access token provided."); setLoading(false); });
      return;
    }
    invoke("token_login", { token }).then(r => {
      if (r.data.error) { setError(r.data.error); }
      else { setAccess(r.data.access); setBook(r.data.book); setComments(r.data.comments || []); }
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [token]);

  const handlePostComment = async () => {
    setPosting(true);
    const res = await invoke("post_comment", {
      token,
      book_id: access.book_id,
      agent_access_id: access.id,
      agent_name: access.agent_name,
      agent_email: access.agent_email,
      ...newComment
    });
    if (res.data.success) {
      setComments(prev => [res.data.comment, ...prev]);
      setNewComment({ content: "", comment_type: "general", chapter_number: 0, priority: "medium" });
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    }
    setPosting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-white/50 text-sm">{error}</p>
      </div>
    </div>
  );

  // Admin view: derive the selected book from adminBooks list
  const adminBook = isAdminView ? adminBooks.find(b => b.id === selectedAdminBookId) : null;
  const effectiveBook = isAdminView ? adminBook : book;

  const ALL_PERMS = ['metadata', 'manuscript_preview', 'milestones', 'comments'];
  const perms = isAdminView ? ALL_PERMS : (access?.permissions || []);
  const chapters = effectiveBook?.manuscript_chapters || [];
  const milestones = effectiveBook?.table_of_contents || [];

  const TABS = [
    { id: "overview", label: "Overview", show: perms.includes("metadata") },
    { id: "manuscript", label: `Manuscript (${chapters.length} ch.)`, show: perms.includes("manuscript_preview") },
    { id: "milestones", label: "Milestones", show: perms.includes("milestones") },
    { id: "comments", label: `Comments (${comments.length})`, show: perms.includes("comments") }
  ].filter(t => t.show);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/95 border-b border-white/5 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">The Write Vibe — Agent Portal</h1>
              <p className="text-white/40 text-xs">{isAdminView ? "Admin view — full access" : "Secure read-only manuscript access"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/40">
            {isAdminView ? (
              <select
                value={selectedAdminBookId || ''}
                onChange={e => setSelectedAdminBookId(e.target.value)}
                className="bg-slate-800 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm"
              >
                {adminBooks.map(b => <option key={b.id} value={b.id} className="bg-slate-800">{b.title}</option>)}
              </select>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>{access?.agent_name || access?.agent_email}</span>
                {access?.agency_name && <span>· {access.agency_name}</span>}
                {access?.expires_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires {new Date(access.expires_at).toLocaleDateString()}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto flex gap-1 mt-4">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && effectiveBook && (
          <div className="space-y-5">
            {effectiveBook.front_cover_url && (
              <div className="flex gap-6 items-start">
                <img src={effectiveBook.front_cover_url} alt="Cover" className="w-32 rounded-xl shadow-2xl border border-white/10 shrink-0" />
                <div className="space-y-2">
                  <h2 className="text-white text-2xl font-bold">{effectiveBook.title}</h2>
                  {effectiveBook.subtitle && <p className="text-white/50">{effectiveBook.subtitle}</p>}
                  <div className="flex flex-wrap gap-2">
                    {effectiveBook.category && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{effectiveBook.category}</Badge>}
                    {effectiveBook.status && <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 capitalize">{effectiveBook.status?.replace('_', ' ')}</Badge>}
                  </div>
                </div>
              </div>
            )}
            {!effectiveBook.front_cover_url && (
              <div>
                <h2 className="text-white text-2xl font-bold">{effectiveBook.title}</h2>
                {effectiveBook.subtitle && <p className="text-white/50 mt-1">{effectiveBook.subtitle}</p>}
              </div>
            )}

            {(effectiveBook.book_summary || effectiveBook.plot_summary) && (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Synopsis</h3>
                <p className="text-white/70 text-sm leading-relaxed">{effectiveBook.book_summary || effectiveBook.plot_summary}</p>
              </div>
            )}

            {effectiveBook.characters?.length > 0 && (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Key Characters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {effectiveBook.characters.map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{c.name}</span>
                        {c.role && <Badge className="bg-slate-600/30 text-slate-300 border-0 text-xs">{c.role}</Badge>}
                      </div>
                      {c.description && <p className="text-white/40 text-xs">{c.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {effectiveBook.target_audience && (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-2">Target Audience</h3>
                <p className="text-white/60 text-sm">{effectiveBook.target_audience.age_range && `Ages: ${effectiveBook.target_audience.age_range}`}</p>
                {effectiveBook.target_audience.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {effectiveBook.target_audience.interests.map((i, idx) => (
                      <span key={idx} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">{i}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MANUSCRIPT TAB */}
        {activeTab === "manuscript" && (
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
              📖 You are viewing a <strong>preview excerpt</strong> of each chapter (first 2,000 characters). Full manuscript access requires author authorization.
            </div>
            {chapters.length === 0 && (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-12 text-center">
                <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No manuscript chapters available yet.</p>
              </div>
            )}
            {chapters.map((ch, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition"
                  onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-bold flex items-center justify-center shrink-0">{ch.chapter_number}</span>
                    <span className="text-white font-medium">{ch.chapter_title}</span>
                    {ch.word_count > 0 && <span className="text-white/30 text-xs">{ch.word_count?.toLocaleString()} words</span>}
                  </div>
                  {expandedChapter === i ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </button>
                {expandedChapter === i && ch.content && (
                  <div className="px-5 pb-5 border-t border-white/5">
                    <p className="text-white/60 text-sm leading-relaxed mt-4 font-serif whitespace-pre-wrap">{ch.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MILESTONES TAB */}
        {activeTab === "milestones" && (
          <div className="space-y-3">
            {milestones.length === 0 && (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-12 text-center">
                <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No table of contents defined yet.</p>
              </div>
            )}
            {milestones.map((m, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <span className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-bold flex items-center justify-center shrink-0">{m.chapter_number}</span>
                <span className="text-white font-medium">{m.chapter_title}</span>
                {chapters[i]?.content ? (
                  <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">Written</Badge>
                ) : (
                  <Badge className="ml-auto bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">Pending</Badge>
                )}
              </div>
            ))}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">
                Chapters written: <span className="text-white font-semibold">{chapters.filter(c => c?.content).length}</span> / {milestones.length}
              </p>
            </div>
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === "comments" && (
          <div className="space-y-5">
            {/* New Comment Form */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-amber-400" /> Leave a Comment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={newComment.comment_type} onChange={e => setNewComment(p => ({...p, comment_type: e.target.value}))}
                  className="bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm">
                  {COMMENT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-slate-800">{t.label}</option>)}
                </select>
                <select value={newComment.chapter_number} onChange={e => setNewComment(p => ({...p, chapter_number: Number(e.target.value)}))}
                  className="bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm">
                  <option value={0} className="bg-slate-800">General (whole book)</option>
                  {chapters.map(c => <option key={c.chapter_number} value={c.chapter_number} className="bg-slate-800">Chapter {c.chapter_number}: {c.chapter_title}</option>)}
                </select>
                <select value={newComment.priority} onChange={e => setNewComment(p => ({...p, priority: e.target.value}))}
                  className="bg-white/5 border border-white/15 text-white rounded-lg px-3 py-2 text-sm">
                  <option value="low" className="bg-slate-800">Low Priority</option>
                  <option value="medium" className="bg-slate-800">Medium Priority</option>
                  <option value="high" className="bg-slate-800">High Priority</option>
                </select>
              </div>
              <Textarea value={newComment.content} onChange={e => setNewComment(p => ({...p, content: e.target.value}))}
                placeholder="Share your feedback on this manuscript..." rows={4}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30" />
              <div className="flex items-center justify-between">
                {postSuccess && <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Comment posted!</span>}
                <Button onClick={handlePostComment} disabled={!newComment.content.trim() || posting}
                  className="ml-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comment List */}
            {comments.length === 0 ? (
              <div className="bg-slate-900 border border-white/10 rounded-xl p-12 text-center">
                <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No comments yet. Be the first to leave feedback.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-xs", PRIORITY_COLORS[c.priority])}>{c.priority} priority</Badge>
                      <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/25 text-xs capitalize">{c.comment_type?.replace('_', ' ')}</Badge>
                      {c.chapter_number > 0 && <span className="text-white/30 text-xs">Chapter {c.chapter_number}</span>}
                      <span className="text-white/25 text-xs ml-auto">{new Date(c.created_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{c.content}</p>
                    {c.author_reply && (
                      <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-3 mt-2">
                        <p className="text-amber-300/70 text-xs font-semibold mb-1">Author's Reply</p>
                        <p className="text-white/60 text-sm">{c.author_reply}</p>
                      </div>
                    )}
                    {c.status === 'addressed' && <Badge className="bg-emerald-500/15 text-emerald-300 border-0 text-xs">Addressed</Badge>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}