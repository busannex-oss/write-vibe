import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Loader2, Download, Sparkles, Check } from "lucide-react";

const MUSIC_PROVIDERS = [
  { id: "minimax_music", label: "MiniMax Music 2.6", dot: "bg-red-500", available: true },
  { id: "mureka", label: "Mureka Song", dot: "bg-purple-500", available: false },
  { id: "lyria", label: "Lyria 3 Music", dot: "bg-purple-500", available: false },
  { id: "elevenlabs_music", label: "ElevenLabs Music", dot: "bg-blue-500", available: false },
];

const TTS_PROVIDERS = [
  { id: "gemini_tts", label: "Gemini 3.1 Flash TTS", dot: "bg-blue-500", available: false },
  { id: "elevenlabs_v3", label: "ElevenLabs V3 TTS", dot: "bg-purple-500", available: false },
  { id: "vibevoice", label: "VibeVoice TTS", dot: "bg-purple-500", available: false },
  { id: "elevenlabs_v2", label: "ElevenLabs TTS V2", dot: "bg-purple-500", available: false },
  { id: "minimax_tts", label: "MiniMax TTS", dot: "bg-red-500", available: false },
];

export default function MusicGenerator({ script, selectedDuration, book, savedMusicUrl, onMusicGenerated }) {
  const [selectedProvider, setSelectedProvider] = useState("minimax_music");
  const [generating, setGenerating] = useState(false);
  const [musicUrl, setMusicUrl] = useState(savedMusicUrl || null);
  const [error, setError] = useState(null);

  const musicMood = script?.versions?.[selectedDuration + "s"]?.music_mood;

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const prompt = `${musicMood || "cinematic and engaging"} background music for a book trailer titled "${book.title}". Genre: ${book.category || "general"}. The music should build emotionally and complement the narration.`;
      const response = await base44.functions.invoke('generatePromoMusic', {
        prompt,
        provider: selectedProvider,
        duration: selectedDuration,
        bookTitle: book.title,
      });

      if (response.data?.audioUrl) {
        setMusicUrl(response.data.audioUrl);
        if (onMusicGenerated) onMusicGenerated(response.data.audioUrl);
      } else {
        setError(response.data?.error || 'Failed to generate music');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const renderProvider = (p) => (
    <button
      key={p.id}
      onClick={() => p.available && setSelectedProvider(p.id)}
      disabled={!p.available}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
        selectedProvider === p.id
          ? "bg-purple-500/20 border border-purple-400 text-white"
          : p.available
            ? "bg-[#2b2a33] border border-transparent text-white/70 hover:bg-[#33323d]"
            : "bg-[#2b2a33] border border-transparent text-white/30 cursor-not-allowed"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
      {p.label}
      {!p.available && <span className="text-[10px] text-white/30 ml-0.5">soon</span>}
    </button>
  );

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${musicUrl ? "bg-emerald-500 text-white" : "bg-purple-500 text-white"}`}>
              {musicUrl ? <Check className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            </span>
            Background Music
          </CardTitle>
          <Button
            onClick={handleGenerate}
            disabled={generating || !musicMood}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            {generating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Composing…</> : <><Sparkles className="w-4 h-4 mr-1" />{musicUrl ? "Regenerate" : "Generate Music"}</>}
          </Button>
        </div>
        <p className="text-sm text-white/50 mt-1">AI-composed background music tailored to your trailer's mood — add it to your final video edit.</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {musicMood && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <Music className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Detected Mood</p>
              <p className="text-sm text-white/80">{musicMood}</p>
            </div>
          </div>
        )}

        {/* Provider selector — matching the reference design */}
        <div className="p-4 rounded-xl bg-[#1a1a1c] border border-white/10">
          <p className="text-sm font-medium text-[#4f86f7] mb-3">Music · Podcast · TTS — all in one</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {MUSIC_PROVIDERS.map(renderProvider)}
          </div>
          <div className="flex flex-wrap gap-2">
            {TTS_PROVIDERS.map(renderProvider)}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {musicUrl && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <audio controls className="w-full">
                <source src={musicUrl} type="audio/mpeg" />
              </audio>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(musicUrl, "_blank")}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" /> Download Music
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}