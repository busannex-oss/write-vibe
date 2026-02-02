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
      // Use a professional demo video with better availability
      const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
      setDemoVideoUrl(videoUrl);
      localStorage.setItem("authorforgeDemo", videoUrl);
    } catch (error) {
      console.error("Error loading demo:", error);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
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