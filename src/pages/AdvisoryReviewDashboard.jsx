import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BookOpen, CheckCircle2, X, Clock, Filter, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Star, Users, BarChart3, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_STYLES = {
  high:   { bg: "#7f1d1d25", border: "#ef4444", text: "#fca5a5", badge: "bg-red-500/20 text-red-400 border-red-500/30", label: "HIGH" },
  medium: { bg: "#78350f25", border: "#f59e0b", text: "#fcd34d", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "MED" },
  low:    { bg: "#1e3a5f25", border: "#3b82f6", text: "#93c5fd", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "LOW" },
};

const STATUS_TABS = [
  { key: "pending",  label: "Pending",  icon: Clock },
  { key: "reviewed", label: "Reviewed", icon: CheckCircle2 },
  { key: "dismissed",label: "Dismissed",icon: X },
  { key: "all",      label: "All",      icon: Inbox },
];

// All known advisory board members with their expertise
const ADVISORS = [
  { id: "advisory_oprah",           name: "Oprah Winfrey",       expertise_tags: ["Storytelling", "Audience Building", "Emotional Resonance", "Authenticity"] },
  { id: "advisory_tyler_perry",     name: "Tyler Perry",         expertise_tags: ["Narrative Arc", "Character Voice", "Cultural Relevance", "World-Building"] },
  { id: "advisory_thurgood",        name: "Thurgood Marshall",   expertise_tags: ["Intellectual Property", "Literary Rights", "Publishing Law", "Content Ethics"] },
  { id: "advisory_maya_angelou",    name: "Maya Angelou",        expertise_tags: ["Authentic Voice", "Memoir", "Emotional Truth", "Prose Poetry", "Courage in Writing"] },
  { id: "advisory_slade_kevin_morrison", name: "Slade Kevin Morrison", expertise_tags: ["Platform Vision", "Founder Strategy", "Culture Building", "Mission Alignment", "Author Empowerment"] },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function NotificationCard({ n, onMarkReviewed, onDismiss }) {
  const p = PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.medium;
  const isPending = n.status === "pending";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: isPending ? p.bg : "#0f172a", borderColor: isPending ? p.border + "50" : "#1e293b" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${p.badge}`}>
              {p.label}
            </span>
          )}
          <span className="font-semibold text-white text-sm">{n.advisor_name}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/60 text-xs flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {n.book_title || "Unknown Book"} — Ch.{n.chapter_number}
          </span>
          {n.character_name && (
            <span className="text-xs text-white/40">· {n.character_name}</span>
          )}
        </div>
        <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0">
          {n.created_date ? new Date(n.created_date).toLocaleDateString() : ""}
        </span>
      </div>

      {n.milestone_title && (
        <p className="text-xs text-white/50">
          <span className="text-white/30">Milestone: </span>{n.milestone_title}
        </p>
      )}

      {n.expertise_match && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: "#34d39915", borderColor: "#34d39940", color: "#34d39980" }}>
          {n.expertise_match}
        </span>
      )}

      {n.reason && (
        <p className="text-xs leading-relaxed text-white/60">{n.reason}</p>
      )}

      {isPending && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={() => onMarkReviewed(n.id)}
            className="h-7 text-xs gap-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
            <CheckCircle2 className="w-3 h-3" /> Mark Reviewed
          </Button>
          <Button size="sm" onClick={() => onDismiss(n.id)}
            className="h-7 text-xs gap-1 bg-white/5 text-white/40 border border-white/10 hover:bg-white/10">
            <X className="w-3 h-3" /> Dismiss
          </Button>
        </div>
      )}

      {n.status === "reviewed" && (
        <div className="flex items-center gap-1.5 text-xs text-green-400/70">
          <CheckCircle2 className="w-3 h-3" />
          Reviewed {n.reviewed_at ? `on ${new Date(n.reviewed_at).toLocaleDateString()}` : ""}
        </div>
      )}
    </motion.div>
  );
}

function AdvisorGroup({ advisor, notifications, onMarkReviewed, onDismiss, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const pending = notifications.filter(n => n.status === "pending");
  const hasPending = pending.length > 0;

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "#0a1628", borderColor: hasPending ? "#34d39940" : "#1e293b" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "#34d39920", color: "#34d399" }}>
            {advisor.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm">{advisor.name}</p>
            <p className="text-xs text-white/40 mt-0.5">{advisor.expertise_tags?.slice(0, 3).join(" · ")}</p>
          </div>
          {hasPending && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {pending.length} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">{notifications.length} total</span>
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
              {notifications.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-4">No requests for this advisor</p>
              ) : (
                <AnimatePresence>
                  {notifications.map(n => (
                    <NotificationCard key={n.id} n={n} onMarkReviewed={onMarkReviewed} onDismiss={onDismiss} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdvisoryReviewDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("pending");
  const [advisorFilter, setAdvisorFilter] = useState("all");
  const [groupByAdvisor, setGroupByAdvisor] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await base44.entities.AdvisoryNotification.list("-created_date", 200);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const markReviewed = async (id) => {
    await base44.entities.AdvisoryNotification.update(id, {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "reviewed", reviewed_at: new Date().toISOString() } : n));
  };

  const dismiss = async (id) => {
    await base44.entities.AdvisoryNotification.update(id, { status: "dismissed" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "dismissed" } : n));
  };

  const filtered = useMemo(() => {
    let list = notifications;
    if (statusTab !== "all") list = list.filter(n => n.status === statusTab);
    if (advisorFilter !== "all") list = list.filter(n => n.advisor_name === advisorFilter);
    return list;
  }, [notifications, statusTab, advisorFilter]);

  const pendingCount = notifications.filter(n => n.status === "pending").length;
  const reviewedCount = notifications.filter(n => n.status === "reviewed").length;
  const uniqueAdvisors = [...new Set(notifications.map(n => n.advisor_name))].filter(Boolean);
  const highPriorityCount = notifications.filter(n => n.status === "pending" && n.priority === "high").length;

  // Group filtered by advisor
  const groupedByAdvisor = useMemo(() => {
    const map = {};
    ADVISORS.forEach(a => { map[a.name] = []; });
    filtered.forEach(n => {
      if (!map[n.advisor_name]) map[n.advisor_name] = [];
      map[n.advisor_name].push(n);
    });
    // Sort: advisors with pending items first
    return Object.entries(map).sort(([, a], [, b]) => {
      const aPending = a.filter(n => n.status === "pending").length;
      const bPending = b.filter(n => n.status === "pending").length;
      return bPending - aPending;
    });
  }, [filtered]);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "#040d1a" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#34d39920" }}>
            <Users className="w-5 h-5" style={{ color: "#34d399" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Advisory Review Dashboard</h1>
            <p className="text-sm text-white/40">Centralized view of all chapter review requests for the Advisory Board</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={AlertTriangle} label="Pending Reviews" value={pendingCount} color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="High Priority" value={highPriorityCount} color="#ef4444" />
        <StatCard icon={CheckCircle2} label="Reviewed" value={reviewedCount} color="#34d399" />
        <StatCard icon={BarChart3} label="Total Requests" value={notifications.length} color="#3b82f6" />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#0f172a" }}>
          {STATUS_TABS.map(tab => {
            const count = tab.key === "all"
              ? notifications.length
              : notifications.filter(n => n.status === tab.key).length;
            const isActive = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? "#34d39920" : "transparent",
                  color: isActive ? "#34d399" : "#ffffff60",
                  border: isActive ? "1px solid #34d39940" : "1px solid transparent"
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: isActive ? "#34d39930" : "#ffffff15", color: isActive ? "#34d399" : "#ffffff40" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 items-center">
          {/* Advisor Filter */}
          <select
            value={advisorFilter}
            onChange={e => setAdvisorFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border text-white/70 bg-transparent outline-none"
            style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
          >
            <option value="all">All Advisors</option>
            {ADVISORS.map(a => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>

          {/* Group toggle */}
          <button
            onClick={() => setGroupByAdvisor(!groupByAdvisor)}
            className="text-xs px-3 py-2 rounded-lg border transition-all"
            style={{
              backgroundColor: groupByAdvisor ? "#34d39920" : "#0f172a",
              borderColor: groupByAdvisor ? "#34d39940" : "#1e293b",
              color: groupByAdvisor ? "#34d399" : "#ffffff50"
            }}
          >
            Group by Advisor
          </button>

          <button
            onClick={() => load(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:bg-white/5"
            style={{ borderColor: "#1e293b", color: "#ffffff40" }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-white/30 text-sm">Loading review requests…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 className="w-12 h-12 text-green-500/30 mx-auto mb-3" />
          <p className="text-white/30 text-sm">
            {statusTab === "pending" ? "No pending review requests — all clear!" : "No items in this view."}
          </p>
        </div>
      ) : groupByAdvisor ? (
        <div className="space-y-4">
          {groupedByAdvisor.map(([advisorName, items]) => {
            const advisorData = ADVISORS.find(a => a.name === advisorName);
            if (advisorFilter !== "all" && advisorName !== advisorFilter) return null;
            if (items.length === 0 && statusTab !== "all") return null;
            return (
              <AdvisorGroup
                key={advisorName}
                advisor={advisorData || { name: advisorName, expertise_tags: [] }}
                notifications={items}
                onMarkReviewed={markReviewed}
                onDismiss={dismiss}
                defaultOpen={items.some(n => n.status === "pending")}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(n => (
              <NotificationCard key={n.id} n={n} onMarkReviewed={markReviewed} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}