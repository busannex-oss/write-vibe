import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Loader2, Target, Scale, ClipboardList, Clock, Eye, EyeOff,
  GitBranch, Sparkles, CheckCircle2
} from "lucide-react";

const Spinner = () => (
  <div className="py-12 text-center">
    <Loader2 className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
  </div>
);

const Empty = ({ label }) => (
  <Card className="bg-white/5 border-white/10">
    <CardContent className="py-10 text-center">
      <GitBranch className="w-10 h-10 text-white/20 mx-auto mb-3" />
      <p className="text-white/50 text-sm">No {label} versions yet.</p>
    </CardContent>
  </Card>
);

function fmt(date) {
  if (!date) return "—";
  try { return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return date; }
}

/* ── Mission Statements ─────────────────────────────────────────────── */
function MissionVersions() {
  const [viewingId, setViewingId] = useState(null);
  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["mission-versions"],
    queryFn: () => base44.entities.MissionStatement.filter({}, "-version_number")
  });
  if (isLoading) return <Spinner />;
  if (!missions.length) return <Empty label="mission statement" />;
  return (
    <div className="space-y-3">
      {missions.map((m) => {
        const open = viewingId === m.id;
        return (
          <Card key={m.id} className="bg-white/5 border-white/10">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">v{m.version_number || 1}</Badge>
                  {m.is_current && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" />Current
                    </Badge>
                  )}
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{fmt(m.publish_date || m.created_date)}
                  </span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setViewingId(open ? null : m.id)} className="text-white/40 hover:text-white w-8 h-8">
                  {open ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {open ? (
                <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{m.text}</p>
              ) : (
                <p className="mt-2 text-sm text-white/50 line-clamp-2">{m.text}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Constitutions ──────────────────────────────────────────────────── */
function ConstitutionVersions() {
  const [viewingId, setViewingId] = useState(null);
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["constitution-versions"],
    queryFn: () => base44.entities.Document.filter({ type: "constitution", book_id: "admin" }, "-version_number")
  });
  if (isLoading) return <Spinner />;
  if (!docs.length) return <Empty label="constitution" />;
  return (
    <div className="space-y-3">
      {docs.map((d) => {
        const open = viewingId === d.id;
        return (
          <Card key={d.id} className="bg-white/5 border-white/10">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">v{d.version_number || 1}</Badge>
                  {d.is_current && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" />Current
                    </Badge>
                  )}
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{fmt(d.generated_at || d.created_date)}
                  </span>
                  <Badge variant="outline" className="border-white/15 text-white/50 text-xs">{d.status}</Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setViewingId(open ? null : d.id)} className="text-white/40 hover:text-white w-8 h-8">
                  {open ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {open ? (
                <pre className="mt-3 text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">{d.content}</pre>
              ) : (
                <p className="mt-2 text-sm text-white/50 line-clamp-2">{d.content}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ── SOPs (AI-generated) ────────────────────────────────────────────── */
function SOPVersions() {
  const [viewingId, setViewingId] = useState(null);
  const { data: sops = [], isLoading } = useQuery({
    queryKey: ["sop-versions"],
    queryFn: () => base44.entities.SOP.filter({ auto_generated: true }, "-created_date")
  });
  if (isLoading) return <Spinner />;
  if (!sops.length) return <Empty label="AI-generated SOP" />;
  return (
    <div className="space-y-3">
      {sops.map((s) => {
        const open = viewingId === s.id;
        return (
          <Card key={s.id} className="bg-white/5 border-white/10">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">v{s.version || 1}</Badge>
                    <Badge className="bg-white/5 text-white/50 border-white/10 text-xs">
                      <Sparkles className="w-2.5 h-2.5 mr-1" />AI-Generated
                    </Badge>
                    <Badge variant="outline" className="border-white/15 text-white/50 text-xs">{s.status}</Badge>
                  </div>
                  <p className="font-medium text-white text-sm">{s.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(s.created_date)}</span>
                    {s.review_date && <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />Review {fmt(s.review_date)}</span>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setViewingId(open ? null : s.id)} className="text-white/40 hover:text-white w-8 h-8">
                  {open ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {open && (
                <div className="mt-3 space-y-2">
                  {s.purpose && <p className="text-xs text-white/60"><span className="text-white/40">Purpose:</span> {s.purpose}</p>}
                  <ol className="space-y-1.5">
                    {(s.steps || []).map((st, i) => (
                      <li key={i} className="text-xs text-white/60 flex gap-2">
                        <span className="text-amber-400 font-medium">{st.step_number || i + 1}.</span>
                        <span><strong className="text-white/70">{st.step_name}:</strong> {st.instruction} <em className="text-white/30">({st.responsible_role || '—'})</em></span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function DocumentVersionHistory() {
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
        <GitBranch className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-sm text-white/60">Full version history of AI-generated governance & procedural documents. Earlier versions are preserved when a new one is generated.</p>
      </div>
      <Tabs defaultValue="mission">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="mission" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Target className="w-4 h-4 mr-2" />Mission Statements
          </TabsTrigger>
          <TabsTrigger value="constitution" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Scale className="w-4 h-4 mr-2" />Constitutions
          </TabsTrigger>
          <TabsTrigger value="sops" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <ClipboardList className="w-4 h-4 mr-2" />AI-Generated SOPs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mission" className="mt-4"><MissionVersions /></TabsContent>
        <TabsContent value="constitution" className="mt-4"><ConstitutionVersions /></TabsContent>
        <TabsContent value="sops" className="mt-4"><SOPVersions /></TabsContent>
      </Tabs>
    </div>
  );
}