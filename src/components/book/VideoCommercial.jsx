import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Check, 
  Loader2, 
  Video, 
  Film,
  Music,
  Clock,
  Image,
  Download,
  Play,
  RefreshCw,
  ExternalLink,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";

export default function VideoCommercial({ book, onUpdate, isUpdating }) {
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("60");
  const [generatingImages, setGeneratingImages] = useState(false);
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Load saved video data on mount
  React.useEffect(() => {
    if (book.video_commercial_url) {
      try {
        const saved = JSON.parse(book.video_commercial_url);
        if (saved.videoUrl) {
          setVideoUrl(saved.videoUrl);
          setScript(saved.script || null);
          setSelectedDuration(saved.duration || "60");
          setStoryboardImages(saved.storyboardImages || []);
        } else {
          // Legacy format - just a URL
          setVideoUrl(book.video_commercial_url);
        }
      } catch {
        // Not JSON, treat as direct URL
        setVideoUrl(book.video_commercial_url);
      }
    }
  }, [book.video_commercial_url]);

  const generateScript = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a professional book trailer/commercial script for:

Book: "${book.title}"
Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range}
Themes: ${book.subjects?.join(', ')}
Characters: ${JSON.stringify(book.characters?.map(c => ({ name: c.name, role: c.role, appearance: c.appearance })))}
Summary: ${book.book_summary}

Create scripts for 30s, 60s, and 90s versions.

For each version include:
1. Opening hook (attention-grabbing first 3 seconds)
2. Scene-by-scene breakdown with:
   - Visual description (maintaining character consistency)
   - Narration/voiceover text
   - Timing for each scene
3. Music/sound mood recommendations
4. Call-to-action ending

