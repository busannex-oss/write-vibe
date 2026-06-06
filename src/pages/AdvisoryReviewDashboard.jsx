import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, CheckCircle2, X, Clock, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Users, BarChart3, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PRIORITY_STYLES, ADVISORS, ADVISOR_MAP } from "@/components/chainofcommand/advisoryConstants";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "pending",   label: "Pending",   icon: Clock },
  { key: "reviewed",  label: "Reviewed",  icon: CheckCircle2 },
  { key: "dismissed", label: "Dismissed", icon: X },
  { key: "all",       label: "All",       icon: Inbox },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${p.badge}`}>{p.label}</span>
          )}
          <span className="font-semibold text-white text-sm">{n.advisor_name}</span>
          <span className="text-white/60 text-xs flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {n.book_title || "Unknown Book"} — Ch.{n.chapter_number}
            {n.character_name && ` · ${n.character_name}`}
          </span>
        </div>
        <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0">
          {n.created_date ? new Date(n.created_date).toLocaleDateString() : ""}
        </span>
      </div>

      {n.milestone_title && (
        <p className="text-xs text-white/50"><span className="text-white/30">Milestone: </span>{n.milestone_title}</p>
      )}
      {n.expertise_match && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: "#34d39915", borderColor: "#34d39940", color: "#34d39980" }}>
          {n.expertise_match}
        </span>
      )}
      {n.reason && <p className="text-xs leading-relaxed text-white/60">{n.reason}</p>}

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
  const pendingCount = useMemo(() => notifications.filter(n => n.status === "pending").length, [notifications]);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "#0a1628", borderColor: pendingCount > 0 ? "#34d39940" : "#1e293b" }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "#34d39920", color: "#34d399" }}>
            {advisor.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm">{advisor.name}</p>
            <p className="text-xs text-white/40 mt-0.5">{advisor.expertise_tags?.slice(0, 3).join(" · ")}</p>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />{pendingCount} pending
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdvisoryReviewDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("pending");
  const [advisorFilter, setAdvisorFilter] = useState("all");
  const [groupByAdvisor, setGroupByAdvisor] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await base44.entities.AdvisoryNotification.list("-created_date", 200);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Single optimistic-update helper — no duplicated entity calls
  const applyUpdate = useCallback((id, patch) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));
    base44.entities.AdvisoryNotification.update(id, patch);
  }, []);

  const markReviewed = useCallback((id) =>
    applyUpdate(id, { status: "reviewed", reviewed_at: new Date().toISOString() }), [applyUpdate]);

  const dismiss = useCallback((id) =>
    applyUpdate(id, { status: "dismissed" }), [applyUpdate]);

  // All counts + filtered list in one pass
  const { pendingCount, reviewedCount, highPriorityCount, filtered } = useMemo(() => {
    let pendingCount = 0, reviewedCount = 0, highPriorityCount = 0;
    const filtered = [];

    for (const n of notifications) {
      if (n.status === "pending") {
        pendingCount++;
        if (n.priority === "high") highPriorityCount++;
      } else if (n.status === "reviewed") {
        reviewedCount++;
      }
      const matchesStatus = statusTab === "all" || n.status === statusTab;
      const matchesAdvisor = advisorFilter === "all" || n.advisor_name === advisorFilter;
      if (matchesStatus && matchesAdvisor) filtered.push(n);
    }
    return { pendingCount, reviewedCount, highPriorityCount, filtered };
  }, [notifications, statusTab, advisorFilter]);

  // Group by advisor — uses pre-filtered list, sorts by pending count desc
  const groupedByAdvisor = useMemo(() => {
    const map = new Map(ADVISORS.map(a => [a.name, []]));
    for (const n of filtered) {
      if (!map.has(n.advisor_name)) map.set(n.advisor_name, []);
      map.get(n.advisor_name).push(n);
    }
    return [...map.entries()].sort(([, a], [, b]) => {
      const diff = b.filter(n => n.status === "pending").length - a.filter(n => n.status === "pending").length;
      return diff !== 0 ? diff : b.length - a.length;
    });
  }, [filtered]);

  const tabCounts = useMemo(() => {
    const counts = { pending: 0, reviewed: 0, dismissed: 0, all: notifications.length };
    for (const n of notifications) counts[n.status] = (counts[n.status] || 0) + 1;
    return counts;
  }, [notifications]);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "#040d1a" }}>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#34d39920" }}>
          <Users className="w-5 h-5" style={{ color: "#34d399" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Advisory Review Dashboard</h1>
          <p className="text-sm text-white/40">Centralized chapter review requests for the Advisory Board</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={AlertTriangle} label="Pending Reviews"  value={pendingCount}           color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="High Priority"    value={highPriorityCount}       color="#ef4444" />
        <StatCard icon={CheckCircle2}  label="Reviewed"         value={reviewedCount}           color="#34d399" />
        <StatCard icon={BarChart3}     label="Total Requests"   value={notifications.length}    color="#3b82f6" />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#0f172a" }}>
          {STATUS_TABS.map(({ key, label, icon: Icon }) => {
            const count = tabCounts[key] || 0;
            const isActive = statusTab === key;
            return (
              <button key={key} onClick={() => setStatusTab(key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? "#34d39920" : "transparent",
                  color: isActive ? "#34d399" : "#ffffff60",
                  border: isActive ? "1px solid #34d39940" : "1px solid transparent",
                }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
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
          <select value={advisorFilter} onChange={e => setAdvisorFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border text-white/70 outline-none"
            style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}>
            <option value="all">All Advisors</option>
            {ADVISORS.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>

          <button onClick={() => setGroupByAdvisor(g => !g)}
            className="text-xs px-3 py-2 rounded-lg border transition-all"
            style={{
              backgroundColor: groupByAdvisor ? "#34d39920" : "#0f172a",
              borderColor: groupByAdvisor ? "#34d39940" : "#1e293b",
              color: groupByAdvisor ? "#34d399" : "#ffffff50",
            }}>
            Group by Advisor
          </button>

          <button onClick={() => load(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all hover:bg-white/5"
            style={{ borderColor: "#1e293b", color: "#ffffff40" }}>
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
            if (items.length === 0) return null;
            return (
              <AdvisorGroup
                key={advisorName}
                advisor={ADVISOR_MAP[advisorName] || { name: advisorName, expertise_tags: [] }}
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