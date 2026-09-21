import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, Loader2, Settings, Trash2, Edit2, History, RotateCcw } from "lucide-react";
import LogoEditor from "./LogoEditor";

export default function WebsiteBranding({ user, onUpdate }) {
  const [branding, setBranding] = useState({
    website_logo_url: "",
    website_title: "",
    website_tagline: "",
    logo_versions: []
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
        website_title: user.website_title || "Write Vibe",
        website_tagline: user.website_tagline || "AI Book Studio",
        logo_versions: user.logo_versions || []
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
      const prevLogo = branding.website_logo_url;
      let newVersions = branding.logo_versions || [];
      if (prevLogo && prevLogo !== logoUrl) {
        newVersions = [{ url: prevLogo, saved_at: new Date().toISOString() }, ...newVersions].slice(0, 20);
      }
      setBranding(prev => ({ ...prev, website_logo_url: logoUrl, logo_versions: newVersions }));
      await base44.auth.updateMe({ website_logo_url: logoUrl, logo_versions: newVersions });
      await processLogoWithLLM(logoUrl);
      setShowLogoEditor(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving logo:", error);
    }
    setUploading(false);
  };

  const handleRestoreVersion = async (versionUrl) => {
    setSaving(true);
    try {
      const prevLogo = branding.website_logo_url;
      let newVersions = (branding.logo_versions || []).filter(v => v.url !== versionUrl);
      if (prevLogo && prevLogo !== versionUrl) {
        newVersions = [{ url: prevLogo, saved_at: new Date().toISOString() }, ...newVersions];
      }
      setBranding(prev => ({ ...prev, website_logo_url: versionUrl, logo_versions: newVersions }));
      await base44.auth.updateMe({ website_logo_url: versionUrl, logo_versions: newVersions });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error restoring logo:", error);
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        website_logo_url: branding.website_logo_url,
        website_title: branding.website_title,
        website_tagline: branding.website_tagline
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving branding:", error);
    }
    setSaving(false);
  };

  const handleDeleteLogo = async () => {
    if (window.confirm("Delete this logo? This cannot be undone.")) {
      setSaving(true);
      try {
        await base44.auth.updateMe({ website_logo_url: "" });
        setBranding(prev => ({ ...prev, website_logo_url: "" }));
        setLogoAnalysis(null);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error("Error deleting logo:", error);
      }
      setSaving(false);
    }
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
                <div className="flex-1 space-y-2">
                  <Button
                    onClick={() => setShowLogoEditor(true)}
                    disabled={uploading}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 border"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : branding.website_logo_url ? "Edit Logo" : "Upload Logo"}
                  </Button>
                  
                  {branding.website_logo_url && (
                    <Button
                      onClick={handleDeleteLogo}
                      disabled={saving || uploading}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Logo
                    </Button>
                  )}
                  
                  <p className="text-xs text-white/40">PNG or JPG • Zoom, crop, remove background, or generate with AI</p>
                  <p className="text-xs text-white/40">Updates instantly on all websites</p>
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

                  {branding.logo_versions?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-white/50" />
                        <p className="text-xs font-medium text-white/60">Logo Versions ({branding.logo_versions.length})</p>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {branding.logo_versions.map((version, idx) => (
                          <div
                            key={version.url + idx}
                            className="group relative rounded-lg border border-white/15 bg-white/5 overflow-hidden"
                          >
                            <div className="aspect-square bg-white flex items-center justify-center">
                              <img src={version.url} alt="Logo version" className="w-full h-full object-contain p-1" />
                            </div>
                            <button
                              onClick={() => handleRestoreVersion(version.url)}
                              disabled={saving}
                              title="Restore this version"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <RotateCcw className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-white/30 mt-2">Hover a version and click to restore it as your current logo</p>
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

          <div>
            <Label className="text-white/70 mb-2 block">Logo Tagline</Label>
            <Input
              value={branding.website_tagline}
              onChange={(e) => setBranding(prev => ({ ...prev, website_tagline: e.target.value }))}
              placeholder="AI Book Studio"
              maxLength={40}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-white/40 mt-2">Short line shown under your name next to the logo</p>
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
            <div>
              <span className="text-white font-semibold block leading-tight">{branding.website_title || "Write Vibe"}</span>
              <span className="text-xs text-white/40">{branding.website_tagline || "AI Book Studio"}</span>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-3">This is how your branding appears on book websites</p>
        </CardContent>
      </Card>
    </div>
  );
}