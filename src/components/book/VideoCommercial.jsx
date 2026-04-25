import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Check, Loader2, Video, Film, Music, Clock, Download, RefreshCw, Save,
  Youtube, ExternalLink, Copy
} from "lucide-react";
import { motion } from "framer-motion";

export default function VideoCommercial({ book, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("60");
  const [script, setScript] = useState(null);
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoGuideStep, setVideoGuideStep] = useState(null);

  // ── Load saved data on mount ──────────────────────────────────────────────
  useEffect(() => {
    const raw = book.video_commercial_url;
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.script) setScript(saved.script);
      if (saved.duration) setSelectedDuration(saved.duration);
      if (saved.storyboardImages?.length) setStoryboardImages(saved.storyboardImages);
      if (saved.youtubeUrl) setYoutubeUrl(saved.youtubeUrl);
    } catch {
      // not JSON — ignore
    }
  }, [book.video_commercial_url]);

  // ── Persist helper ────────────────────────────────────────────────────────
  const persist = async (scriptData, duration, images, url) => {
    const payload = JSON.stringify({
      script: scriptData,
      duration,
      storyboardImages: images,
      youtubeUrl: url || youtubeUrl,
      savedAt: new Date().toISOString()
    });
    await onUpdate({ video_commercial_url: payload }, true);
  };

  // ── Step 1: Generate script ───────────────────────────────────────────────
  const generateScript = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a professional book trailer script for:

Book: "${book.title}"
${book.subtitle ? `Subtitle: "${book.subtitle}"` : ""}
Genre: ${book.category || "General"}
Summary: ${book.book_summary || book.plot_summary || ""}
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role })))}
Target Audience: ${book.target_audience?.age_range || "General"}
Themes: ${book.subjects?.join(", ") || ""}

Create scripts for 30-second, 60-second, and 90-second versions.

