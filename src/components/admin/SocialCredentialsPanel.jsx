import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink, Loader2, Trash2 } from "lucide-react";

const PLATFORMS = [
  {
    key: "facebook",
    title: "Facebook Page",
    logo: "📘",
    description: "Publish posts to your Facebook Page",
    docsUrl: "https://developers.facebook.com/tools/explorer/",
    accountLabel: "Page ID",
    accountHint: "Found in your Facebook Page → About → Page ID",
    tokenHint: "Page Access Token with pages_manage_posts permission"
  },
  {
    key: "instagram",
    title: "Instagram Business",
    logo: "📸",
    description: "Publish image posts to your Instagram Business account",
    docsUrl: "https://developers.facebook.com/docs/instagram-api/getting-started",
    accountLabel: "Instagram Business Account ID",
    accountHint: "The IG Business Account ID linked to your Facebook Page",
    tokenHint: "Token with instagram_content_publish permission"
  },
  {
    key: "linkedin",
    title: "LinkedIn",
    logo: "💼",
    description: "Publish posts to your LinkedIn profile or company page",
    docsUrl: "https://www.linkedin.com/developers/apps",
    accountLabel: "Author URN",
    accountHint: "e.g. urn:li:organization:12345 or urn:li:person:abc123",
    tokenHint: "Access token with w_member_social or w_organization_social"
  }
];

function PlatformCard({ platform, record, onSaved }) {
  const [token, setToken] = useState(record?.access_token || "");
  const [accountId, setAccountId] = useState(record?.account_id || "");
  const [label, setLabel] = useState(record?.label || "");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = { platform: platform.key, access_token: token, account_id: accountId, label, is_active: true };
    if (record) {
      await base44.entities.SocialCredential.update(record.id, payload);
    } else {
      await base44.entities.SocialCredential.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  const remove = async () => {
    if (!record) return;
    setSaving(true);
    await base44.entities.SocialCredential.delete(record.id);
    setToken(""); setAccountId(""); setLabel("");
    setSaving(false);
    onSaved();
  };

  const connected = !!record?.access_token;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl">{platform.logo}</div>
            <div>
              <CardTitle className="text-white text-base">{platform.title}</CardTitle>
              <CardDescription className="text-white/40 text-xs">{platform.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={connected
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs gap-1"
              : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs gap-1"}>
              {connected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {connected ? "Connected" : "Not set"}
            </Badge>
            <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="text-white/60 text-xs mb-1 block">Access Token</Label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your access token"
                className="bg-white/5 border-white/20 text-white pr-10"
              />
              <button type="button" onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-white/30 text-xs mt-1">{platform.tokenHint}</p>
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">{platform.accountLabel}</Label>
            <Input value={accountId} onChange={(e) => setAccountId(e.target.value)}
              placeholder={platform.accountLabel} className="bg-white/5 border-white/20 text-white" />
            <p className="text-white/30 text-xs mt-1">{platform.accountHint}</p>
          </div>
          <div>
            <Label className="text-white/60 text-xs mb-1 block">Account Name (optional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Write Vibe Official" className="bg-white/5 border-white/20 text-white" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving || !token.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {connected ? "Update Credentials" : "Save Credentials"}
          </Button>
          {connected && (
            <Button variant="outline" onClick={remove} disabled={saving}
              className="border-white/20 text-white/60 hover:bg-white/10">
              <Trash2 className="w-4 h-4 mr-2" /> Disconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SocialCredentialsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["social-credentials"],
    queryFn: () => base44.entities.SocialCredential.list()
  });

  const byPlatform = {};
  (data || []).forEach((r) => { byPlatform[r.platform] = r; });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social-credentials"] });

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-white/40 text-sm">
        Paste your own access tokens to publish marketing posts to Facebook, Instagram, and LinkedIn.
      </p>
      {PLATFORMS.map((p) => (
        <PlatformCard key={p.key} platform={p} record={byPlatform[p.key]} onSaved={refresh} />
      ))}
    </div>
  );
}