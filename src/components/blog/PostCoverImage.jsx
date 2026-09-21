import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// Single source of truth for blog cover imagery — every template uses the same
// 16:9 frame so covers stay consistent no matter the source image dimensions.
const RATIOS = {
  wide: "aspect-[16/9]",
  banner: "aspect-[21/9]",
  thumb: "aspect-[4/3]"
};

export default function PostCoverImage({ src, alt = "", ratio = "wide", rounded = "rounded-2xl", className, zoomOnHover = false }) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-slate-800", RATIOS[ratio], rounded, className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            zoomOnHover && "transition-transform duration-500 group-hover:scale-105"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-white/20" />
        </div>
      )}
    </div>
  );
}