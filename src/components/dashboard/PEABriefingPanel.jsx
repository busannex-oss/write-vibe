import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, MessageSquare, AlertTriangle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PEABriefingRow from "./PEABriefingRow";

const timeAgo = (d) => (d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : "");

export default function PEABriefingPanel({ user }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ['pea-tasks', user?.email],
    queryFn: () => base44.entities.DashboardTask.filter({ user_email: user.email, completed: false }, '-created_date', 20),
    enabled: !!user?.email,
    staleTime: 30000
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['pea-activity'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 8),
    staleTime: 30000
  });

  const decisions = tasks.slice(0, 5);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/25">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold leading-tight">Alexandar Sterling</p>
              <p className="text-xs text-white/40">Personal Executive Assistant — your briefing</p>
            </div>
          </div>
          <Link to={createPageUrl("OperationsAgents")}>
            <Button variant="ghost" size="sm" className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/10">
              <MessageSquare className="w-4 h-4 mr-2" />
              Brief me
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Needs your decision
              </p>
              {decisions.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {tasks.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {decisions.length === 0 ? (
                <p className="text-sm text-white/30 p-3">Nothing is waiting on you right now.</p>
              ) : (
                decisions.map((t) => (
                  <PEABriefingRow
                    key={t.id}
                    urgent
                    title={t.title}
                    subtitle={t.description}
                    meta={timeAgo(t.created_date)}
                    linkPage={t.link_page}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-white/40" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Recent team activity
              </p>
            </div>
            <div className="space-y-2">
              {activity.length === 0 ? (
                <p className="text-sm text-white/30 p-3">No team activity recorded yet.</p>
              ) : (
                activity.slice(0, 5).map((a) => (
                  <PEABriefingRow
                    key={a.id}
                    title={a.summary || `${a.action?.replace(/_/g, ' ')} — ${a.entity_title || ''}`}
                    subtitle={a.actor_name || a.actor_email}
                    meta={timeAgo(a.created_date)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}