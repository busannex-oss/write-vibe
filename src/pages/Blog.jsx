import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BlogCard from "@/components/blog/BlogCard";
import NewsletterSignupForm from "@/components/blog/NewsletterSignupForm";
import BlogHero from "@/components/blog/BlogHero";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BloggerRoster from "@/components/blog/BloggerRoster";

export default function Blog() {
  const [activeTag, setActiveTag] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['blog-index'],
    queryFn: async () => (await base44.functions.invoke('blogPublic', {})).data,
    staleTime: 60000
  });

  const posts = data?.posts || [];
  const visible = activeTag ? posts.filter((p) => (p.tags || []).includes(activeTag)) : posts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <BlogHero />

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="mb-10">
            <NewsletterSignupForm />
          </div>

          {activeTag && (
            <p className="text-sm text-white/50 mb-5">
              Showing posts in <span className="text-amber-300">{activeTag}</span>
            </p>
          )}

          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : visible.length === 0 ? (
            <p className="text-white/40 py-12 text-center">
              {activeTag ? "No posts in this category yet." : "No posts published yet — check back soon."}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {visible.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          )}

          <BloggerRoster />
        </div>

        <BlogSidebar posts={posts} activeTag={activeTag} onSelectTag={setActiveTag} />
      </div>
    </div>
  );
}