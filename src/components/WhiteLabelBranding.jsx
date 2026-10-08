import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ai } from "@/lib/ai";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, Loader2, Check, Palette, Wand2, X, ImageIcon } from "lucide-react";
import AIGenerateButton from "@/components/AIGenerateButton";

const COLOR_SCHEMES = [
  {
    id: "amber",
    name: "Amber Gold",
    primary: "#f59e0b",
    secondary: "#1e293b",
    accent: "#fbbf24",
    bg: "from-amber-500/30 to-orange-500/20",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    primary: "#3b82f6",
    secondary: "#0f172a",
    accent: "#60a5fa",
    bg: "from-blue-500/30 to-cyan-500/20",
  },
  {
    id: "violet",
    name: "Royal Violet",
    primary: "#8b5cf6",
    secondary: "#1e1b4b",
    accent: "#a78bfa",
    bg: "from-violet-500/30 to-purple-500/20",
  },
  {
    id: "emerald",
    name: "Emerald",
    primary: "#10b981",
    secondary: "#022c22",
    accent: "#34d399",
    bg: "from-emerald-500/30 to-teal-500/20",
  },
  {
    id: "rose",
    name: "Rose",
    primary: "#f43f5e",
    secondary: "#1c0a0e",
    accent: "#fb7185",
    bg: "from-rose-500/30 to-pink-500/20",
  },
  {
    id: "slate",
    name: "Midnight Slate",
    primary: "#64748b",
    secondary: "#0f172a",
    accent: "#94a3b8",
    bg: "from-slate-500/30 to-slate-700/20",
  },
  {
    id: "crimson",
    name: "Crimson",
    primary: "#dc2626",
    secondary: "#1c0000",
    accent: "#ef4444",
    bg: "from-red-500/30 to-orange-700/20",
  },
  {
    id: "indigo",
    name: "Indigo Night",
    primary: "#6366f1",
    secondary: "#1e1b4b",
    accent: "#818cf8",
    bg: "from-indigo-500/30 to-blue-900/20",
  },
];

