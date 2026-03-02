import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag,
  Zap,
  Check,
  Loader2,
  ExternalLink,
  Key,
  AlertCircle,
  Settings
} from "lucide-react";

export default function AmazonAdwizarSettings({ user }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [amazonSettings, setAmazonSettings] = useState({
    kdp_api_key: "",
    kdp_api_secret: "",
    kdp_account_id: "",
    acx_api_key: "",
    acx_api_secret: "",
    default_marketplace: "US",
    auto_publish: false
  });

  const [adwizarSettings, setAdwizarSettings] = useState({
    api_key: "",
    workspace_id: "",
    auto_campaigns: false,
    default_budget: "50",
    target_keywords: "",
    tracking_pixel: ""
  });

  useEffect(() => {
    if (user?.admin_integrations) {
      if (user.admin_integrations.amazon) setAmazonSettings(prev => ({ ...prev, ...user.admin_integrations.amazon }));
      if (user.admin_integrations.adwizar) setAdwizarSettings(prev => ({ ...prev, ...user.admin_integrations.adwizar }));
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      admin_integrations: {
        ...(user?.admin_integrations || {}),
        amazon: amazonSettings,
        adwizar: adwizarSettings
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          Integration Settings
        </h2>
        <p className="text-white/50 text-sm mt-1">Configure Amazon KDP/ACX and Adwizar.ai for all authors on the platform</p>
      </div>

      <Tabs defaultValue="amazon">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="amazon" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Amazon KDP / ACX
          </TabsTrigger>
          <TabsTrigger value="adwizar" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            <Zap className="w-4 h-4 mr-2" />
            Adwizar.ai
          </TabsTrigger>
        </TabsList>

        {/* Amazon Settings */}
        <TabsContent value="amazon" className="space-y-4 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Amazon KDP (Kindle Direct Publishing)
              </CardTitle>
              <CardDescription className="text-white/50 text-xs">
                Allows authors to submit manuscripts directly to Amazon KDP for publishing.
                <a href="https://kdp.amazon.com/en_US/help/topic/G200635650" target="_blank" rel="noopener noreferrer" className="text-amber-400 ml-1 hover:underline inline-flex items-center gap-1">
                  Get API credentials <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">KDP API Key</Label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={amazonSettings.kdp_api_key}
                      onChange={e => setAmazonSettings(p => ({ ...p, kdp_api_key: e.target.value }))}
                      placeholder="Enter KDP API Key"
                      className="bg-white/5 border-white/20 text-white pl-9 placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">KDP API Secret</Label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={amazonSettings.kdp_api_secret}
                      onChange={e => setAmazonSettings(p => ({ ...p, kdp_api_secret: e.target.value }))}
                      placeholder="Enter KDP API Secret"
                      className="bg-white/5 border-white/20 text-white pl-9 placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">KDP Account ID</Label>
                  <Input
                    value={amazonSettings.kdp_account_id}
                    onChange={e => setAmazonSettings(p => ({ ...p, kdp_account_id: e.target.value }))}
                    placeholder="Your Amazon KDP Account ID"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">Default Marketplace</Label>
                  <select
                    value={amazonSettings.default_marketplace}
                    onChange={e => setAmazonSettings(p => ({ ...p, default_marketplace: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                  >
                    <option value="US">United States (amazon.com)</option>
                    <option value="UK">United Kingdom (amazon.co.uk)</option>
                    <option value="DE">Germany (amazon.de)</option>
                    <option value="FR">France (amazon.fr)</option>
                    <option value="CA">Canada (amazon.ca)</option>
                    <option value="AU">Australia (amazon.com.au)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                ACX (Audiobook Creation Exchange)
              </CardTitle>
              <CardDescription className="text-white/50 text-xs">
                Allows authors to submit audiobooks to Amazon/Audible via ACX.
                <a href="https://www.acx.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 ml-1 hover:underline inline-flex items-center gap-1">
                  ACX Platform <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">ACX API Key</Label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={amazonSettings.acx_api_key}
                      onChange={e => setAmazonSettings(p => ({ ...p, acx_api_key: e.target.value }))}
                      placeholder="Enter ACX API Key"
                      className="bg-white/5 border-white/20 text-white pl-9 placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">ACX API Secret</Label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={amazonSettings.acx_api_secret}
                      onChange={e => setAmazonSettings(p => ({ ...p, acx_api_secret: e.target.value }))}
                      placeholder="Enter ACX API Secret"
                      className="bg-white/5 border-white/20 text-white pl-9 placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Amazon KDP API access requires approval from Amazon. Visit the{" "}
              <a href="https://kdp.amazon.com/en_US/help/topic/G200635650" target="_blank" rel="noopener noreferrer" className="underline">
                KDP help center
              </a>{" "}
              to apply. Authors can still manually submit via the KDP dashboard link provided.
            </p>
          </div>
        </TabsContent>

        {/* Adwizar Settings */}
        <TabsContent value="adwizar" className="space-y-4 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Adwizar.ai Integration
              </CardTitle>
              <CardDescription className="text-white/50 text-xs">
                Connect Adwizar.ai to automatically run AI-powered ad campaigns for your authors' books.
                <a href="https://adwizar.ai" target="_blank" rel="noopener noreferrer" className="text-amber-400 ml-1 hover:underline inline-flex items-center gap-1">
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">Adwizar API Key</Label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={adwizarSettings.api_key}
                      onChange={e => setAdwizarSettings(p => ({ ...p, api_key: e.target.value }))}
                      placeholder="Enter Adwizar API Key"
                      className="bg-white/5 border-white/20 text-white pl-9 placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">Workspace ID</Label>
                  <Input
                    value={adwizarSettings.workspace_id}
                    onChange={e => setAdwizarSettings(p => ({ ...p, workspace_id: e.target.value }))}
                    placeholder="Your Adwizar Workspace ID"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">Default Monthly Budget ($)</Label>
                  <Input
                    type="number"
                    value={adwizarSettings.default_budget}
                    onChange={e => setAdwizarSettings(p => ({ ...p, default_budget: e.target.value }))}
                    placeholder="50"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1 block">Default Target Keywords</Label>
                  <Input
                    value={adwizarSettings.target_keywords}
                    onChange={e => setAdwizarSettings(p => ({ ...p, target_keywords: e.target.value }))}
                    placeholder="book, fiction, thriller (comma-separated)"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/70 text-xs mb-1 block">Tracking Pixel Script</Label>
                <textarea
                  value={adwizarSettings.tracking_pixel}
                  onChange={e => setAdwizarSettings(p => ({ ...p, tracking_pixel: e.target.value }))}
                  placeholder="Paste your Adwizar tracking pixel script here..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white placeholder:text-white/30 text-xs font-mono"
                />
                <p className="text-xs text-white/30 mt-1">This pixel will be injected into all generated book websites</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm text-white font-medium">Auto-Create Campaigns</p>
                  <p className="text-xs text-white/50">Automatically create Adwizar ad campaigns when a book goes live</p>
                </div>
                <button
                  onClick={() => setAdwizarSettings(p => ({ ...p, auto_campaigns: !p.auto_campaigns }))}
                  className={`w-10 h-6 rounded-full transition-colors ${adwizarSettings.auto_campaigns ? 'bg-amber-500' : 'bg-white/20'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white mx-1 transition-transform ${adwizarSettings.auto_campaigns ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {adwizarSettings.api_key && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-emerald-300">Adwizar API key configured. Authors can now launch AI ad campaigns from the Book Marketing section.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Button
        onClick={save}
        disabled={saving}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
        ) : saved ? (
          <><Check className="w-4 h-4 mr-2" /> Saved!</>
        ) : (
          <><Check className="w-4 h-4 mr-2" /> Save Integration Settings</>
        )}
      </Button>
    </div>
  );
}