import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Edit3, Download, Bell, CheckCircle2, Tags, User, Calendar, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  under_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  archived: "bg-red-500/20 text-red-400 border-red-500/30"
};

const invoke = (action, extra = {}) => base44.functions.invoke("sops", { action, ...extra });

export default function SOPDetail({ sop, categories, onEdit, onBack, onRefresh }) {
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  const catNames = (sop.category_ids || [])
    .map(id => categories.find(c => c.id === id)?.name)
    .filter(Boolean);

  const handleNotify = async () => {
    setNotifying(true);
    await invoke("notify_owner", { id: sop.id });
    setNotifying(false);
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  const handleExport = () => {
    const steps = (sop.steps || []).map(s =>
      `Step ${s.step_number}: ${s.step_name} [${s.responsible_role}]\n${s.instruction}`
    ).join('\n\n');
    const text = `SOP: ${sop.title}
Version: v${sop.version}
Status: ${sop.status}
Owner: ${sop.owner || 'N/A'}
Review Date: ${sop.review_date || 'N/A'}
Pillars: ${(sop.pillar_alignment || []).join(', ') || 'N/A'}

PURPOSE:
${sop.purpose || 'N/A'}

SCOPE:
${sop.scope || 'N/A'}

TRIGGER:
${sop.trigger || 'N/A'}

STEPS:
${steps}

NOTES:
${sop.notes || 'N/A'}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sop.title.replace(/\s+/g, '_')}_v${sop.version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h1 className="text-xl font-bold text-white">{sop.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={cn("text-xs border", STATUS_COLORS[sop.status])}>{sop.status}</Badge>
                <span className="text-white/30 text-xs">v{sop.version}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sop.owner && (
              <Button variant="outline" size="sm" onClick={handleNotify} disabled={notifying}>
                {notified ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" /> : <Bell className="w-4 h-4 mr-1" />}
                {notified ? "Notified!" : "Notify Owner"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button onClick={onEdit} className="bg-amber-500 hover:bg-amber-600 text-black" size="sm">
              <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-3">
            <p className="text-white/30 text-xs flex items-center gap-1"><User className="w-3 h-3" /> Owner</p>
            <p className="text-white text-sm mt-1 font-medium truncate">{sop.owner || "—"}</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-3">
            <p className="text-white/30 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Review Due</p>
            <p className="text-white text-sm mt-1 font-medium">{sop.review_date || "—"}</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-3">
            <p className="text-white/30 text-xs">Steps</p>
            <p className="text-white text-sm mt-1 font-medium">{(sop.steps || []).length}</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-3">
            <p className="text-white/30 text-xs">Trigger</p>
            <p className="text-white text-sm mt-1 truncate">{sop.trigger || "—"}</p>
          </div>
        </div>

        {/* Pillars & Categories */}
        {((sop.pillar_alignment || []).length > 0 || catNames.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {catNames.map(n => (
              <span key={n} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">
                <Tags className="w-2.5 h-2.5 inline mr-1" />{n}
              </span>
            ))}
            {(sop.pillar_alignment || []).map(p => (
              <span key={p} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full">
                <Target className="w-2.5 h-2.5 inline mr-1" />{p}
              </span>
            ))}
          </div>
        )}

        {/* Purpose, Scope */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sop.purpose && (
            <Card className="bg-slate-900 border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white/60 text-xs uppercase tracking-wider">Purpose</CardTitle></CardHeader>
              <CardContent className="pt-0"><p className="text-white/80 text-sm leading-relaxed">{sop.purpose}</p></CardContent>
            </Card>
          )}
          {sop.scope && (
            <Card className="bg-slate-900 border-white/10">
              <CardHeader className="pb-2"><CardTitle className="text-white/60 text-xs uppercase tracking-wider">Scope</CardTitle></CardHeader>
              <CardContent className="pt-0"><p className="text-white/80 text-sm leading-relaxed">{sop.scope}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Steps */}
        {(sop.steps || []).length > 0 && (
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sop.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold flex items-center justify-center">
                      {step.step_number}
                    </div>
                    {i < sop.steps.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <p className="text-white font-medium">{step.step_name}</p>
                      {step.responsible_role && (
                        <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">
                          {step.responsible_role}
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {sop.notes && (
          <Card className="bg-slate-900 border-white/10">
            <CardHeader className="pb-2"><CardTitle className="text-white/60 text-xs uppercase tracking-wider">Notes</CardTitle></CardHeader>
            <CardContent className="pt-0"><p className="text-white/70 text-sm leading-relaxed">{sop.notes}</p></CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}