import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Upload, Download, RefreshCw, Check, Loader2, Image } from "lucide-react";
import { motion } from "framer-motion";

export default function BookLogoGenerator({ book, user, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [usePenName, setUsePenName] = useState(false);
  const [penName, setPenName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [logoAnalysis, setLogoAnalysis] = useState(null);

  // Load saved logo data on mount
  useEffect(() => {
    if (book.front_cover_url) {
      setUploadedLogo(book.front_cover_url);
    }
  }, [book.front_cover_url]);

  // Process uploaded logo with LLM
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

  const authorName = usePenName && penName ? penName : user?.full_name || "Author";

  // Generate logos with AI
  const generateLogos = async () => {
    setGenerating(true);
    try {
      const logoPrompts = [
        `Professional book logo for "${book.title}" by ${authorName}. Elegant, modern, ${book.category || "literary"} theme. Standalone mark without text. Style: minimalist geometric.`,
        `Book logo for "${book.title}" by ${authorName}. Premium luxury feel with subtle emblem. Category: ${book.category || "fiction"}. Style: ornate, sophisticated.`,
        `Author logo for ${authorName}. Professional, memorable mark suitable for book branding. Include subtle literary elements. Style: contemporary clean lines.`,
        `Book brand mark for "${book.title}". ${book.subjects?.join(", ") || "story"}. Modern, distinctive, scalable design. Style: bold and vibrant.`,
        `Literary mark for "${book.title}" by ${authorName}. Timeless appeal, professional publishing quality. Style: classic elegant.`
      ];

      const logos = [];
      for (const prompt of logoPrompts) {
        const res = await base44.integrations.Core.GenerateImage({
          prompt: `${prompt} High-resolution, professional, transparent background preferred, suitable for book covers and author branding.`
        });
        logos.push({
          url: res.url,
          prompt: prompt,
          generated: new Date().toLocaleTimeString()
        });
      }
      setGeneratedLogos(logos);
    } catch (error) {
      console.error("Logo generation error:", error);
      alert("Error generating logos: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setUploadedLogo(res.file_url);
      await onUpdate({ front_cover_url: res.file_url }, true);
      // Automatically process with LLM
      await processLogoWithLLM(res.file_url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading logo: " + error.message);
    }
  };

  // Save selected generated logo
  const saveLogo = async (logo) => {
    setIsSaving(true);
    try {
      setSelectedLogo(logo.url);
      setUploadedLogo(logo.url);
      await onUpdate({ front_cover_url: logo.url }, true);
      // Automatically process with LLM
      await processLogoWithLLM(logo.url);
      alert("Logo saved to book!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving logo: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <Image className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Book Logo & Branding</h2>
          <p className="text-sm text-white/50">Generate AI logos or upload your own for your book</p>
        </div>
      </div>

      {/* Author Name Selection */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Author Identity</CardTitle>
          <p className="text-sm text-white/50 mt-1">Choose how your name appears on the logo</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => setUsePenName(false)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                !usePenName
                  ? "bg-amber-500/20 border-amber-400 text-white"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8"
              }`}
            >
              <p className="font-medium text-sm">Real Name</p>
              <p className="text-xs text-white/50 mt-0.5">{user?.full_name || "Your Name"}</p>
            </button>
            <button
              onClick={() => setUsePenName(true)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                usePenName
                  ? "bg-amber-500/20 border-amber-400 text-white"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8"
              }`}
            >
              <p className="font-medium text-sm">Pen Name</p>
              <p className="text-xs text-white/50 mt-0.5">Custom author name</p>
            </button>
          </div>
          {usePenName && (
            <Input
              placeholder="Enter your pen name"
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              className="bg-white/8 border-white/15 text-white placeholder:text-white/25"
            />
          )}
        </CardContent>
      </Card>

      {/* AI Logo Generation */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-amber-500 text-white">
                1
              </span>
              AI-Generated Logos
            </CardTitle>
            <Button
              onClick={generateLogos}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1" />Generate 5 Logos</>
              )}
            </Button>
          </div>
          <p className="text-sm text-white/50 mt-1">AI creates 5 professional logo options based on your book</p>
        </CardHeader>

        {generatedLogos.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {generatedLogos.map((logo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-lg overflow-hidden bg-black border-2 border-white/10 hover:border-amber-400 transition-all cursor-pointer group"
                  onClick={() => saveLogo(logo)}
                >
                  <img src={logo.url} alt={`Logo ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveLogo(logo);
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/60 text-white border-0 text-xs">#{idx + 1}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-3">Click any logo to select and save it to your book</p>
          </CardContent>
        )}
      </Card>

      {/* Upload Logo */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white">
              2
            </span>
            Upload Your Logo
          </CardTitle>
          <p className="text-sm text-white/50 mt-1">Or upload a custom logo file (PNG, JPG)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-white/20 hover:border-white/30 cursor-pointer transition-all">
            <Upload className="w-5 h-5 text-white/50" />
            <div>
              <p className="text-sm font-medium text-white">Click to upload logo</p>
              <p className="text-xs text-white/40">PNG, JPG up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadedLogo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                <img src={uploadedLogo} alt="Current Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = uploadedLogo;
                    a.download = `${book.title}-logo.png`;
                    a.click();
                  }}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedLogo(null)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Replace
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-sm">Logo saved to book</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {uploadedLogo && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Logo Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-slate-800 to-black flex items-center justify-center overflow-hidden border border-white/10">
                <img src={uploadedLogo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">{book.title}</p>
                <p className="text-white/60 text-sm">by {authorName}</p>
                <Badge className="mt-2">{book.category || "Book"}</Badge>
              </div>
            </div>
            
            {/* Logo Analysis */}
            {logoAnalysis && (
              <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-white">AI Logo Analysis</p>
                {logoAnalysis.optimization_guide && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-white/60">Crop Level</p>
                        <p className="text-white capitalize">{logoAnalysis.optimization_guide.crop_level}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-white/60">Padding</p>
                        <p className="text-white">{logoAnalysis.optimization_guide.padding_px}px</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-white/60">Target Size</p>
                        <p className="text-white">{logoAnalysis.optimization_guide.final_size}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-white/60">Colors</p>
                        <p className="text-white">{logoAnalysis.optimization_guide.colors?.length || 0} colors</p>
                      </div>
                    </div>
                    {logoAnalysis.optimization_guide.use_cases && logoAnalysis.optimization_guide.use_cases.length > 0 && (
                      <div className="bg-white/5 p-2 rounded">
                        <p className="text-white/60 text-xs mb-1">Best For</p>
                        <div className="flex flex-wrap gap-1">
                          {logoAnalysis.optimization_guide.use_cases.map((use, idx) => (
                            <Badge key={idx} className="bg-amber-500/20 text-amber-300 border-0 text-xs capitalize">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {processing && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing logo with AI...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}