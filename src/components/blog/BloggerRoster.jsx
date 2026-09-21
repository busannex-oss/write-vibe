import React from "react";
import { BLOG_AUTHORS } from "@/lib/blogAuthors";
import BloggerCard from "@/components/blog/BloggerCard";

export default function BloggerRoster() {
  return (
    <section className="mt-16 pt-10 border-t border-white/5">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/70">Our writers</p>
        <h2 className="text-2xl font-bold text-white mt-1">Six voices, six very different opinions</h2>
        <p className="text-white/50 text-sm mt-2 max-w-2xl">
          Every piece on this journal comes from a writer with a real point of view, a specific beat,
          and a track record worth arguing with.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {BLOG_AUTHORS.map((a) => <BloggerCard key={a.id} author={a} />)}
      </div>
    </section>
  );
}