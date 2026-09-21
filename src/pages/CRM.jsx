import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, Target, Mail, RefreshCw, Search } from "lucide-react";
import CRMStatCard from "@/components/crm/CRMStatCard";
import ContactCard from "@/components/crm/ContactCard";

export default function CRM() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => base44.entities.CRMContact.list('-lead_score', 500)
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['crm-subscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list('-created_date', 500)
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['crm-contacts'] });

  const enrich = async (email, name, source) => {
    setEnriching(true);
    await base44.functions.invoke('syncCrmContact', { email, name, source });
    setEnriching(false);
    refresh();
  };

  // Backfill: any subscriber or member not yet in the CRM gets an enriched profile.
  const backfill = async () => {
    setSyncing(true);
    const known = new Set(contacts.map((c) => (c.email || "").toLowerCase()));
    const members = await base44.entities.User.list('-created_date', 500);
    const pending = [
      ...subscribers.map((s) => ({ email: s.email, name: s.name, source: 'newsletter' })),
      ...members.map((m) => ({ email: m.email, name: m.full_name, source: 'member' }))
    ].filter((p) => p.email && !known.has(p.email.toLowerCase()));

    const unique = [...new Map(pending.map((p) => [p.email.toLowerCase(), p])).values()];
    for (const p of unique.slice(0, 25)) {
      await base44.functions.invoke('syncCrmContact', p);
    }
    setSyncing(false);
    refresh();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      const matchesStage = stage === "all" || c.lifecycle_stage === stage;
      const matchesSearch = !q || (c.email || "").toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q) || (c.segment || "").toLowerCase().includes(q);
      return matchesStage && matchesSearch;
    });
  }, [contacts, search, stage]);

  const advocates = contacts.filter((c) => c.advocacy_potential === "high").length;
  const hotLeads = contacts.filter((c) => (c.lead_score || 0) >= 70).length;
  const activeSubs = contacts.filter((c) => c.newsletter_status === "active").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">CRM</h1>
          <p className="text-white/50 mt-1">Every subscriber and member, enriched with the insight needed to convert and keep them.</p>
        </div>
        <Button onClick={backfill} disabled={syncing} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync subscribers & members"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CRMStatCard label="Contacts" value={contacts.length} icon={Users} />
        <CRMStatCard label="Active subscribers" value={activeSubs} icon={Mail} color="from-sky-400 to-blue-500" />
        <CRMStatCard label="Hot leads" value={hotLeads} hint="score 70+" icon={Target} color="from-emerald-400 to-teal-500" />
        <CRMStatCard label="Likely advocates" value={advocates} hint="organic promoters" icon={Heart} color="from-pink-400 to-rose-500" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or segment" className="pl-9" />
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="subscriber">Subscriber</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="advocate">Advocate</SelectItem>
            <SelectItem value="dormant">Dormant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center text-white/40">
            No contacts yet. Use “Sync subscribers & members” to bring your existing audience into the CRM.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} enriching={enriching} onEnrich={(email) => enrich(email, c.name, c.source)} />
          ))}
        </div>
      )}
    </div>
  );
}