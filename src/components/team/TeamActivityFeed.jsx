import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, BookOpen, FileText, Edit3, Plus } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

const ACTION_META = {
  book_created: { label: "Book created", icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  book_updated: { label: "Book updated", icon: Edit3, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  sop_created: { label: "SOP created", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  sop_updated: { label: "SOP updated", icon: Edit3, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

export default function TeamActivityFeed({ selectedBook }) {
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ['team-activity', selectedBook],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.filter({}, '-created_date', 20);
      return logs;
    }
  });

  const filtered = selectedBook
    ? activity.filter(log => log.entity_type === 'book' && log.summary?.toLowerCase().includes(''))
    : activity;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-white/50">
          Latest edits and creations across your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No recent activity yet</p>
            <p className="text-white/30 text-xs mt-1">Team edits and creations will appear here</p>
          </div>
        ) : (
          <div className="relative space-y-1 max-h-[28rem] overflow-y-auto pr-2">
            <div className="absolute left-[1.15rem] top-2 bottom-2 w-px bg-white/10" />
            {filtered.map((log, index) => {
              const meta = ACTION_META[log.action] || ACTION_META.book_updated;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  className="relative flex items-start gap-3 py-3"
                >
                  <div className={`relative z-10 w-9 h-9 rounded-full ${meta.bg} ${meta.border} border flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">
                        {log.actor_name || log.actor_email || "Team member"}
                      </span>
                      <Badge variant="outline" className={`text-xs border-0 ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60 mt-0.5 truncate">
                      {log.entity_title || log.summary || "Untitled"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-white/30">
                        {log.entity_type === 'book' ? <BookOpen className="w-3 h-3 inline mr-1" /> : <FileText className="w-3 h-3 inline mr-1" />}
                        {log.entity_type?.toUpperCase()}
                      </span>
                      <span className="text-xs text-white/20">•</span>
                      <span className="text-xs text-white/30">
                        {log.created_date ? moment(log.created_date).fromNow() : ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}