import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload, Loader2, Check, Palette, Wand2 } from "lucide-react";
import AIGenerateButton from "@/components/AIGenerateButton";

export default function WhiteLabelBranding({ user, onUpdate }) {
  const [config, setConfig] = useState({
    brand_name: "",
    logo_url: "",
    primary_color: "#f59e0b",
    custom_domain: ""
  });
  const [saving, setSaving] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [generatingColors, setGeneratingColors] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (user?.white_label_config) {
      setConfig({
        brand_name: user.white_label_config.brand_name || "",
        logo_url: user.white_label_config.logo_url || "",
        primary_color: user.white_label_config.primary_color || "#f59e0b",
        custom_domain: user.white_label_config.custom_domain || ""
      });
      setLogoPreview(user.white_label_config.logo_url || null);
    }
  }, [user]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setConfig(prev => ({ ...prev, logo_url: file_url }));
        setLogoPreview(file_url);
        
        // Auto-generate complementary colors from uploaded logo
        await generateColorsFromLogo(file_url);
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }
  };

  const generateLogo = async () => {
    if (!config.brand_name) {
      alert("Please enter your brand name first");
      return;
    }

    setGeneratingLogo(true);
    try {
      const prompt = `Create a modern, professional logo for a brand called "${config.brand_name}". 
The brand is related to book publishing and author tools.
Design style: Clean, minimal, memorable, scalable
Format: Square logo with transparent or solid background
Make it suitable for both light and dark backgrounds.`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: []
      });

      setConfig(prev => ({ ...prev, logo_url: url }));
      setLogoPreview(url);

      // Generate complementary colors
      await generateColorsFromLogo(url);
    } catch (error) {
      console.error("Error generating logo:", error);
      alert("Failed to generate logo");
    } finally {
      setGeneratingLogo(false);
    }
  };

  const generateColorsFromLogo = async (logoUrl) => {
    setGeneratingColors(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this brand logo and generate a complementary primary color palette.
The colors should:
- Work well with the logo
- Be professional and accessible (WCAG AA compliant)
- Work on both light and dark backgrounds
- Be suitable for UI elements (buttons, links, highlights)

Return a single primary brand color in hex format that best represents the brand.`,
        file_urls: [logoUrl],
        response_json_schema: {
          type: "object",
          properties: {
            primary_color: { type: "string" }
          }
        }
      });

      setConfig(prev => ({ ...prev, primary_color: response.primary_color }));
    } catch (error) {
      console.error("Error generating colors:", error);
    } finally {
      setGeneratingColors(false);
    }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        white_label_config: config
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving branding:", error);
      alert("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const presetColors = [
    { name: "Amber", color: "#f59e0b" },
    { name: "Blue", color: "#3b82f6" },
    { name: "Purple", color: "#8b5cf6" },
    { name: "Green", color: "#10b981" },
    { name: "Red", color: "#ef4444" },
    { name: "Pink", color: "#ec4899" },
    { name: "Indigo", color: "#6366f1" },
    { name: "Teal", color: "#14b8a6" }
  ];

  return (
    <>
      {/* Logo Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Brand Identity
          </CardTitle>
          <CardDescription className="text-white/50">
            Upload your logo or generate one with AI. Colors will automatically adapt to complement your logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white/70">Brand Name</Label>
            <Input
              value={config.brand_name}
              onChange={(e) => setConfig(prev => ({ ...prev, brand_name: e.target.value }))}
              placeholder="Your Brand Name"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
          </div>

          {/* Logo Preview & Upload */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white/70 mb-3 block">Logo</Label>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-8" />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-sm text-white/50">No logo uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">Upload Logo</span>
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <p className="text-xs text-white/40 mt-2">PNG or SVG recommended • Transparent background</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent h-px top-1/2" />
                <p className="text-center text-xs text-white/40 bg-slate-900 px-3 relative inline-block left-1/2 -translate-x-1/2">
                  or
                </p>
              </div>

              <AIGenerateButton
                onClick={generateLogo}
                loading={generatingLogo}
                label="Generate AI Logo"
                icon={Wand2}
                className="w-full"
              />

              {generatingColors && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing logo colors...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            Brand Colors
          </CardTitle>
          <CardDescription className="text-white/50">
            Primary color complements your logo and is used throughout the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white/70 mb-3 block">Primary Color</Label>
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-20 h-20 rounded-xl border-2 border-white/20 shadow-lg"
                style={{ backgroundColor: config.primary_color }}
              />
              <div className="flex-1">
                <Input
                  type="text"
                  value={config.primary_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#000000"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 font-mono"
                />
                <p className="text-xs text-white/40 mt-1">Hex color code</p>
              </div>
            </div>

            <Label className="text-white/70 mb-3 block">Preset Colors</Label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {presetColors.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setConfig(prev => ({ ...prev, primary_color: preset.color }))}
                  className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    config.primary_color === preset.color 
                      ? 'border-white shadow-lg scale-110' 
                      : 'border-white/20'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Color Preview */}
          <div className="p-6 rounded-xl border border-white/10" style={{ backgroundColor: config.primary_color + '10' }}>
            <p className="text-white/70 text-sm mb-4">Preview:</p>
            <div className="space-y-3">
              <Button 
                style={{ backgroundColor: config.primary_color }}
                className="text-white hover:opacity-90"
              >
                Primary Button
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.primary_color }} />
                <span className="text-white/70 text-sm">Active indicator</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Custom Domain</CardTitle>
          <CardDescription className="text-white/50">
            Use your own domain for book websites (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={config.custom_domain}
            onChange={(e) => setConfig(prev => ({ ...prev, custom_domain: e.target.value }))}
            placeholder="books.yourdomain.com"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          />
          <p className="text-xs text-white/40 mt-2">Configure DNS settings after saving</p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={saveBranding}
        disabled={saving || !config.brand_name}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving Branding...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Save Branding
          </>
        )}
      </Button>
    </>
  );
}