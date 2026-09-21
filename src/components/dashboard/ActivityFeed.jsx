import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ClipboardList, Activity, Radio } from "lucide-react";
import { format } from "date-fns";
import AgentNameLink from "@/components/agents/AgentNameLink";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ACTION_META = {
  book_created: { icon: BookOpen, color: "text-blue-300", ring: "bg-blue-500/15" },
  book_updated: { icon: BookOpen, color: "text-amber-300", ring: "bg-amber-500/15" },
  sop_created: { icon: ClipboardList, color: "text-emerald-300", ring: "bg-emerald-500/15" },
  sop_updated: { icon: ClipboardList, color: "text-purple-300", ring: "bg-purple-500/15" },
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.entities.ActivityLog.list("-created_date", 20)
      .then((items) => { if (mounted) { setActivities(items); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });

    const unsubscribe = base44.entities.ActivityLog.subscribe((event) => {
      if (!mounted) return;
      if (event.type === "create" && event.data) {
        setActivities((prev) => {
          if (prev.some((a) => a.id === event.data.id)) return prev;
          return [event.data, ...prev].slice(0, 20);
        });
      } else if (event.type === "update" && event.data) {
        setActivities((prev) => prev.map((a) => (a.id === event.data.id ? event.data : a)));
      } else if (event.type === "delete") {
        setActivities((prev) => prev.filter((a) => a.id !== event.id));
      }
    });

    return () => { mounted = false; unsubscribe(); };
  }, []);

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />Team Activity
          </CardTitle>
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Radio className="w-3 h-3 animate-pulse" />Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[460px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">No activity yet.</p>
            <p className="text-xs text-white/30 mt-1">Edits to books and SOPs will show up here in real time.</p>
          </div>
        ) : (
          <div className="relative">
            {activities.map((a, i) => {
              const meta = ACTION_META[a.action] || ACTION_META.book_updated;
              const Icon = meta.icon;
              return (
                <div key={a.id} className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${meta.ring} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <p className="text-sm text-white/80 leading-snug">
                      <AgentNameLink name={a.actor_name || a.actor_email} />{" "}
                      <span className="text-white/60">
                        {a.action.includes("created") ? "created" : "updated"}
                      </span>{" "}
                      <span className="font-medium text-white/90">{a.entity_title || "Untitled"}</span>
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {a.created_date ? format(new Date(a.created_date), "MMM d, yyyy · h:mm a") : ""}
                      {a.created_date ? ` · ${timeAgo(a.created_date)}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}