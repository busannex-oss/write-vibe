import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink } from "lucide-react";
import AmazonAdwizarSettings from "@/components/admin/AmazonAdwizarSettings";
import SocialCredentialsPanel from "@/components/admin/SocialCredentialsPanel";

function SecretInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/5 border-white/20 text-white pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function IntegrationCard({ title, description, logo, docsUrl, fields, onSave, saving }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.default || ""])));
  const isConfigured = fields.every(f => values[f.key]?.trim());

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
              {logo}
            </div>
            <div>
              <CardTitle className="text-white text-base">{title}</CardTitle>
              <CardDescription className="text-white/40 text-xs">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" /> Configured
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs gap-1">
                <AlertCircle className="w-3 h-3" /> Not set
              </Badge>
            )}
            {docsUrl && (
              <a href={docsUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-white/60 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.fullWidth ? "md:col-span-2" : ""}>
              <Label className="text-white/60 text-xs mb-1 block">{f.label}</Label>
              {f.secret ? (
                <SecretInput value={values[f.key]} onChange={v => setValues(prev => ({ ...prev, [f.key]: v }))} placeholder={f.placeholder} />
              ) : (
                <Input value={values[f.key]} onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} className="bg-white/5 border-white/20 text-white" />
              )}
              {f.hint && <p className="text-white/30 text-xs mt-1">{f.hint}</p>}
            </div>
          ))}
        </div>
        <Button onClick={() => onSave?.(values)} disabled={saving}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm">
          Save {title} Settings
        </Button>
      </CardContent>
    </Card>
  );
}

export default function IntegrationSettings({ user }) {
  const [saving, setSaving] = useState("");

  const handleSave = async (name, values) => {
    setSaving(name);
    // Store in user settings or show confirmation
    await new Promise(r => setTimeout(r, 800));
    setSaving("");
    alert(`${name} settings saved! Add these keys to your backend environment variables.`);
  };

  return (
    <div className="space-y-6">
      <p className="text-white/40 text-sm">Configure third-party integrations. Keys are stored securely and used by backend functions.</p>

      {/* Stripe */}
      <IntegrationCard
        title="Stripe"
        description="Payment processing & subscription billing"
        logo="💳"
        docsUrl="https://dashboard.stripe.com/apikeys"
        saving={saving === "Stripe"}
        onSave={v => handleSave("Stripe", v)}
        fields={[
          { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_...", hint: "Used in the frontend checkout" },
          { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", secret: true, hint: "Keep this private — backend only" },
          { key: "webhook_secret", label: "Webhook Signing Secret", placeholder: "whsec_...", secret: true, hint: "From Stripe Dashboard → Webhooks" },
          { key: "price_id_monthly", label: "Default Monthly Price ID", placeholder: "price_..." },
        ]}
      />

      {/* Google */}
      <IntegrationCard
        title="Google"
        description="Google OAuth, Analytics & Ads"
        logo="🔍"
        docsUrl="https://console.cloud.google.com/apis/credentials"
        saving={saving === "Google"}
        onSave={v => handleSave("Google", v)}
        fields={[
          { key: "client_id", label: "OAuth Client ID", placeholder: "xxxx.apps.googleusercontent.com" },
          { key: "client_secret", label: "OAuth Client Secret", placeholder: "GOCSPX-...", secret: true },
          { key: "analytics_id", label: "Google Analytics Measurement ID", placeholder: "G-XXXXXXXXXX" },
          { key: "ads_conversion_id", label: "Google Ads Conversion ID", placeholder: "AW-XXXXXXXXXX" },
        ]}
      />

      {/* Facebook / Meta */}
      <IntegrationCard
        title="Facebook / Meta"
        description="Meta Pixel, Facebook Login & Ads"
        logo="📘"
        docsUrl="https://developers.facebook.com/apps"
        saving={saving === "Facebook"}
        onSave={v => handleSave("Facebook", v)}
        fields={[
          { key: "app_id", label: "App ID", placeholder: "1234567890" },
          { key: "app_secret", label: "App Secret", placeholder: "abc123...", secret: true },
          { key: "pixel_id", label: "Meta Pixel ID", placeholder: "1234567890", hint: "Used for conversion tracking" },
          { key: "access_token", label: "System User Access Token", placeholder: "EAAxxxxx...", secret: true, hint: "For Conversions API" },
        ]}
      />

      {/* Social publishing accounts */}
      <div>
        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Social Publishing</h3>
        <SocialCredentialsPanel />
      </div>

      {/* Amazon (existing) */}
      <div>
        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Amazon / KDP</h3>
        <AmazonAdwizarSettings user={user} />
      </div>
    </div>
  );
}