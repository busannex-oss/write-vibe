import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap, Save, Loader2, CheckCircle2, ExternalLink,
  BarChart3, Target, TrendingUp, Globe, Key, Settings2
} from "lucide-react";

export default function ClickgrowSettings({ user }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    api_key: "",
    workspace_id: "",
    tracking_domain: "",
    auto_track_clicks: true,
    auto_track_conversions: true,
    funnel_tracking: false,
    ab_testing_enabled: false,
    utm_auto_tagging: true,
    retargeting_pixel: "",
    webhook_url: "",
    campaign_budget_default: "50",
    cpc_target: "0.35",
    roas_target: "4.0",
    conversion_window_days: "30",
    attribution_model: "last_click",
    notification_email: user?.email || "",
    report_frequency: "weekly",
    enabled: false,
  });

  useEffect(() => {
    if (user?.clickgrow_config) {
      setConfig(prev => ({ ...prev, ...user.clickgrow_config }));
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ clickgrow_config: config });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const inputClass = "bg-white/5 border-white/20 text-white placeholder:text-white/30";
  const labelClass = "text-white/70 mb-1 block text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Clickgrow.AI
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">Growth Platform</Badge>
            </h2>
            <p className="text-sm text-white/50">AI-powered click tracking, campaign optimization & growth analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => set("enabled", v)}
            />
            <span className="text-sm text-white/60">{config.enabled ? "Enabled" : "Disabled"}</span>
          </div>
          <a href="https://clickgrow.ai" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-white/20 text-white/60 hover:text-white hover:bg-white/10">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Clickgrow.AI
            </Button>
          </a>
        </div>
      </div>

      {!config.enabled && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/50 flex items-center gap-3">
          <Zap className="w-4 h-4 text-white/30 flex-shrink-0" />
          Enable Clickgrow.AI above to activate growth tracking and AI campaign optimization for Write Vibe.
        </div>
      )}

      <Tabs defaultValue="connection">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="connection" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <Key className="w-3.5 h-3.5 mr-1.5" /> Connection
          </TabsTrigger>
          <TabsTrigger value="tracking" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <Target className="w-3.5 h-3.5 mr-1.5" /> Tracking
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="reporting" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Reporting
          </TabsTrigger>
        </TabsList>

        {/* CONNECTION */}
        <TabsContent value="connection" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> API Credentials
              </CardTitle>
              <CardDescription className="text-white/40">
                Connect your Clickgrow.AI account. Find these in your{" "}
                <a href="https://clickgrow.ai/settings" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">Clickgrow dashboard → Settings → API</a>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className={labelClass}>API Key *</Label>
                  <Input
                    value={config.api_key}
                    onChange={(e) => set("api_key", e.target.value)}
                    placeholder="cg_live_xxxxxxxxxxxxxxxx"
                    type="password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Workspace ID</Label>
                  <Input
                    value={config.workspace_id}
                    onChange={(e) => set("workspace_id", e.target.value)}
                    placeholder="ws_xxxxxxxx"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Custom Tracking Domain (optional)</Label>
                <Input
                  value={config.tracking_domain}
                  onChange={(e) => set("tracking_domain", e.target.value)}
                  placeholder="track.write vibe.com"
                  className={inputClass}
                />
                <p className="text-xs text-white/30 mt-1">Use a custom subdomain for branded click tracking links</p>
              </div>
              <div>
                <Label className={labelClass}>Webhook URL (optional)</Label>
                <Input
                  value={config.webhook_url}
                  onChange={(e) => set("webhook_url", e.target.value)}
                  placeholder="https://your-endpoint.com/clickgrow-webhook"
                  className={inputClass}
                />
                <p className="text-xs text-white/30 mt-1">Receive real-time event payloads from Clickgrow</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRACKING */}
        <TabsContent value="tracking" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Tracking Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {[
                  { key: "auto_track_clicks", label: "Auto-Track Clicks", desc: "Automatically track all outbound clicks from author book pages" },
                  { key: "auto_track_conversions", label: "Auto-Track Conversions", desc: "Track purchases, signups, and lead form submissions" },
                  { key: "funnel_tracking", label: "Funnel Tracking", desc: "Map and analyze multi-step conversion funnels" },
                  { key: "ab_testing_enabled", label: "A/B Testing", desc: "Enable split testing for landing pages and CTAs" },
                  { key: "utm_auto_tagging", label: "UTM Auto-Tagging", desc: "Automatically append UTM parameters to all campaign links" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium">{item.label}</p>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                    <Switch checked={!!config[item.key]} onCheckedChange={(v) => set(item.key, v)} />
                  </div>
                ))}
              </div>

              <div>
                <Label className={labelClass}>Retargeting Pixel ID</Label>
                <Input
                  value={config.retargeting_pixel}
                  onChange={(e) => set("retargeting_pixel", e.target.value)}
                  placeholder="px_xxxxxxxxxxxxxxxx"
                  className={inputClass}
                />
                <p className="text-xs text-white/30 mt-1">Embed Clickgrow's retargeting pixel on book landing pages</p>
              </div>

              <div>
                <Label className={labelClass}>Conversion Window (days)</Label>
                <Input
                  value={config.conversion_window_days}
                  onChange={(e) => set("conversion_window_days", e.target.value)}
                  type="number"
                  min="1"
                  max="90"
                  className={inputClass}
                />
              </div>

              <div>
                <Label className={labelClass}>Attribution Model</Label>
                <select
                  value={config.attribution_model}
                  onChange={(e) => set("attribution_model", e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="last_click">Last Click</option>
                  <option value="first_click">First Click</option>
                  <option value="linear">Linear</option>
                  <option value="time_decay">Time Decay</option>
                  <option value="data_driven">Data-Driven (AI)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAMPAIGNS */}
        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Campaign Defaults & Targets
              </CardTitle>
              <CardDescription className="text-white/40">
                Default values applied when authors launch new marketing campaigns via Write Vibe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className={labelClass}>Default Daily Budget ($)</Label>
                  <Input
                    value={config.campaign_budget_default}
                    onChange={(e) => set("campaign_budget_default", e.target.value)}
                    type="number"
                    min="1"
                    placeholder="50"
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Target CPC ($)</Label>
                  <Input
                    value={config.cpc_target}
                    onChange={(e) => set("cpc_target", e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="0.35"
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Target ROAS (x)</Label>
                  <Input
                    value={config.roas_target}
                    onChange={(e) => set("roas_target", e.target.value)}
                    type="number"
                    step="0.1"
                    placeholder="4.0"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Benchmark info */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { label: "Avg CPC (Book Ads)", value: "$0.28–$0.55", color: "text-emerald-400" },
                  { label: "Avg ROAS (KDP)", value: "3.2x–6.8x", color: "text-blue-400" },
                  { label: "Avg CTR (Amazon)", value: "0.4%–1.2%", color: "text-amber-400" },
                ].map(b => (
                  <div key={b.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/40">{b.label}</p>
                    <p className={`text-sm font-bold ${b.color} mt-1`}>{b.value}</p>
                    <p className="text-xs text-white/20">Industry benchmark</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTING */}
        <TabsContent value="reporting" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Reporting & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className={labelClass}>Notification Email</Label>
                  <Input
                    value={config.notification_email}
                    onChange={(e) => set("notification_email", e.target.value)}
                    placeholder="admin@write vibe.com"
                    type="email"
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Report Frequency</Label>
                  <select
                    value={config.report_frequency}
                    onChange={(e) => set("report_frequency", e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-emerald-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> What Clickgrow.AI Tracks for Write Vibe
                </p>
                <ul className="text-xs text-emerald-300/70 space-y-1 list-disc list-inside">
                  <li>Book landing page visits, scroll depth, and time-on-page</li>
                  <li>CTA click-through rates (Buy Now, Amazon, Newsletter)</li>
                  <li>Campaign ROI by channel (Facebook, Google, Amazon Ads)</li>
                  <li>Author funnel conversion rates (visit → lead → sale)</li>
                  <li>A/B test winner detection with AI-powered analysis</li>
                  <li>Revenue attribution per marketing channel</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Clickgrow Settings</>
          )}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Settings saved successfully.</span>}
      </div>
    </div>
  );
}