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
  Play
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
      for (const scene of scenes.slice(0, 4)) { // Generate first 4 scenes
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `Cinematic storyboard frame for book trailer:
          
Book: "${book.title}" - ${book.category}
Scene: ${scene.visual}
Style: Cinematic, dramatic lighting, movie poster quality, 16:9 aspect ratio

${book.characters?.length > 0 ? `Characters to maintain consistency: ${book.characters.map(c => `${c.name}: ${c.appearance || c.description}`).join('; ')}` : ''}

High quality cinematic frame, movie trailer style.`
        });
        images.push({ scene: scene.scene_number, url: response.url });
      }
      setStoryboardImages(images);
    } catch (error) {
      console.error("Error generating images:", error);
    }
    setGeneratingImages(false);
  };

  const saveVideo = () => {
    onUpdate({ 
      video_commercial_url: JSON.stringify({ script, storyboardImages }),
      status: "marketing" 
    }, true);
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
          <div className="flex flex-wrap gap-3">
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
                  Generate Video Script
                </>
              )}
            </Button>
            {script && (
              <>
                <Button
                  onClick={generateStoryboardImages}
                  disabled={generatingImages}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {generatingImages ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Storyboard...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      Generate Storyboard Images
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveVideo}
                  disabled={isUpdating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Video Plan
                </Button>
              </>
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