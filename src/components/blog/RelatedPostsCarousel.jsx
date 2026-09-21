import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";

export default function RelatedPostsCarousel({ posts = [], title = "Keep reading" }) {
  const trackRef = useRef(null);

  if (!posts.length) return null;

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="mt-14">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => scrollBy(-1)} className="text-white/50 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => scrollBy(1)} className="text-white/50 hover:text-white hover:bg-white/10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div ref={trackRef} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
        {posts.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[85%] sm:w-[48%]">
            <BlogCard post={p} />
          </div>
        ))}
      </div>
    </div>
  );
}