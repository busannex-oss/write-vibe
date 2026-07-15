import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Clock, FileText, ClipboardList, Sparkles, Save, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PERIODS = [
  { key: "daily", label: "Last 24 hours", days: 1 },
  { key: "weekly", label: "Last 7 days", days: 7 },
  { key: "monthly", label: "Last 30 days", days: 30 },
];

const FREQ_OPTIONS = [
  { value: "daily", label: "Daily", desc: "Every morning" },
  { value: "weekly", label: "Weekly", desc: "Every Monday at 8am" },
  { value: "monthly", label: "Monthly", desc: "1st of each month" },
  { value: "none", label: "Opt out", desc: "Dashboard only, no email" },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function TeamSummary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState("weekly");
  const [frequency, setFrequency] = useState("weekly");
  const [subscriptionId, setSubscriptionId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const periodDays = PERIODS.find((p) => p.key === period)?.days || 7;
  const periodStart = useMemo(
    () => new Date(Date.now() - periodDays * 86400000),
    [periodDays]
  );

  const { data: sops = [], isLoading: sopsLoading } = useQuery({
    queryKey: ["summary-sops"],
    queryFn: () => base44.entities.SOP.filter({}, "-updated_date", 300),
  });

  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["summary-docs"],
    queryFn: () => base44.entities.Document.filter({ book_id: "admin" }, "-created_date", 300),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["report-subscriptions"],
    queryFn: () => base44.entities.ReportSubscription.filter({}),
  });

  // Hydrate current user's preference
  useEffect(() => {
    if (!user || !subscriptions.length) return;
    const mine = subscriptions.find((s) => s.user_email === user.email);
    if (mine) {
      setFrequency(mine.delivery_frequency || "weekly");
      setSubscriptionId(mine.id);
    } else {
      setFrequency("weekly");
      setSubscriptionId(null);
    }
  }, [user, subscriptions]);

  const recentSops = sops.filter((s) => new Date(s.updated_date || s.created_date) >= periodStart);
  const recentDocs = docs.filter((d) => new Date(d.created_date) >= periodStart);
  const recentAutoSops = sops.filter((s) => s.auto_generated && new Date(s.created_date) >= periodStart);

  const saveMutation = useMutation({
    mutationFn: async (freq) => {
      if (subscriptionId) {
        return base44.entities.ReportSubscription.update(subscriptionId, { delivery_frequency: freq });
      }
      return base44.entities.ReportSubscription.create({ user_email: user.email, delivery_frequency: freq });
    },
    onSuccess: (res) => {
      if (!subscriptionId && res?.id) setSubscriptionId(res.id);
      queryClient.invalidateQueries({ queryKey: ["report-subscriptions"] });
      toast({ title: "Preference saved", description: "Your delivery setting has been updated." });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const testSendMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("sendTeamSummary", { dry_run: true, frequency: period });
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Preview generated",
        description: `${data.sop_count} SOPs, ${data.doc_count} documents, ${data.auto_sop_count} AI SOPs for this period.`,
      });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Team Summary</h1>
          <p className="text-sm text-white/50">Automated report of SOP and document activity, delivered to your inbox.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Delivery preferences */}
        <Card className="bg-white/5 border-white/10 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />Delivery Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {FREQ_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  frequency === opt.value
                    ? "border-amber-500/50 bg-amber-500/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-white/40">{opt.desc}</div>
              </button>
            ))}
            <Button
              className="w-full mt-3"
              onClick={() => saveMutation.mutate(frequency)}
              disabled={saveMutation.isPending || !user}
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving…" : "Save preference"}
            </Button>
            {frequency === "none" && (
              <p className="text-xs text-white/40 mt-2">
                You'll still see the full report here in the dashboard — just no emails.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Online summary */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />Activity Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList className="bg-white/5 border border-white/10 h-8">
                  {PERIODS.map((p) => (
                    <TabsTrigger key={p.key} value={p.key} className="text-xs h-7 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                      {p.label.replace("Last ", "")}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button size="sm" variant="outline" onClick={() => testSendMutation.mutate()} disabled={testSendMutation.isPending}>
                <Send className="w-3.5 h-3.5" />Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-white/40">
              Showing activity since {fmtDate(periodStart)}.
            </p>

            <SummarySection
              icon={ClipboardList}
              title="Recently Updated SOPs"
              count={recentSops.length}
              loading={sopsLoading}
              items={recentSops.map((s) => ({
                title: s.title,
                meta: `v${s.version || 1} · ${s.status}`,
                date: s.updated_date || s.created_date,
              }))}
            />

            <SummarySection
              icon={FileText}
              title="New AI-Generated Documents"
              count={recentDocs.length}
              loading={docsLoading}
              items={recentDocs.map((d) => ({
                title: d.title,
                meta: `v${d.version_number || 1} · ${d.type}`,
                date: d.created_date,
              }))}
            />

            <SummarySection
              icon={Sparkles}
              title="New AI-Generated SOPs"
              count={recentAutoSops.length}
              loading={sopsLoading}
              items={recentAutoSops.map((s) => ({
                title: s.title,
                meta: `v${s.version || 1}`,
                date: s.created_date,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummarySection({ icon: Icon, title, count, loading, items }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <Badge className="bg-white/10 text-white/60 border-white/10">{count}</Badge>
      </div>
      {loading ? (
        <p className="text-xs text-white/40">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-white/30 italic">No activity in this period.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-3 text-sm py-1.5 border-b border-white/5 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-white/80 truncate">{it.title}</p>
                <p className="text-xs text-white/40">{it.meta}</p>
              </div>
              <span className="text-xs text-white/40 whitespace-nowrap">{fmtDate(it.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}