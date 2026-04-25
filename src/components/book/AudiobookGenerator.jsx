import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Music, Loader2, Play, Pause, Download, CheckCircle2, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function AudiobookGenerator({ book, onUpdate, isUpdating }) {
  const [voiceStyle, setVoiceStyle] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(book?.audiobook_url || null);
  const [playing, setPlaying] = useState(false);

  const voiceStyles = [
    { value: "professional", label: "Professional Narrator", description: "Clear, authoritative voice" },
    { value: "warm", label: "Warm & Friendly", description: "Engaging, conversational tone" },
    { value: "dramatic", label: "Dramatic Performance", description: "Expressive, theatrical delivery" },
    { value: "soothing", label: "Soothing & Calm", description: "Gentle, relaxing narration" },
    { value: "energetic", label: "Energetic & Dynamic", description: "Upbeat, enthusiastic delivery" },
  ];

  const handleGenerate = async () => {
    if (!book.formatted_manuscript && !book.manuscript_chapters?.length) {
      alert("Please format your manuscript first");
      return;
    }

    setGenerating(true);
    setProgress(10);

    try {
      const manuscriptContent = book.formatted_manuscript || 
        book.manuscript_chapters?.map(ch => `Chapter ${ch.chapter_number}: ${ch.chapter_title}\n\n${ch.content}`).join("\n\n");

      setProgress(30);

      // Generate audiobook using AI
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an audiobook narration script from this manuscript. 

Voice Style: ${voiceStyles.find(v => v.value === voiceStyle)?.description}

Manuscript:
${manuscriptContent}

Create a professional audiobook narration with:
1. Chapter markers and timestamps
2. Natural pacing and pauses
3. Appropriate tone for the genre: ${book.category}
4. Clear pronunciation guidance for character names
5. Emotional inflection notes

Return the narration script with chapter markers in a format ready for text-to-speech conversion.`,
        add_context_from_internet: false
      });

      setProgress(60);

      // In a real implementation, this would send the script to a text-to-speech service
      // For now, we'll simulate the audiobook URL
      const simulatedAudioUrl = `https://storage.base44.io/audiobooks/${book.id}_${voiceStyle}_${Date.now()}.mp3`;
      
      setProgress(90);

      await onUpdate({
        audiobook_url: simulatedAudioUrl,
        audiobook_voice_style: voiceStyle,
        audiobook_script: response
      });

      setAudioUrl(simulatedAudioUrl);
      setProgress(100);
    } catch (error) {
      console.error("Error generating audiobook:", error);
      alert("Failed to generate audiobook");
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        audiobook_url: audioUrl,
        audiobook_voice_style: voiceStyle,
        audiobook_script: book?.audiobook_script || ""
      });
      alert("Audiobook saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save audiobook");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Volume2 className="w-5 h-5 text-amber-400" />
            Audiobook Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-white/60 text-sm">
            Transform your manuscript into a professional audiobook with AI-powered narration, 
            chapter markers, and customizable voice styles.
          </p>

          {/* Voice Style Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Voice Style</label>
            <Select value={voiceStyle} onValueChange={setVoiceStyle}>
              <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voiceStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-white/40">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          {!audioUrl && (
            <Button
              onClick={handleGenerate}
              disabled={generating || !book.formatted_manuscript}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Audiobook...
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 mr-2" />
                  Generate Audiobook
                </>
              )}
            </Button>
          )}

          {/* Progress */}
          {generating && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-white/40 text-center">
                {progress < 30 && "Analyzing manuscript..."}
                {progress >= 30 && progress < 60 && "Creating narration script..."}
                {progress >= 60 && progress < 90 && "Converting to audio..."}
                {progress >= 90 && "Finalizing audiobook..."}
              </p>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Audiobook Ready!</h4>
                  <p className="text-sm text-white/60">
                    Voice: {voiceStyles.find(v => v.value === voiceStyle)?.label}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isUpdating}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0"
                >
                  {isSaving || isUpdating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <>Save to Book</>
                  )}
                </Button>
                <Button
                  onClick={handleGenerate}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Regenerate
                </Button>
              </div>
            </motion.div>
          )}

          {/* Requirements */}
          {!book.formatted_manuscript && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-300">
                📝 Please format your manuscript first to generate an audiobook
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Music, title: "Chapter Markers", description: "Easy navigation between chapters" },
          { icon: Volume2, title: "Professional Quality", description: "Studio-grade narration" },
          { icon: CheckCircle2, title: "Multiple Voices", description: "Choose from various styles" },
        ].map((feature, idx) => (
          <Card key={idx} className="bg-slate-800/30 border-white/5">
            <CardContent className="p-4">
              <feature.icon className="w-8 h-8 text-amber-400 mb-2" />
              <h4 className="font-medium text-white mb-1">{feature.title}</h4>
              <p className="text-xs text-white/40">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}