Make it cinematic, emotional, and appropriate for the target audience.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            versions: {
              type: "object",
              properties: {
                "30s": {
                  type: "object",
                  properties: {
                    scenes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          scene_number: { type: "number" },
                          duration: { type: "string" },
                          visual: { type: "string" },
                          narration: { type: "string" }
                        }
                      }
                    },
                    music_mood: { type: "string" }
                  }
                },
                "60s": {
                  type: "object",
                  properties: {
                    scenes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          scene_number: { type: "number" },
                          duration: { type: "string" },
                          visual: { type: "string" },
                          narration: { type: "string" }
                        }
                      }
                    },
                    music_mood: { type: "string" }
                  }
                },
                "90s": {
                  type: "object",
                  properties: {
                    scenes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          scene_number: { type: "number" },
                          duration: { type: "string" },
                          visual: { type: "string" },
                          narration: { type: "string" }
                        }
                      }
                    },
                    music_mood: { type: "string" }
                  }
                }
              }
            },
            call_to_action: { type: "string" }
          }
        }
      });
      setScript(response);
    } catch (error) {
      console.error("Error generating script:", error);
    }
    setGenerating(false);
  };

  const generateStoryboardImages = async () => {
    if (!script?.versions?.[selectedDuration + "s"]?.scenes) return;
    
    setGeneratingImages(true);
    const scenes = script.versions[selectedDuration + "s"].scenes;
    const images = [];
    
    try {
      for (const scene of scenes.slice(0, 4)) { // Generate first 4 key scenes
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `Cinematic storyboard frame for "${book.title}" book trailer, ${selectedDuration} second version:

Scene ${scene.scene_number}: ${scene.visual}
Narration: "${scene.narration}"
Duration: ${scene.duration}

Book Genre: ${book.category}
Target Audience: ${book.target_audience?.age_range || 'General'}
${book.characters?.length > 0 ? `\nMain Characters: ${book.characters.map(c => `${c.name} (${c.role}): ${c.appearance || c.description}`).join('; ')}` : ''}

Style: Cinematic movie trailer quality, dramatic lighting, professional commercial aesthetic, 16:9 widescreen format. Make it look like a real movie poster frame.`
        });
        images.push({ 
          scene: scene.scene_number, 
          url: response.url,
          visual: scene.visual,
          narration: scene.narration 
        });
      }
      setStoryboardImages(images);
      
      // Auto-save progress
      const videoData = {
        script,
        duration: selectedDuration,
        storyboardImages: images
      };
      await onUpdate({ video_commercial_url: JSON.stringify(videoData) }, true);
      
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Failed to generate storyboard images");
    }
    setGeneratingImages(false);
  };

  const generateVideo = async () => {
    if (!script?.versions?.[selectedDuration + "s"]) {
      alert("Please generate a script first");
      return;
    }
    
    if (!storyboardImages || storyboardImages.length === 0) {
      alert("Please generate storyboard images first");
      return;
    }

    setGeneratingVideo(true);
    try {
      const selectedVersion = script.versions[selectedDuration + "s"];

      // Generate a final composite "title card" image as the video thumbnail/end card
      const titleCardResponse = await base44.integrations.Core.GenerateImage({
        prompt: `Professional book trailer title card for "${book.title}" by ${book.created_by || 'the author'}. 
Genre: ${book.category}. Cinematic dark background with the book title prominently displayed, movie trailer style, dramatic typography, gold accents, high quality.`,
        existing_image_urls: book.front_cover_url ? [book.front_cover_url] : undefined
      });

      const allImages = [
        ...storyboardImages,
        { scene: "title", url: titleCardResponse.url, visual: "Title Card", narration: script.call_to_action || "" }
      ];

      // Store the storyboard+title card as the "video" — displayed as a slideshow player
      const videoData = {
        isSlideshow: true,
        slides: allImages,
        script: selectedVersion,
        call_to_action: script.call_to_action,
        duration: selectedDuration,
        storyboardImages,
        generatedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(videoData);
      setVideoUrl(dataStr);

      await onUpdate({ 
        video_commercial_url: dataStr,
        status: "marketing" 
      }, true);

    } catch (error) {
      console.error("Error generating video:", error);
      alert("Failed to generate video. Please try again.");
    } finally {
      setGeneratingVideo(false);
    }
  };

  const saveVideo = () => {
    const videoData = {
      videoUrl,
      script,
      duration: selectedDuration,
      storyboardImages
    };
    onUpdate({ 
      video_commercial_url: JSON.stringify(videoData),
      status: "marketing" 
    }, true);
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${book.title.replace(/\s+/g, '-')}-trailer-${selectedDuration}s.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const regenerateVideo = async () => {
    setVideoUrl(null);
    setGeneratingVideo(true);
    await generateVideo();
  };

  const getHostingLinks = () => {
    if (!videoUrl) return null;
    
    return {
      youtube: `https://www.youtube.com/upload`,
      vimeo: `https://vimeo.com/upload`,
      wistia: `https://app.wistia.com/`,
      cloudinary: `https://cloudinary.com/console/media_library`
    };
  };

  const currentVersion = script?.versions?.[selectedDuration + "s"];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-400" />
            Video Commercial
          </CardTitle>
          <CardDescription className="text-white/50">
            Create a professional book trailer script and storyboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold">1</div>
              <Button
                onClick={generateScript}
                disabled={generating}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {script ? 'Regenerate Script' : 'Generate Video Script'}
                  </>
                )}
              </Button>
              {script && <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✓ Complete</Badge>}
            </div>
            
            {script && (
              <>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${storyboardImages.length > 0 ? 'bg-blue-500' : 'bg-slate-600'}`}>2</div>
                  <Button
                    onClick={generateStoryboardImages}
                    disabled={generatingImages || !script}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Storyboard...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        {storyboardImages.length > 0 ? 'Regenerate Storyboard' : 'Generate Storyboard Images'}
                      </>
                    )}
                  </Button>
                  {storyboardImages.length > 0 && <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✓ {storyboardImages.length} images</Badge>}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${videoUrl ? 'bg-purple-500' : 'bg-slate-600'}`}>3</div>
                  <Button
                    onClick={generateVideo}
                    disabled={generatingVideo || !script || storyboardImages.length === 0}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assembling Video...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {videoUrl ? 'Regenerate Video' : 'Generate Final Video'}
                      </>
                    )}
                  </Button>
                  {videoUrl && <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✓ Ready</Badge>}
                  {!script && <span className="text-xs text-white/40">Complete step 1 first</span>}
                  {script && storyboardImages.length === 0 && <span className="text-xs text-white/40">Complete step 2 first</span>}
                </div>
              </>
            )}
            
            {videoUrl && (
              <div className="flex gap-3 ml-11 mt-2">
                <Button
                  onClick={regenerateVideo}
                  disabled={generatingVideo}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={downloadVideo}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white border-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Script Content */}
      {script && (
        <>
          {/* Duration Selector */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <Label className="text-white/70 mb-3 block">Video Duration</Label>
              <div className="flex gap-3">
                {["30", "60", "90"].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      selectedDuration === duration
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    } border`}
                  >
                    <Clock className="w-4 h-4" />
                    {duration} seconds
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Storyboard & Script */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Scenes */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Film className="w-4 h-4 text-amber-400" />
                    Scenes
                  </CardTitle>
                  <Badge className="bg-white/10 text-white/60 border-0">
                    {currentVersion?.scenes?.length || 0} scenes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentVersion?.scenes?.map((scene, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-amber-400">{scene.scene_number}</span>
                      </div>
                      <Badge className="bg-white/10 text-white/60 border-0">{scene.duration}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">Visual</p>
                        <p className="text-sm text-white/70">{scene.visual}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">Narration</p>
                        <p className="text-sm text-white italic">"{scene.narration}"</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Storyboard Images & Music */}
            <div className="space-y-6">
              {/* Music Mood */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    Music & Sound
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">{currentVersion?.music_mood}</p>
                </CardContent>
              </Card>

              {/* Generated Video / Slideshow */}
              {videoUrl && (() => {
                let slideshowData = null;
                try { slideshowData = JSON.parse(videoUrl); } catch {}
                if (!slideshowData?.isSlideshow) return null;
                const slides = slideshowData.slides || [];
                const currentSlide = slides[slideIndex] || slides[0];
                return (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Play className="w-4 h-4 text-amber-400" />
                        Storyboard Preview ({slides.length} scenes)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-lg overflow-hidden bg-black relative mb-3">
                        {currentSlide?.url && (
                          <img src={currentSlide.url} alt={`Scene ${currentSlide.scene}`} className="w-full h-full object-cover" />
                        )}
                        {currentSlide?.narration && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3">
                            <p className="text-white text-xs italic text-center">"{currentSlide.narration}"</p>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/60 text-white border-0">Scene {slideIndex + 1}/{slides.length}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} disabled={slideIndex === 0}>← Prev</Button>
                        <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={() => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1))} disabled={slideIndex === slides.length - 1}>Next →</Button>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {slides.map((s, i) => (
                          <button key={i} onClick={() => setSlideIndex(i)} className={`aspect-video rounded overflow-hidden border-2 transition-all ${i === slideIndex ? 'border-amber-400' : 'border-transparent'}`}>
                            <img src={s.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <Button onClick={regenerateVideo} size="sm" disabled={generatingVideo} className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white border-0">
                        <RefreshCw className="w-3 h-3 mr-2" /> Regenerate
                      </Button>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Hosting Options */}
              {videoUrl && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    Host Video
                  </CardTitle>
                  <CardDescription className="text-white/50 text-xs">
                    Upload to video hosting platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(getHostingLinks() || {}).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-white capitalize">{platform}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                    </a>
                  ))}
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs text-amber-300">
                      💡 Tip: Download the video first, then upload to your preferred platform for professional hosting
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Storyboard Images */}
              {storyboardImages.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Storyboard Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {storyboardImages.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                          <img src={img.url} alt={`Scene ${img.scene}`} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-black/50 text-white border-0">Scene {img.scene}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Call to Action */}
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30">
                <CardContent className="py-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Call to Action</p>
                  <p className="text-amber-300 font-medium">{script.call_to_action}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!script && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No video script yet</h3>
            <p className="text-white/50">Generate an AI script for your book trailer</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}