Each version must have:
- 4–8 scenes, each with: scene_number, duration_seconds (number), visual (what's on screen), narration (voiceover text)
- music_mood: recommended background music style
- The total narration should fit naturally within the chosen duration.

Make it cinematic, emotional, and compelling.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            call_to_action: { type: "string" },
            versions: {
              type: "object",
              properties: {
                "30s": {
                  type: "object",
                  properties: {
                    music_mood: { type: "string" },
                    scenes: { type: "array", items: { type: "object", properties: { scene_number: { type: "number" }, duration_seconds: { type: "number" }, visual: { type: "string" }, narration: { type: "string" } } } }
                  }
                },
                "60s": {
                  type: "object",
                  properties: {
                    music_mood: { type: "string" },
                    scenes: { type: "array", items: { type: "object", properties: { scene_number: { type: "number" }, duration_seconds: { type: "number" }, visual: { type: "string" }, narration: { type: "string" } } } }
                  }
                },
                "90s": {
                  type: "object",
                  properties: {
                    music_mood: { type: "string" },
                    scenes: { type: "array", items: { type: "object", properties: { scene_number: { type: "number" }, duration_seconds: { type: "number" }, visual: { type: "string" }, narration: { type: "string" } } } }
                  }
                }
              }
            }
          }
        }
      });
      setScript(response);
      await persist(response, selectedDuration, storyboardImages);
    } finally {
      setGenerating(false);
    }
  };

  // ── Step 2: Generate storyboard images ───────────────────────────────────
  const generateStoryboardImages = async () => {
    const scenes = script?.versions?.[selectedDuration + "s"]?.scenes;
    if (!scenes) return;
    setGeneratingImages(true);
    const images = [];
    try {
      for (const scene of scenes.slice(0, 5)) {
        const res = await base44.integrations.Core.GenerateImage({
          prompt: `Cinematic movie trailer still frame for book "${book.title}".
Scene ${scene.scene_number}: ${scene.visual}
Voiceover: "${scene.narration}"
Genre: ${book.category || "drama"}
${book.characters?.length ? `Characters: ${book.characters.map(c => `${c.name}: ${c.appearance || c.description || ""}`).join("; ")}` : ""}
Style: High-quality cinematic, dramatic lighting, 16:9 widescreen, movie poster aesthetic.`
        });
        images.push({
          scene: scene.scene_number,
          url: res.url,
          visual: scene.visual,
          narration: scene.narration,
          duration_seconds: scene.duration_seconds
        });
      }
      setStoryboardImages(images);
      await persist(script, selectedDuration, images);
    } finally {
      setGeneratingImages(false);
    }
  };

  // ── Save to book ──────────────────────────────────────────────────────────
  const saveToBook = async () => {
    setIsSaving(true);
    try {
      await persist(script, selectedDuration, storyboardImages);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  // ── Download storyboard images ────────────────────────────────────────────
  const downloadImages = () => {
    storyboardImages.forEach((img, i) => {
      const link = document.createElement("a");
      link.href = img.url;
      link.download = `${book.title.replace(/\s+/g, "-")}-scene-${i + 1}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // ── Step 3: Generate video with Google API & auto-publish to YouTube ──────
  const generateVideo = async () => {
    setGeneratingVideo(true);
    try {
      const response = await base44.functions.invoke('generateAndPublishTrailer', {
        script,
        selectedDuration,
        storyboardImages,
        bookTitle: book.title,
        bookId: book.id
      });

      if (response.data?.success) {
        if (response.data.youtubeUrl) {
          // Video was auto-published to YouTube
          setYoutubeUrl(response.data.youtubeUrl);
          await persist(script, selectedDuration, storyboardImages, response.data.youtubeUrl);
          alert(`🎉 Video generated and published to YouTube! Video ID: ${response.data.videoId}`);
        } else {
          // YouTube auth not available, need manual upload
          setVideoGuideStep('upload');
          alert('Video generated! Please authorize YouTube in settings to auto-publish, or paste the YouTube link below.');
        }
      } else {
        alert('Video generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      alert('Error: ' + error.message);
    } finally {
      setGeneratingVideo(false);
    }
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
    return match ? match[1] : null;
  };

  const handleYoutubeUrlSubmit = async () => {
    const youtubeId = extractYoutubeId(videoUrlInput);
    if (!youtubeId) {
      alert("Invalid YouTube URL. Please paste a valid YouTube link.");
      return;
    }
    const fullUrl = `https://www.youtube.com/embed/${youtubeId}`;
    setYoutubeUrl(fullUrl);
    await persist(script, selectedDuration, storyboardImages, fullUrl);
    setVideoUrlInput("");
    setVideoGuideStep(null);
  };

  const copyEmbedCode = () => {
    if (!youtubeUrl) return;
    const embedCode = `<iframe width="100%" height="600" src="${youtubeUrl}" title="Book Trailer" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert("Embed code copied to clipboard!");
  };

  const currentVersion = script?.versions?.[selectedDuration + "s"];
  const hasScript = !!script;
  const hasImages = storyboardImages.length > 0;
  const hasVideo = !!youtubeUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <Video className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Video Trailer</h2>
          <p className="text-sm text-white/50">Generate a 30s, 60s, or 90s book trailer script with storyboard visuals</p>
        </div>
      </div>

      {/* Duration Selector — always visible */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-5">
          <p className="text-sm text-white/60 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Choose trailer length</p>
          <div className="flex gap-3">
            {["30", "60", "90"].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`px-5 py-3 rounded-xl border font-semibold text-sm transition-all ${
                  selectedDuration === d
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {d} seconds
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Script */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${hasScript ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                {hasScript ? <Check className="w-4 h-4" /> : "1"}
              </span>
              Generate Script
            </CardTitle>
            <Button
              onClick={generateScript}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {generating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4 mr-1" />{hasScript ? "Regenerate" : "Generate Script"}</>}
            </Button>
          </div>
          <p className="text-sm text-white/50 mt-1">AI writes scene-by-scene voiceover script for all 3 durations at once.</p>
        </CardHeader>

        {hasScript && currentVersion && (
          <CardContent className="space-y-4">
            {/* Music mood */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <Music className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Music Mood</p>
                <p className="text-sm text-white/80">{currentVersion.music_mood}</p>
              </div>
            </div>

            {/* Scenes */}
            <div className="space-y-3">
              {currentVersion.scenes?.map((scene, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">{scene.scene_number}</span>
                    <Badge className="bg-white/10 text-white/50 border-0 text-xs">{scene.duration_seconds}s</Badge>
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Visual</p>
                  <p className="text-sm text-white/70 mb-2">{scene.visual}</p>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Narration</p>
                  <p className="text-sm text-white italic">"{scene.narration}"</p>
                </div>
              ))}
            </div>

            {/* Call to action */}
            {script.call_to_action && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">Call to Action</p>
                <p className="text-amber-300 font-medium">{script.call_to_action}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Step 2: Storyboard Images */}
      {hasScript && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${hasImages ? "bg-emerald-500 text-white" : "bg-white/20 text-white/60"}`}>
                  {hasImages ? <Check className="w-4 h-4" /> : "2"}
                </span>
                Generate Storyboard Images
              </CardTitle>
              <Button
                onClick={generateStoryboardImages}
                disabled={generatingImages}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              >
                {generatingImages ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Generating…</> : <><Film className="w-4 h-4 mr-1" />{hasImages ? "Regenerate" : "Generate Visuals"}</>}
              </Button>
            </div>
            <p className="text-sm text-white/50 mt-1">Creates one cinematic image per scene — use these in iMovie, CapCut, or Premiere to produce the actual video.</p>
          </CardHeader>

          {hasImages && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {storyboardImages.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <img src={img.url} alt={`Scene ${img.scene}`} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-black/60 text-white border-0 text-xs">Scene {img.scene}</Badge>
                      {img.duration_seconds && <Badge className="bg-black/60 text-white border-0 text-xs">{img.duration_seconds}s</Badge>}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs italic line-clamp-2">"{img.narration}"</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={downloadImages} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" /> Download All Images
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {/* Step 3: Generate Video with AI */}
      {hasScript && hasImages && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${hasVideo ? "bg-emerald-500 text-white" : "bg-white/20 text-white/60"}`}>
                    {hasVideo ? <Check className="w-4 h-4" /> : "3"}
                  </span>
                  Generate & Publish Video
                </CardTitle>
                {!hasVideo && (
                  <Button
                    onClick={generateVideo}
                    disabled={generatingVideo}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                  >
                    {generatingVideo ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Generating…</>
                    ) : (
                      <><Video className="w-4 h-4 mr-1" />Generate {selectedDuration}s Video</>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-sm text-white/50 mt-1">Google AI generates a professional {selectedDuration}-second video from your script and storyboard images.</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Generate video step */}
              {!hasVideo && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">AI-Powered Video Generation</h4>
                      <p className="text-white/60 text-xs">
                        Google's text-to-video AI will create a cinematic {selectedDuration}-second trailer using:
                      </p>
                      <ul className="text-white/60 text-xs space-y-0.5 list-disc ml-4 mt-1.5">
                        <li>Your script narration and scene descriptions</li>
                        <li>Storyboard images as visual references</li>
                        <li>Professional color grading and transitions</li>
                        <li>Music mood: <span className="italic">"{currentVersion.music_mood}"</span></li>
                        <li>Text overlays with title and call-to-action</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube URL Input */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 font-medium">YouTube Video URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="bg-white/8 border-white/15 text-white placeholder:text-white/25"
                  />
                  <Button
                    onClick={handleYoutubeUrlSubmit}
                    disabled={!videoUrlInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white border-0 shrink-0"
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-white/40">Paste your YouTube video link to embed it on your book website</p>
              </div>

              {/* YouTube Preview */}
              {hasVideo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      width="100%"
                      height="100%"
                      src={youtubeUrl}
                      title="Book Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyEmbedCode}
                      className="flex-1 border-white/15 text-white hover:bg-white/8 gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Embed Code
                    </Button>
                    <Button variant="ghost" onClick={() => window.open(youtubeUrl.replace("/embed/", "/watch?v="), "_blank")}
                      className="text-white/50 hover:text-white hover:bg-white/8 gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View on YouTube
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-emerald-300 text-sm">Video ready to embed on your book website</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Save to Book */}
      {hasScript && (
        <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-emerald-300 font-semibold">Save Trailer to Book</p>
              <p className="text-xs text-white/50 mt-0.5">Saves your {selectedDuration}s trailer script{hasImages ? " + storyboard images" : ""}{hasVideo ? " + YouTube video" : ""} to the book's landing page.</p>
              {lastSaved && <p className="text-xs text-emerald-400 mt-1">✓ Last saved {lastSaved.toLocaleTimeString()}</p>}
            </div>
            <Button
              onClick={saveToBook}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold flex-shrink-0"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-2" />Save to Book</>}
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasScript && !generating && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No trailer script yet</h3>
            <p className="text-white/50 mb-4">Select a duration above and click Generate Script to start.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}