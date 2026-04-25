import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText, Plus, Search, Filter, Archive, Edit3, Loader2,
  ChevronRight, Eye, Bell, Download, Sparkles, Tags, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import SOPEditor from "@/components/sops/SOPEditor";
import SOPDetail from "@/components/sops/SOPDetail";

const PILLARS = ["Authenticity", "Creativity", "Empowerment", "Innovation", "Community", "Excellence", "Integrity", "Growth"];

const STATUS_COLORS = {
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  under_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  archived: "bg-red-500/20 text-red-400 border-red-500/30"
};

const invoke = (action, extra = {}) => base44.functions.invoke("sops", { action, ...extra });

export default function SOPsPage() {
  const [sops, setSops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | editor | detail
  const [selectedSop, setSelectedSop] = useState(null);
  const [reviewDue, setReviewDue] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPillar, setFilterPillar] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const load = async () => {
    setLoading(true);
    const [sopsRes, catsRes, reviewRes] = await Promise.all([
      invoke("list", { search, status: filterStatus, pillar: filterPillar, category_id: filterCategory }),
      invoke("categories"),
      invoke("review_due")
    ]);
    setSops(sopsRes.data.sops || []);
    setCategories(catsRes.data.categories || []);
    setReviewDue(reviewRes.data.sops || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, filterStatus, filterPillar, filterCategory]);

  const handleNew = () => { setSelectedSop(null); setView("editor"); };
  const handleEdit = (sop) => { setSelectedSop(sop); setView("editor"); };
  const handleView = (sop) => { setSelectedSop(sop); setView("detail"); };

  const handleSaved = async () => { await load(); setView("list"); };

  const handleArchive = async (sop) => {
    await invoke("archive", { id: sop.id });
    await load();
  };

  const handleNotify = async (sop) => {
    await invoke("notify_owner", { id: sop.id });
  };

  const handleExportAll = () => {
    const text = sops.map(s => {
      const steps = (s.steps || []).map(st => `  ${st.step_number}. ${st.step_name} [${st.responsible_role}]\n     ${st.instruction}`).join('\n');
      return `=== ${s.title} (v${s.version}) ===\nStatus: ${s.status}\nOwner: ${s.owner || 'N/A'}\nReview: ${s.review_date || 'N/A'}\nPurpose: ${s.purpose || ''}\nScope: ${s.scope || ''}\nTrigger: ${s.trigger || ''}\n\nSteps:\n${steps}\n\nNotes: ${s.notes || ''}\n`;
    }).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'SOP_Library.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  if (view === "editor") {
    return <SOPEditor sop={selectedSop} categories={categories} onSaved={handleSaved} onCancel={() => setView("list")} />;
  }
  if (view === "detail") {
    return <SOPDetail sop={selectedSop} categories={categories} onEdit={() => handleEdit(selectedSop)} onBack={() => setView("list")} onRefresh={load} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" /> Standard Operating Procedures
            </h1>
            <p className="text-white/40 text-sm mt-1">{sops.length} SOPs · {reviewDue.length} due for review</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-1" /> Export All
            </Button>
            <Button onClick={handleNew} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-1" /> New SOP
            </Button>
          </div>
        </div>

        {/* Review Due Banner */}
        {reviewDue.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-300 text-sm font-medium">
              {reviewDue.length} SOP{reviewDue.length > 1 ? 's' : ''} due for review within 30 days:
            </span>
            <span className="text-amber-400/70 text-sm">{reviewDue.map(s => s.title).join(', ')}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search SOPs..."
              className="pl-9 bg-slate-900 border-white/10 text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white/70 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterPillar}
            onChange={e => setFilterPillar(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white/70 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Pillars</option>
            {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white/70 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button variant="ghost" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* SOP List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : sops.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No SOPs found. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sops.map(sop => {
              const catNames = (sop.category_ids || [])
                .map(id => categories.find(c => c.id === id)?.name)
                .filter(Boolean);
              return (
                <Card key={sop.id} className="bg-slate-900 border-white/10 hover:border-amber-500/20 transition-all">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleView(sop)}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-white font-semibold">{sop.title}</h3>
                          <Badge className={cn("text-xs border", STATUS_COLORS[sop.status])}>{sop.status}</Badge>
                          <span className="text-white/30 text-xs">v{sop.version}</span>
                        </div>
                        {sop.purpose && <p className="text-white/50 text-sm line-clamp-1 mb-2">{sop.purpose}</p>}
                        <div className="flex flex-wrap gap-2">
                          {catNames.map(n => (
                            <span key={n} className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">
                              <Tags className="w-2.5 h-2.5 inline mr-1" />{n}
                            </span>
                          ))}
                          {(sop.pillar_alignment || []).map(p => (
                            <span key={p} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400/70 px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                          {sop.owner && (
                            <span className="text-xs text-white/30">Owner: {sop.owner}</span>
                          )}
                          {sop.review_date && (
                            <span className={cn("text-xs", reviewDue.some(r => r.id === sop.id) ? "text-amber-400" : "text-white/30")}>
                              Review: {sop.review_date}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="icon" title="View" onClick={() => handleView(sop)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(sop)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {sop.status !== 'archived' && (
                          <Button variant="ghost" size="icon" title="Archive" onClick={() => handleArchive(sop)}>
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="View" onClick={() => handleView(sop)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}