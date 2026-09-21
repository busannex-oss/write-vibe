import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, History } from "lucide-react";
import PEATimelineItem from "./PEATimelineItem";

export default function PEATimeline({ user }) {
  const qc = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['pea-timeline-tasks', user?.email],
    queryFn: () => base44.entities.DashboardTask.filter({ user_email: user.email, source: 'alexandar_sterling' }, '-created_date', 30),
    enabled: !!user?.email,
    staleTime: 30000
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['pea-timeline-activity'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 30),
    staleTime: 30000
  });

  const resolve = useMutation({
    mutationFn: (id) => base44.entities.DashboardTask.update(id, { completed: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pea-timeline-tasks'] });
      qc.invalidateQueries({ queryKey: ['pea-tasks'] });
    }
  });

  const items = useMemo(() => [
    ...tasks.map((t) => ({ id: t.id, kind: 'decision', resolved: t.completed, title: t.title, subtitle: t.description, actor: 'Alexandar Sterling', linkPage: t.link_page, date: t.created_date })),
    ...activity.map((a) => ({ id: a.id, kind: a.entity_type === 'sop' ? 'sop' : 'book', title: a.summary || `${a.action?.replace(/_/g, ' ')} — ${a.entity_title || ''}`, actor: a.actor_name || a.actor_email, date: a.created_date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)), [tasks, activity]);

  const urgent = items.filter((i) => i.kind === 'decision' && !i.resolved);
  const history = items.filter((i) => !(i.kind === 'decision' && !i.resolved)).slice(0, 15);

  return (
    <Card className="bg-slate-950/80 border-white/10">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-amber-400" />
          <p className="text-white font-semibold">Decision & Agent Timeline</p>
          <span className="text-xs text-white/35 ml-1">curated by Alexandar Sterling</span>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-red-300">Requires your immediate attention</p>
            {urgent.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/25 text-red-200">{urgent.length}</span>}
          </div>
          {urgent.length === 0
            ? <p className="text-sm text-white/30 px-3 py-2 rounded-lg border border-dashed border-white/10">All clear — nothing is waiting on your decision.</p>
            : urgent.map((item, i) => <PEATimelineItem key={item.id} item={item} onResolve={resolve.mutate} isLast={i === urgent.length - 1} />)}
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Recent decisions & agent updates</p>
          {history.length === 0
            ? <p className="text-sm text-white/30 px-3">No history recorded yet.</p>
            : history.map((item, i) => <PEATimelineItem key={item.id} item={item} onResolve={resolve.mutate} isLast={i === history.length - 1} />)}
        </div>
      </CardContent>
    </Card>
  );
}