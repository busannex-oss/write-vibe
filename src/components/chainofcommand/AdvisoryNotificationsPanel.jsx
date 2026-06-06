import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BookOpen, CheckCircle2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PRIORITY_STYLES } from "./advisoryConstants";

export default function AdvisoryNotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await base44.entities.AdvisoryNotification.filter({ status: "pending" }, "-created_date", 20);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status, extra = {}) => {
    await base44.entities.AdvisoryNotification.update(id, { status, ...extra });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0f172a", borderColor: "#334155" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white tracking-wide">Advisory Board Notifications</span>
          {notifications.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {notifications.length} pending
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 space-y-3 max-h-96 overflow-y-auto">
              {loading && <div className="text-center py-6 text-white/40 text-sm">Loading…</div>}
              {!loading && notifications.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">No pending advisory notifications</div>
              )}
              {notifications.map(n => {
                const p = PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.medium;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-xl border p-4 space-y-2"
                    style={{ backgroundColor: p.bg, borderColor: p.border + "60" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: p.border + "25", color: p.text }}>
                          {p.label}
                        </span>
                        <span className="font-semibold text-white text-sm">{n.advisor_name}</span>
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {n.book_title} · Ch.{n.chapter_number}
                          {n.character_name && ` · ${n.character_name}`}
                        </span>
                      </div>
                      <button onClick={() => updateStatus(n.id, "dismissed")}
                        className="text-white/30 hover:text-white/70 transition-colors mt-0.5 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {n.milestone_title && (
                      <p className="text-xs text-white/60"><span className="text-white/40">Milestone: </span>{n.milestone_title}</p>
                    )}
                    {n.reason && (
                      <p className="text-xs leading-relaxed" style={{ color: p.text + "cc" }}>{n.reason}</p>
                    )}
                    <Button size="sm"
                      onClick={() => updateStatus(n.id, "reviewed", { reviewed_at: new Date().toISOString() })}
                      className="h-7 text-xs gap-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Mark Reviewed
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}