import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Check, Upload, ExternalLink } from "lucide-react";

export default function SEOMetadataEditor({ book, onUpdate, isUpdating }) {
  const seo = book?.website_config?.seo || {};

  const [metaTitle, setMetaTitle] = useState(seo.meta_title || "");
  const [metaDesc, setMetaDesc] = useState(seo.meta_description || "");
  const [ogImage, setOgImage] = useState(seo.og_image || "");
  const [ogImageUploading, setOgImageUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = book?.website_config?.seo || {};
    setMetaTitle(s.meta_title || "");
    setMetaDesc(s.meta_description || "");
    setOgImage(s.og_image || "");
  }, [book?.id]);

  const titleLen = metaTitle.length;
  const descLen = metaDesc.length;

  const handleSave = async () => {
    await onUpdate({
      website_config: {
        ...(book?.website_config || {}),
        seo: { meta_title: metaTitle, meta_description: metaDesc, og_image: ogImage }
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const prompt = `You are an SEO expert specializing in AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), and SGE (Search Generative Experience).

Generate optimized metadata for a book landing page:
- Book title: "${book.title}"
- Subtitle: "${book.subtitle || ""}"
- Genre/Category: "${book.category || ""}"
- Summary: "${(book.book_summary || book.plot_summary || "").slice(0, 500)}"

Return:
- meta_title: Compelling title under 60 characters. Include the book title and a key benefit/hook.
- meta_description: Rich description 140-160 characters. Answer "what is this book about?" directly for AI search engines. Include genre, hook, and call to action.`;

    const result = await ai.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          meta_title: { type: "string" },
          meta_description: { type: "string" }
        }
      }
    });
    setMetaTitle(result.meta_title || metaTitle);
    setMetaDesc(result.meta_description || metaDesc);
    setGenerating(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgImageUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setOgImage(file_url);
    setOgImageUploading(false);
  };

  const previewTitle = metaTitle || book?.title || "Book Title";
  const previewDesc = metaDesc || book?.book_summary?.slice(0, 160) || "Book description...";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">SEO & Metadata</h2>
          <p className="text-white/50 text-sm mt-1">Optimize your book page for AI search engines (AEO / GEO / SGE)</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          AI Generate
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Meta Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            maxLength={70}
            placeholder={`${book?.title} — ${book?.category || "Fiction"}`}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          />
          <p className={`text-xs ${titleLen > 60 ? "text-amber-400" : "text-white/40"}`}>
            {titleLen}/60 characters {titleLen > 60 ? "— consider shortening" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Meta Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={metaDesc}
            onChange={e => setMetaDesc(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="A direct, engaging description that answers what this book is about. Used by AI engines to summarize your page."
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 resize-none"
          />
          <p className={`text-xs ${descLen > 160 ? "text-amber-400" : descLen < 120 && descLen > 0 ? "text-yellow-400" : "text-white/40"}`}>
            {descLen}/160 characters
            {descLen > 160 ? " — may be truncated" : descLen < 120 && descLen > 0 ? " — aim for 140-160" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">OpenGraph Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/50 text-sm">Used when your book page is shared on social media or cited by AI. Recommended: 1200×630px.</p>
          <div className="flex gap-3 items-center">
            <Input
              value={ogImage}
              onChange={e => setOgImage(e.target.value)}
              placeholder="https://... or upload below"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30 flex-1"
            />
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 pointer-events-none">
                {ogImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </Button>
            </label>
          </div>
          {!ogImage && book?.front_cover_url && (
            <button
              onClick={() => setOgImage(book.front_cover_url)}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Use book cover as OG image
            </button>
          )}
          {ogImage && (
            <img src={ogImage} alt="OG preview" className="w-full max-w-sm rounded-xl border border-white/10 object-cover aspect-video" />
          )}
        </CardContent>
      </Card>

      {/* SERP / AI Preview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Search Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-xl p-5 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ExternalLink className="w-3 h-3" />
              <span>yoursite.com › books</span>
            </div>
            <p className="text-blue-700 font-medium text-lg leading-tight hover:underline cursor-pointer">
              {previewTitle.slice(0, 60)}{previewTitle.length > 60 ? "..." : ""}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {previewDesc.slice(0, 160)}{previewDesc.length > 160 ? "..." : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isUpdating}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 px-8"
      >
        {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-2 text-emerald-300" /> : null}
        {saved ? "Saved!" : "Save Metadata"}
      </Button>
    </div>
  );
}