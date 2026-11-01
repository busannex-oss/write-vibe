import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Film, Loader2, Download, Clapperboard } from "lucide-react";
import { stitchVideo } from "@/lib/stitchVideo";

export default function PromoVideoStudio({ book, version, musicUrl, ctaText, savedUrl, onSaved }) {
  const [aspect, setAspect] = useState("16:9");
  const [stage, setStage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(savedUrl || null);

  const create = async () => {
    setError(null);
    setStage("clips");
    try {
      const res = await base44.functions.invoke("generatePromoClips", {
        scenes: version.scenes, bookTitle: book.title, genre: book.category, mood: version.music_mood, aspectRatio: aspect,
      });
      const urls = (res.data?.clips || []).map((c) => c.url).filter(Boolean);
      if (!urls.length) throw new Error(res.data?.error || "No clips were generated");
      setStage("render");
      const blob = await stitchVideo({ clipUrls: urls, musicUrl, title: book.title, cta: ctaText || "Available Now", aspect, onProgress: setProgress });
      const file = new File([blob], `promo-${Date.now()}.webm`, { type: "video/webm" });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setVideoUrl(file_url);
      onSaved(file_url);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setStage(null);
      setProgress(0);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2"><Clapperboard className="w-5 h-5 text-cyan-400" />AI Promo Video</CardTitle>
        <p className="text-sm text-white/50">Generates real cinematic clips for up to 4 scenes, then edits them into one finished video with your title, call to action and background music.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {["16:9", "9:16"].map((a) => (
            <button key={a} onClick={() => setAspect(a)} className={`px-3 py-1 rounded-full text-xs ${aspect === a ? "bg-cyan-500/20 border border-cyan-400 text-white" : "bg-white/5 text-white/60"}`}>
              {a === "16:9" ? "Landscape 16:9 (YouTube)" : "Vertical 9:16 (Reels/TikTok)"}
            </button>
          ))}
          <Button onClick={create} disabled={!!stage} size="sm" className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
            {stage ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Film className="w-4 h-4 mr-1" />}
            {stage === "clips" ? "Filming scenes… (1–2 min)" : stage === "render" ? "Editing video…" : videoUrl ? "Recreate Video" : "Create Promo Video"}
          </Button>
        </div>
        {stage === "render" && <Progress value={progress * 100} />}
        {!musicUrl && <p className="text-xs text-white/40">Tip: generate background music above first to include it in the video.</p>}
        {error && <p className="text-sm text-red-300 p-3 rounded-lg bg-red-500/10 border border-red-500/30">{error}</p>}
        {videoUrl && (
          <div className="space-y-2">
            <video src={videoUrl} controls className="w-full max-h-[480px] rounded-xl bg-black" />
            <Button variant="outline" size="sm" onClick={() => window.open(videoUrl, "_blank")} className="border-white/20 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />Download Video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}