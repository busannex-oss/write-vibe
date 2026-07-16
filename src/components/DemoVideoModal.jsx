import React from "react";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";

const DEMO_VIDEO_URL = "https://media.base44.com/videos/public/6975e45ac14c500ed1fcdcf2/75c58033e_Demo_Video.mp4";

export default function DemoVideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-400" />
              Write Vibe Demo
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
            <video
              src={DEMO_VIDEO_URL}
              controls
              autoPlay
              playsInline
              className="w-full aspect-video"
              aria-label="Write Vibe product demo — AI-powered book creation walkthrough"
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/2">
            <p className="text-sm text-white/60 mb-4">
              Get a comprehensive walkthrough of Write Vibe's AI-powered book creation features.
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