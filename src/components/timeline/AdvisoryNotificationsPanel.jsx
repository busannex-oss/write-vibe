import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell, CheckCircle2, X, Clock, BookOpen, Star, ChevronDown, ChevronUp,
  Loader2, MessageSquare, AlertCircle, Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_CONFIG = {
  high:   { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",    dot: "bg-red-400" },
  medium: { color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  low:    { color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" },
};

const STATUS_CONFIG = {
  pending:   { icon: Clock,         color: "text-amber-400", label: "Pending" },
  reviewed:  { icon: CheckCircle2,  color: "text-emerald-400", label: "Reviewed" },
  dismissed: { icon: X,             color: "text-slate-400", label: "Dismissed" },
};

const ADVISOR_AVATARS = {
  advisory_toni_morrison: "TM",
  advisory_jk_rowling: "JR",
  advisory_shonda_rhimes: "SR",
  advisory_tyler_perry: "TP",
  advisory_thurgood_marshall: "TM",
  advisory_slade_kevin_morrison: "SK",
};

const ADVISOR_COLORS = {
  advisory_toni_morrison: "bg-purple-500",
  advisory_jk_rowling: "bg-blue-500",
  advisory_shonda_rhimes: "bg-rose-500",
  advisory_tyler_perry: "bg-emerald-500",
  advisory_thurgood_marshall: "bg-amber-600",
  advisory_slade_kevin_morrison: "bg-indigo-500",
};

function NotificationCard({ notif, onUpdate, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewText, setReviewText] = useState(notif.review_notes || "");
  const [saving, setSaving] = useState(false);
  const cfg = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[notif.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const markReviewed = async () => {
    setSaving(true);
    await base44.entities.AdvisoryNotification.update(notif.id, {
      status: "reviewed",
      review_notes: reviewText,
      reviewed_at: new Date().toISOString(),
    });
    setSaving(false);
    onUpdate();
  };

  const dismiss = async () => {
    await base44.entities.AdvisoryNotification.update(notif.id, { status: "dismissed" });
    onUpdate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border overflow-hidden transition-all", cfg.bg,
        notif.status !== "pending" && "opacity-50")}
    >
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          {/* Advisor avatar */}
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5",
            ADVISOR_COLORS[notif.advisor_id] || "bg-indigo-500")}>
            {ADVISOR_AVATARS[notif.advisor_id] || notif.advisor_name?.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white text-xs font-semibold leading-tight">{notif.advisor_name}</p>
                <p className="text-white/40 text-[10px] mt-0.5">
                  {notif.book_title} · Ch.{notif.chapter_number}
                  {notif.character_name && ` · ${notif.character_name}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                <span className={cn("text-[10px] font-medium capitalize", cfg.color)}>{notif.priority}</span>
              </div>
            </div>

            {notif.milestone_title && (
              <p className="text-white/60 text-xs mt-1.5 bg-white/5 rounded px-2 py-1 border border-white/8">
                📌 {notif.milestone_title}
              </p>
            )}

            <p className="text-white/40 text-[10px] mt-1.5 leading-relaxed italic">"{notif.reason}"</p>
          </div>
        </div>

        {/* Actions */}
        {notif.status === "pending" && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/8">
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
              <MessageSquare className="w-3 h-3" />
              Add Review
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <div className="flex-1" />
            <button onClick={dismiss} className="text-white/20 hover:text-white/50 text-xs transition-colors">
              Dismiss
            </button>
            <button onClick={markReviewed}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Mark Reviewed
            </button>
          </div>
        )}
      </div>

      {/* Expandable review input */}
      <AnimatePresence>
        {expanded && notif.status === "pending" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={2}
                placeholder="Enter advisory review notes..."
                className="w-full px-2 py-1.5 bg-white/5 border border-white/15 text-white text-xs rounded resize-none placeholder:text-white/25"
              />
              <Button size="sm" onClick={markReviewed} disabled={saving}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                Submit Review
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdvisoryNotificationsPanel({ bookId }) {
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["advisory-notifications", bookId],
    queryFn: () => bookId
      ? base44.entities.AdvisoryNotification.filter({ book_id: bookId }, "-created_date", 50)
      : base44.entities.AdvisoryNotification.list("-created_date", 50),
    refetchInterval: 30000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["advisory-notifications", bookId] });

  const pending = notifications.filter(n => n.status === "pending");
  const reviewed = notifications.filter(n => n.status === "reviewed");
  const visible = showAll ? notifications : notifications.slice(0, 10);

  if (isLoading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Summary badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">{pending.length} pending</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">{reviewed.length} reviewed</span>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Inbox className="w-8 h-8 text-white/15 mx-auto mb-2" />
          <p className="text-white/30 text-sm">No advisory notifications yet.</p>
          <p className="text-white/20 text-xs mt-1">They'll appear automatically when milestones are saved.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visible.map(notif => (
              <NotificationCard key={notif.id} notif={notif} onUpdate={refresh} onDismiss={refresh} />
            ))}
          </div>
          {notifications.length > 10 && (
            <button onClick={() => setShowAll(!showAll)}
              className="text-white/30 hover:text-white/60 text-xs transition-colors flex items-center gap-1 mx-auto">
              {showAll ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {notifications.length}</>}
            </button>
          )}
        </>
      )}
    </div>
  );
}