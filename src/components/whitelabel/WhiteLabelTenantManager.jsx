import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Edit3, Globe, CheckCircle2, XCircle, AlertCircle,
  DollarSign, Users, BookOpen, Copy, RefreshCw, Loader2, Building2,
  ChevronDown, ChevronUp, ExternalLink, Key, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  active:    { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  trial:     { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",   icon: AlertCircle },
  suspended: { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",       icon: XCircle },
  cancelled: { color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20",   icon: XCircle },
};

const PLAN_FEATURES = {
  starter:      ["5 users", "10 books", "Basic AI tools", "Email support"],
  professional: ["25 users", "100 books", "All AI tools", "Priority support", "Custom domain"],
  enterprise:   ["Unlimited users", "Unlimited books", "White label UI", "API access", "Dedicated support"],
};

const DEFAULT_FEATURES = [
  "outline_generator", "manuscript_writer", "cover_designer",
  "audiobook_generator", "video_commercial", "marketing_suite",
  "amazon_publisher", "team_collaboration"
];

function TenantForm({ tenant, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    brand_name: tenant?.brand_name || "",
    contact_name: tenant?.contact_name || "",
    contact_email: tenant?.contact_email || "",
    contact_phone: tenant?.contact_phone || "",
    custom_domain: tenant?.custom_domain || "",
    subdomain: tenant?.subdomain || "",
    plan: tenant?.plan || "professional",
    status: tenant?.status || "trial",
    max_users: tenant?.max_users || 25,
    max_books: tenant?.max_books || 100,
    monthly_revenue: tenant?.monthly_revenue || 0,
    primary_color: tenant?.primary_color || "#f59e0b",
    secondary_color: tenant?.secondary_color || "#1e293b",
    accent_color: tenant?.accent_color || "#fbbf24",
    notes: tenant?.notes || "",
    features_enabled: tenant?.features_enabled || DEFAULT_FEATURES,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFeature = (f) => set("features_enabled", form.features_enabled.includes(f)
    ? form.features_enabled.filter(x => x !== f)
    : [...form.features_enabled, f]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Brand Name *</Label>
          <Input value={form.brand_name} onChange={e => set("brand_name", e.target.value)}
            placeholder="Acme Publishing" className="bg-white/5 border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Contact Name</Label>
          <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)}
            placeholder="Jane Smith" className="bg-white/5 border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Contact Email *</Label>
          <Input value={form.contact_email} onChange={e => set("contact_email", e.target.value)}
            placeholder="jane@acme.com" type="email" className="bg-white/5 border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Contact Phone</Label>
          <Input value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)}
            placeholder="+1 555-000-0000" className="bg-white/5 border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Custom Domain</Label>
          <Input value={form.custom_domain} onChange={e => set("custom_domain", e.target.value)}
            placeholder="app.acmepublishing.com" className="bg-white/5 border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Subdomain Slug</Label>
          <div className="flex items-center gap-2">
            <Input value={form.subdomain} onChange={e => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="acme" className="bg-white/5 border-white/20 text-white" />
            <span className="text-white/30 text-xs shrink-0">.writevibe.app</span>
          </div>
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Plan</Label>
          <select value={form.plan} onChange={e => set("plan", e.target.value)}
            className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white text-sm">
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Status</Label>
          <select value={form.status} onChange={e => set("status", e.target.value)}
            className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white text-sm">
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Max Users</Label>
          <Input type="number" value={form.max_users} onChange={e => set("max_users", parseInt(e.target.value))}
            className="bg-white/5 border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white/60 text-xs mb-1 block">Monthly Revenue (USD)</Label>
          <Input type="number" value={form.monthly_revenue} onChange={e => set("monthly_revenue", parseFloat(e.target.value))}
            placeholder="299" className="bg-white/5 border-white/20 text-white" />
        </div>
      </div>

      {/* Colors */}
      <div>
        <Label className="text-white/60 text-xs mb-3 block">Brand Colors</Label>
        <div className="flex gap-4">
          {[
            { key: "primary_color", label: "Primary" },
            { key: "secondary_color", label: "Secondary" },
            { key: "accent_color", label: "Accent" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input type="color" value={form[key]} onChange={e => set(key, e.target.value)}
                className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5" />
              <div>
                <p className="text-white/50 text-xs">{label}</p>
                <p className="text-white/30 text-xs font-mono">{form[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <Label className="text-white/60 text-xs mb-3 block">Enabled Features</Label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_FEATURES.map(f => (
            <button key={f} onClick={() => toggleFeature(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs border transition-all", form.features_enabled.includes(f)
                ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/70")}>
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label className="text-white/60 text-xs mb-1 block">Internal Notes</Label>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
          placeholder="e.g. Signed 12-month contract, onboarding April 2026"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white text-sm rounded-md resize-none placeholder:text-white/30" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={() => onSave(form)} disabled={saving || !form.brand_name || !form.contact_email}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {tenant ? "Update Tenant" : "Create Tenant"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function TenantCard({ tenant, onEdit, onDelete, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[tenant.status] || STATUS_CONFIG.trial;
  const StatusIcon = cfg.icon;

  const copyApiKey = () => { navigator.clipboard.writeText(tenant.api_key || ""); alert("API key copied!"); };

  return (
    <Card className="bg-slate-900 border-white/10 hover:border-amber-500/20 transition-all">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {tenant.logo_url
                ? <img src={tenant.logo_url} alt="" className="w-full h-full object-contain p-1" />
                : <Building2 className="w-5 h-5 text-white/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-semibold">{tenant.brand_name}</h3>
                <Badge className={cn("text-xs border capitalize", cfg.bg, cfg.color)}>
                  <StatusIcon className="w-3 h-3 mr-1" />{tenant.status}
                </Badge>
                <Badge className="bg-white/5 border-white/10 text-white/50 text-xs capitalize">{tenant.plan}</Badge>
              </div>
              <p className="text-white/40 text-xs mt-0.5">{tenant.contact_email}</p>
              {tenant.custom_domain && (
                <p className="text-amber-400/60 text-xs mt-0.5 flex items-center gap-1">
                  <Globe className="w-3 h-3" />{tenant.custom_domain}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {tenant.monthly_revenue > 0 && (
              <div className="text-right hidden sm:block">
                <p className="text-emerald-400 font-semibold text-sm">${tenant.monthly_revenue}/mo</p>
                <p className="text-white/30 text-xs">MRR</p>
              </div>
            )}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} title="Details">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(tenant)} title="Edit">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(tenant.id)}
                className="text-red-400/60 hover:text-red-400" title="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Users className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{tenant.max_users}</p>
                <p className="text-white/30 text-xs">Max Users</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <BookOpen className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{tenant.max_books}</p>
                <p className="text-white/30 text-xs">Max Books</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: tenant.primary_color }} />
                <p className="text-white font-semibold text-xs font-mono">{tenant.primary_color}</p>
                <p className="text-white/30 text-xs">Brand Color</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Globe className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-white text-xs">{tenant.dns_verified ? "Verified" : "Pending"}</p>
                <p className="text-white/30 text-xs">DNS</p>
              </div>
            </div>

            {tenant.features_enabled?.length > 0 && (
              <div>
                <p className="text-white/30 text-xs mb-2">Enabled Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {tenant.features_enabled.map(f => (
                    <span key={f} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400/70">
                      {f.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tenant.api_key && (
              <div className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2">
                <Key className="w-4 h-4 text-white/30 shrink-0" />
                <code className="text-white/40 text-xs font-mono flex-1 truncate">{tenant.api_key}</code>
                <button onClick={copyApiKey} className="text-white/30 hover:text-white/60 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {tenant.notes && (
              <p className="text-white/30 text-xs italic">{tenant.notes}</p>
            )}

            <div className="flex gap-2 flex-wrap">
              {["active", "suspended", "trial"].filter(s => s !== tenant.status).map(s => (
                <Button key={s} variant="outline" size="sm" onClick={() => onStatusChange(tenant.id, s)}
                  className="text-xs border-white/15 text-white/60 hover:text-white capitalize">
                  Set {s}
                </Button>
              ))}
              <Button variant="outline" size="sm"
                onClick={() => { window.open(`mailto:${tenant.contact_email}`); }}
                className="text-xs border-amber-500/20 text-amber-400/70 hover:text-amber-400">
                <Mail className="w-3 h-3 mr-1" /> Email Client
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WhiteLabelTenantManager() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list"); // list | create | edit
  const [editingTenant, setEditingTenant] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["wl-tenants"],
    queryFn: () => base44.entities.WhiteLabelTenant.list("-created_date", 200),
  });

  const filtered = tenants.filter(t => {
    const matchSearch = !search || t.brand_name?.toLowerCase().includes(search.toLowerCase()) || t.contact_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalMRR = tenants.filter(t => t.status === "active").reduce((s, t) => s + (t.monthly_revenue || 0), 0);
  const activeCount = tenants.filter(t => t.status === "active").length;
  const trialCount = tenants.filter(t => t.status === "trial").length;

  const generateApiKey = () => `wlk_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

  const handleSave = async (form) => {
    setSaving(true);
    if (editingTenant) {
      await base44.entities.WhiteLabelTenant.update(editingTenant.id, form);
    } else {
      await base44.entities.WhiteLabelTenant.create({ ...form, api_key: generateApiKey() });
    }
    queryClient.invalidateQueries({ queryKey: ["wl-tenants"] });
    setSaving(false);
    setView("list");
    setEditingTenant(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this tenant?")) return;
    await base44.entities.WhiteLabelTenant.delete(id);
    queryClient.invalidateQueries({ queryKey: ["wl-tenants"] });
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.WhiteLabelTenant.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ["wl-tenants"] });
  };

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setView("list"); setEditingTenant(null); }}
            className="text-white/50 hover:text-white">← Back</Button>
          <h2 className="text-white font-semibold">{editingTenant ? "Edit Tenant" : "New White Label Tenant"}</h2>
        </div>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <TenantForm tenant={editingTenant} onSave={handleSave} onCancel={() => { setView("list"); setEditingTenant(null); }} saving={saving} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tenants", value: tenants.length, icon: Building2, color: "text-amber-400" },
          { label: "Active", value: activeCount, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Trials", value: trialCount, icon: AlertCircle, color: "text-amber-400" },
          { label: "MRR", value: `$${totalMRR.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-white/5 border-white/10">
            <CardContent className="py-4 flex items-center gap-3">
              <Icon className={cn("w-5 h-5 shrink-0", color)} />
              <div>
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tenants..." className="bg-white/5 border-white/10 text-white pl-3" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-white/10 text-white/70 rounded-md px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button onClick={() => setView("create")} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-1" /> New Tenant
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="mb-4">{tenants.length === 0 ? "No white label tenants yet." : "No tenants match your filters."}</p>
          {tenants.length === 0 && (
            <Button onClick={() => setView("create")} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-1" /> Create First Tenant
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <TenantCard key={t.id} tenant={t}
              onEdit={(tenant) => { setEditingTenant(tenant); setView("edit"); }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}