import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users, Plus, Loader2, Send, Trash2, CheckCircle2, MessageSquare,
  ExternalLink, ShieldCheck, Copy, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const invoke = (action, extra = {}) => base44.functions.invoke("agentPortal", { action, ...extra });

const STATUS_COLORS = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  revoked: "bg-red-500/20 text-red-300 border-red-500/30",
  expired: "bg-slate-500/20 text-slate-300 border-slate-500/30"
};

export default function AgentAccessPanel({ book }) {
  const [agents, setAgents] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [expandedComment, setExpandedComment] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [form, setForm] = useState({
    agent_email: "", agent_name: "", agency_name: "",
    permissions: ["metadata", "manuscript_preview", "milestones", "comments"],
    expires_at: "", notes: ""
  });

  const load = async () => {
    setLoading(true);
    const [agentsRes, commentsRes] = await Promise.all([
      invoke("get_agents", { book_id: book.id }),
      invoke("get_comments", { book_id: book.id })
    ]);
    setAgents(agentsRes.data.agents || []);
    setComments(commentsRes.data.comments || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [book.id]);

  const handleInvite = async () => {
    if (!form.agent_email) return;
    setInviting(true);
    await invoke("invite_agent", { book_id: book.id, ...form });
    await load();
    setForm({ agent_email: "", agent_name: "", agency_name: "", permissions: ["metadata", "manuscript_preview", "milestones", "comments"], expires_at: "", notes: "" });
    setShowInviteForm(false);
    setInviting(false);
  };

  const handleRevoke = async (agent) => {
    await invoke("revoke", { agent_id: agent.id });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: "revoked" } : a));
  };

  const handleReply = async (comment) => {
    await invoke("update_comment", { comment_id: comment.id, status: "addressed", author_reply: replyText[comment.id] || "" });
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, status: "addressed", author_reply: replyText[comment.id] } : c));
    setReplyText(prev => ({ ...prev, [comment.id]: "" }));
    setExpandedComment(null);
  };

  const copyPortalUrl = (token) => {
    const url = `${window.location.origin}/AgentPortal?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const togglePermission = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const PERM_OPTIONS = [
    { value: "metadata", label: "Book Metadata" },
    { value: "manuscript_preview", label: "Manuscript Preview" },
    { value: "milestones", label: "Milestones" },
    { value: "comments", label: "Leave Comments" }
  ];

  const openComments = comments.filter(c => c.status === "open");
  const allComments = comments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h2 className="text-white font-bold text-lg">Literary Agent Access</h2>
          {openComments.length > 0 && (
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{openComments.length} open</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowInviteForm(s => !s)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            <Plus className="w-3 h-3 mr-1" /> Invite Agent
          </Button>
        </div>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-5 space-y-4">
          <h3 className="text-amber-400 font-semibold text-sm">Invite a Literary Agent</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={form.agent_email} onChange={e => setForm(p => ({...p, agent_email: e.target.value}))}
              placeholder="agent@agency.com *" className="bg-white/5 border-white/15 text-white placeholder:text-white/30" />
            <Input value={form.agent_name} onChange={e => setForm(p => ({...p, agent_name: e.target.value}))}
              placeholder="Agent Full Name" className="bg-white/5 border-white/15 text-white placeholder:text-white/30" />
            <Input value={form.agency_name} onChange={e => setForm(p => ({...p, agency_name: e.target.value}))}
              placeholder="Agency Name" className="bg-white/5 border-white/15 text-white placeholder:text-white/30" />
            <Input type="date" value={form.expires_at} onChange={e => setForm(p => ({...p, expires_at: e.target.value}))}
              placeholder="Access Expiry (optional)" className="bg-white/5 border-white/15 text-white" />
          </div>
          <div>
            <p className="text-white/50 text-xs mb-2">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {PERM_OPTIONS.map(p => (
                <button key={p.value} onClick={() => togglePermission(p.value)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    form.permissions.includes(p.value)
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-white/5 text-white/40 border-white/10")}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowInviteForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleInvite} disabled={inviting || !form.agent_email}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {inviting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
              Send Invite
            </Button>
          </div>
        </div>
      )}

      {/* Agent List */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
      ) : agents.length === 0 ? (
        <div className="bg-slate-900 border border-white/8 rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No agents invited yet. Invite a literary agent to grant secure read-only access.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent.id} className="bg-slate-900 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 text-sm font-bold">{(agent.agent_name || agent.agent_email).charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{agent.agent_name || agent.agent_email}</p>
                  <p className="text-white/40 text-xs">{agent.agent_email} {agent.agency_name && `· ${agent.agency_name}`}</p>
                  {agent.last_accessed && <p className="text-white/25 text-xs">Last accessed: {new Date(agent.last_accessed).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("text-xs", STATUS_COLORS[agent.status] || STATUS_COLORS.active)}>{agent.status}</Badge>
                  {agent.status === 'active' && (
                    <>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => copyPortalUrl(agent.access_token)}>
                        {copiedToken === agent.access_token ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedToken === agent.access_token ? "Copied!" : "Copy Link"}
                      </Button>
                      <a href={`/AgentPortal?token=${agent.access_token}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-7 text-xs"><ExternalLink className="w-3 h-3 mr-1" />Preview</Button>
                      </a>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10"
                        onClick={() => handleRevoke(agent)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Revoke
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {agent.permissions && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {agent.permissions.map(p => (
                    <span key={p} className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">{p.replace('_', ' ')}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Agent Comments */}
      {allComments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Agent Feedback
            <span className="text-white/30 text-sm font-normal">({allComments.length} comments)</span>
          </h3>
          {allComments.map(c => (
            <div key={c.id} className={cn("bg-slate-900 border rounded-xl p-4 space-y-2",
              c.status === "open" ? "border-amber-500/20" : "border-white/8")}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium text-sm">{c.agent_name || c.agent_email}</span>
                <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/25 text-xs capitalize">{c.comment_type?.replace('_', ' ')}</Badge>
                {c.priority === 'high' && <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">High Priority</Badge>}
                {c.chapter_number > 0 && <span className="text-white/30 text-xs">· Ch. {c.chapter_number}</span>}
                {c.status === 'addressed' && <Badge className="bg-emerald-500/15 text-emerald-300 border-0 text-xs ml-auto">Addressed</Badge>}
                {c.status === 'open' && (
                  <button onClick={() => setExpandedComment(expandedComment === c.id ? null : c.id)}
                    className="text-amber-400 text-xs ml-auto flex items-center gap-1 hover:text-amber-300">
                    Reply {expandedComment === c.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
                <span className="text-white/25 text-xs">{new Date(c.created_date).toLocaleDateString()}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{c.content}</p>
              {c.author_reply && (
                <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-3">
                  <p className="text-amber-400/60 text-xs font-semibold mb-1">Your Reply</p>
                  <p className="text-white/60 text-sm">{c.author_reply}</p>
                </div>
              )}
              {expandedComment === c.id && (
                <div className="flex gap-2 pt-1">
                  <Input value={replyText[c.id] || ""} onChange={e => setReplyText(p => ({...p, [c.id]: e.target.value}))}
                    placeholder="Reply to this comment..." className="bg-white/5 border-white/15 text-white placeholder:text-white/30 text-sm h-8" />
                  <Button size="sm" onClick={() => handleReply(c)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shrink-0 h-8">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Addressed
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}