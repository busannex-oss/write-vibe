import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, Loader2, Settings } from "lucide-react";
import LogoEditor from "./LogoEditor";

export default function WebsiteBranding({ user, onUpdate }) {
  const [branding, setBranding] = useState({
    website_logo_url: "",
    website_title: ""
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [logoAnalysis, setLogoAnalysis] = useState(null);
  const [showLogoEditor, setShowLogoEditor] = useState(false);

  useEffect(() => {
    if (user) {
      setBranding({
        website_logo_url: user.website_logo_url || "",
        website_title: user.website_title || "Write Vibe"
      });
    }
  }, [user]);

  const processLogoWithLLM = async (logoUrl) => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('processLogoImage', {
        logo_url: logoUrl
      });
      setLogoAnalysis(response.data);
    } catch (error) {
      console.error('Logo processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogoSave = async (logoUrl) => {
    setUploading(true);
    try {
      setBranding(prev => ({ ...prev, website_logo_url: logoUrl }));
      await base44.auth.updateMe({ website_logo_url: logoUrl });
      await processLogoWithLLM(logoUrl);
      setShowLogoEditor(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving logo:", error);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        website_logo_url: branding.website_logo_url,
        website_title: branding.website_title
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving branding:", error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Website Logo */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Website Logo</CardTitle>
          <CardDescription className="text-white/50">
            This logo appears on all your book websites and public pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showLogoEditor ? (
            <LogoEditor 
              onSave={handleLogoSave}
              currentLogoUrl={branding.website_logo_url}
              websiteTitle={branding.website_title}
            />
          ) : (
            <>
              {/* Logo Preview */}
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {branding.website_logo_url ? (
                    <img src={branding.website_logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center text-white/30 text-sm">No logo</div>
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    onClick={() => setShowLogoEditor(true)}
                    disabled={uploading}
                    className="mb-2 bg-white/10 hover:bg-white/20 text-white border-white/20 border"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload & Edit Logo"}
                  </Button>
                  <p className="text-xs text-white/40">PNG or JPG • Zoom, crop, remove background, or generate with AI</p>
                  <p className="text-xs text-white/40 mt-1">Updates instantly on all websites</p>
                  {processing && (
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analyzing logo with AI...
                    </div>
                  )}
                  {logoAnalysis?.optimization_guide && (
                    <div className="mt-3 p-2 bg-white/5 rounded text-xs space-y-1 border border-white/10">
                      <p className="text-white/60">✓ Logo analyzed and optimized for web</p>
                      <p className="text-white/60">Size: {logoAnalysis.optimization_guide.final_size}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Website Title */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Website Title</CardTitle>
          <CardDescription className="text-white/50">
            Your platform name displayed on all public pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white/70 mb-2 block">Platform Name</Label>
            <Input
              value={branding.website_title}
              onChange={(e) => setBranding(prev => ({ ...prev, website_title: e.target.value }))}
              placeholder="Write Vibe"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-white/40 mt-2">Used in headers, footers, and browser tabs</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Branding
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <span>Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
            {branding.website_logo_url && (
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                <img src={branding.website_logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
            <span className="text-white font-semibold">{branding.website_title || "Write Vibe"}</span>
          </div>
          <p className="text-xs text-white/40 mt-3">This is how your branding appears on book websites</p>
        </CardContent>
      </Card>
    </div>
  );
}