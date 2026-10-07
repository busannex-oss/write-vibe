import React from "react";
import { BLOG_AUTHORS } from "@/lib/blogAuthors";
import BloggerCard from "@/components/blog/BloggerCard";

export default function BloggerRoster() {
  return (
    <section>
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/70">Our writers</p>
        <h2 className="text-lg font-bold text-white mt-1">Six voices, six very different opinions</h2>
      </div>
      <div className="grid gap-4">
        {BLOG_AUTHORS.map((a) => <BloggerCard key={a.id} author={a} />)}
      </div>
    </section>
  );
}