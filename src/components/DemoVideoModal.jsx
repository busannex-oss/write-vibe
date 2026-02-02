import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, X, Play } from "lucide-react";

export default function DemoVideoModal({ isOpen, onClose }) {
  const [demoVideoUrl, setDemoVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrGenerateDemoVideo();
    }
  }, [isOpen]);

  const generateDemoVideo = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a professional 90-second product demo video script and concept for AuthorForge, an AI-powered book creation platform.

Features to showcase:
1. AI Character Creation - showing character profiles with visuals
2. Smart Outlining - demonstrating chapter-by-chapter outline generation
3. AI Manuscript Writing - showing manuscript being generated with text
4. Cover Design - displaying beautiful AI-generated book covers
5. Video Commercials - showing professional book trailers
6. Book Websites - instant landing pages for book marketing
7. Team Collaboration - inviting editors and publishers
8. Analytics & Insights - showing book performance metrics

Requirements:
- Professional, cinematic presentation
- Show UI mockups/screenshots of the platform
- Include before/after transformations
- Motivational but professional tone
- Call to action at the end
- Smooth transitions between scenes
- High production quality
- Suitable for landing page

Provide a detailed production plan for a professional AI-generated demo video.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            video_concept: { type: "string" },
            production_quality: { type: "string" },
            duration: { type: "string" }
          }
        }
      });

      // In production, this would integrate with a video generation service like Synthesia, Pictory, or Runway
      // For now, we'll use a professional placeholder video
      const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4";
      setDemoVideoUrl(videoUrl);

      // Save to localStorage for persistence
      localStorage.setItem("authorforgeDemo", videoUrl);
    } catch (error) {
      console.error("Error generating demo:", error);
    }
    setGenerating(false);
    setLoading(false);
  };

  const loadOrGenerateDemoVideo = async () => {
    const cached = localStorage.getItem("authorforgeDemo");
    if (cached) {
      setDemoVideoUrl(cached);
      setLoading(false);
    } else {
      await generateDemoVideo();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-400" />
              AuthorForge Demo
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Video Container */}
          <div className="bg-black">
            {loading && generating ? (
              <div className="aspect-video flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                <p className="text-white/60">Generating professional demo video...</p>
              </div>
            ) : demoVideoUrl ? (
              <video
                controls
                autoPlay
                className="w-full aspect-video"
                poster="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&h=800&fit=crop&q=80"
              >
                <source src={demoVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <p className="text-white/60">Unable to load demo video</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/2">
            <p className="text-sm text-white/60 mb-4">
              Get a comprehensive walkthrough of AuthorForge's AI-powered book creation features.
            </p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 w-full"
            >
              Got It, Let's Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}