export default function WhiteLabelBranding({ user, onUpdate }) {
  const [config, setConfig] = useState({
    brand_name: "",
    logo_url: "",
    custom_domain: "",
    color_scheme_id: "amber",
    primary: "#f59e0b",
    secondary: "#1e293b",
    accent: "#fbbf24",
  });
  const [saving, setSaving] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [generatingColors, setGeneratingColors] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (user?.white_label_config) {
      const wl = user.white_label_config;
      setConfig({
        brand_name: wl.brand_name || "",
        logo_url: wl.logo_url || "",
        custom_domain: wl.custom_domain || "",
        color_scheme_id: wl.color_scheme_id || "amber",
        primary: wl.primary || wl.primary_color || "#f59e0b",
        secondary: wl.secondary || "#1e293b",
        accent: wl.accent || "#fbbf24",
      });
      setLogoPreview(wl.logo_url || null);
    }
  }, [user]);

  const selectScheme = (scheme) => {
    setConfig(prev => ({
      ...prev,
      color_scheme_id: scheme.id,
      primary: scheme.primary,
      secondary: scheme.secondary,
      accent: scheme.accent,
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setConfig(prev => ({ ...prev, logo_url: file_url }));
    setLogoPreview(file_url);
    await generateColorsFromLogo(file_url);
  };

  const generateLogo = async () => {
    if (!config.brand_name) { alert("Please enter your brand name first"); return; }
    setGeneratingLogo(true);
    const { url } = await ai.GenerateImage({
      prompt: `Modern, professional logo for "${config.brand_name}", book publishing brand. Clean, minimal, memorable, scalable. Square with transparent or dark background.`,
    });
    setConfig(prev => ({ ...prev, logo_url: url }));
    setLogoPreview(url);
    await generateColorsFromLogo(url);
    setGeneratingLogo(false);
  };

  const generateColorsFromLogo = async (logoUrl) => {
    setGeneratingColors(true);
    const response = await ai.InvokeLLM({
      prompt: `Analyze this brand logo image and extract a complete color scheme for a professional UI. Return three hex colors:
- primary_color: the most prominent / dominant brand color from the logo (must be accessible on dark backgrounds, vibrant)
- secondary_color: a dark background color that complements the primary (deep dark tone, e.g. near-black with a hue from the logo)
- accent_color: a lighter or brighter variant of the primary for hover states and highlights

Return only valid hex codes (#rrggbb format). Be precise — actually read the logo colors.`,
      file_urls: [logoUrl],
      response_json_schema: {
        type: "object",
        properties: {
          primary_color: { type: "string" },
          secondary_color: { type: "string" },
          accent_color: { type: "string" }
        }
      }
    });
    if (response?.primary_color) {
      setConfig(prev => ({
        ...prev,
        primary: response.primary_color,
        secondary: response.secondary_color || prev.secondary,
        accent: response.accent_color || response.primary_color,
        color_scheme_id: "logo",
      }));
    }
    setGeneratingColors(false);
  };

  const saveBranding = async () => {
    setSaving(true);
    await base44.auth.updateMe({ white_label_config: config });
    onUpdate();
    setSaving(false);
  };

  const selectedScheme = COLOR_SCHEMES.find(s => s.id === config.color_scheme_id);

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Brand Identity
          </CardTitle>
          <CardDescription className="text-white/50">Upload your logo or generate one with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white/70">Brand Name</Label>
            <Input
              value={config.brand_name}
              onChange={e => setConfig(prev => ({ ...prev, brand_name: e.target.value }))}
              placeholder="Your Brand Name"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo Preview */}
            <div>
              <Label className="text-white/70 mb-3 block">Logo</Label>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden relative">
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-8" />
                    <button
                      onClick={() => { setLogoPreview(null); setConfig(prev => ({ ...prev, logo_url: "" })); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white/60 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-sm text-white/50">No logo uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">Upload Logo</span>
                  </div>
                </Label>
                <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <p className="text-xs text-white/40 mt-2">PNG or SVG • Transparent background recommended</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <AIGenerateButton onClick={generateLogo} loading={generatingLogo} label="Generate AI Logo" icon={Wand2} className="w-full" />

              {generatingColors && !config.logo_url && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing logo colors…
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Schemes */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            Color Scheme
          </CardTitle>
          <CardDescription className="text-white/50">
            {config.logo_url ? "Colors auto-extracted from your logo — or choose a preset below" : "Choose from 8 preset schemes, then fine-tune any color below"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo-extracted scheme card (shown only after logo upload) */}
          {config.logo_url && (
            <div className="mb-2">
              <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" /> Extracted from your logo
              </p>
              <button
                onClick={() => setConfig(prev => ({ ...prev, color_scheme_id: "logo" }))}
                disabled={generatingColors}
                className={`relative w-full rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                  config.color_scheme_id === "logo" ? "border-white shadow-lg shadow-white/10 scale-[1.02]" : "border-white/10"
                }`}
              >
                <div className="p-4 flex items-center gap-4" style={{ background: config.secondary }}>
                  {generatingColors ? (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing logo colors…
                    </div>
                  ) : (
                    <>
                      <img src={config.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded" />
                      <div className="flex-1">
                        <p className="text-white text-xs font-semibold mb-1.5">Logo Colors</p>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full shadow border border-white/20" style={{ background: config.primary }} />
                            <span className="text-white/40 text-[10px] font-mono">{config.primary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full shadow border border-white/20" style={{ background: config.accent }} />
                            <span className="text-white/40 text-[10px] font-mono">{config.accent}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); generateColorsFromLogo(config.logo_url); }}
                        className="text-white/30 hover:text-amber-400 transition-colors p-1"
                        title="Re-extract colors from logo"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {config.color_scheme_id === "logo" && !generatingColors && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </button>
            </div>
          )}

          {/* 8 scheme cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COLOR_SCHEMES.map(scheme => {
              const isSelected = config.color_scheme_id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  onClick={() => selectScheme(scheme)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    isSelected ? "border-white shadow-lg shadow-white/10 scale-105" : "border-white/10"
                  }`}
                >
                  <div className={`bg-gradient-to-br ${scheme.bg} p-4 space-y-2`}>
                    <div className="flex gap-1.5">
                      <div className="w-5 h-5 rounded-full shadow" style={{ background: scheme.primary }} />
                      <div className="w-5 h-5 rounded-full shadow" style={{ background: scheme.accent }} />
                      <div className="w-5 h-5 rounded-full border border-white/20 shadow" style={{ background: scheme.secondary }} />
                    </div>
                    <p className="text-white text-xs font-medium text-left">{scheme.name}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom color overrides */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/50 text-sm mb-4">Customize individual colors</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "primary", label: "Primary Color", hint: "Buttons, links, highlights" },
                { key: "secondary", label: "Secondary / Background", hint: "Sidebar, card backgrounds" },
                { key: "accent", label: "Accent Color", hint: "Hover states, badges" },
              ].map(({ key, label, hint }) => (
                <div key={key}>
                  <Label className="text-white/70 text-xs mb-2 block">{label}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={config[key]}
                        onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value, color_scheme_id: "custom" }))}
                        className="w-10 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                      />
                    </div>
                    <Input
                      value={config[key]}
                      onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value, color_scheme_id: "custom" }))}
                      placeholder="#000000"
                      className="bg-white/5 border-white/20 text-white font-mono text-sm flex-1"
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-1">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10" style={{ background: config.secondary }}>
              <div className="flex items-center gap-2">
                {logoPreview && <img src={logoPreview} alt="" className="w-6 h-6 object-contain" />}
                <span className="text-white text-sm font-semibold">{config.brand_name || "Your Brand"}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-900/60 space-y-3">
              <p className="text-white/50 text-xs mb-2">Preview:</p>
              <div className="flex gap-3 flex-wrap">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: config.primary }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ color: config.accent, borderColor: config.accent }}>
                  Outline Button
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: config.accent }} />
                <span className="text-white/60 text-xs">Active nav item</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Custom Domain</CardTitle>
          <CardDescription className="text-white/50">Use your own domain for book websites (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={config.custom_domain}
            onChange={e => setConfig(prev => ({ ...prev, custom_domain: e.target.value }))}
            placeholder="books.yourdomain.com"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          />
          <p className="text-xs text-white/40 mt-2">Configure DNS settings after saving</p>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={saveBranding}
        disabled={saving || !config.brand_name}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
        ) : (
          <><Check className="w-4 h-4 mr-2" />Save Branding</>
        )}
      </Button>
    </div>
  );
}