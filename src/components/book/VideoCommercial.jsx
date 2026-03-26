import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Check, Loader2, Video, Film, Music, Clock, Download, RefreshCw, Save
} from "lucide-react";

export default function VideoCommercial({ book, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("60");
  const [script, setScript] = useState(null);
  const [storyboardImages, setStoryboardImages] = useState([]);

  // ── Load saved data on mount ──────────────────────────────────────────────
  useEffect(() => {
    const raw = book.video_commercial_url;
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.script) setScript(saved.script);
      if (saved.duration) setSelectedDuration(saved.duration);
      if (saved.storyboardImages?.length) setStoryboardImages(saved.storyboardImages);
    } catch {
      // not JSON — ignore
    }
  }, [book.video_commercial_url]);

  // ── Persist helper ────────────────────────────────────────────────────────
  const persist = async (scriptData, duration, images) => {
    const payload = JSON.stringify({
      script: scriptData,
      duration,
      storyboardImages: images,
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

  const currentVersion = script?.versions?.[selectedDuration + "s"];
  const hasScript = !!script;
  const hasImages = storyboardImages.length > 0;

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

      {/* Save to Book */}
      {hasScript && (
        <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-emerald-300 font-semibold">Save Trailer to Book</p>
              <p className="text-xs text-white/50 mt-0.5">Saves your {selectedDuration}s trailer script{hasImages ? " + storyboard images" : ""} to the book's landing page.</p>
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