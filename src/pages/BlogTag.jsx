import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Tag } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import BlogSidebar from "@/components/blog/BlogSidebar";

export default function BlogTag() {
  const tag = new URLSearchParams(window.location.search).get("tag");

  const { data, isLoading } = useQuery({
    queryKey: ['blog-index'],
    queryFn: async () => (await base44.functions.invoke('blogPublic', {})).data,
    staleTime: 60000
  });

  const posts = data?.posts || [];
  const visible = posts.filter((p) => (p.tags || []).includes(tag));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> The Journal
          </Link>

          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-400/70">
            <Tag className="w-3.5 h-3.5" /> Category
          </p>
          <h1 className="text-3xl font-bold text-white mt-1">{tag}</h1>
          <p className="text-white/50 text-sm mt-2">
            {visible.length} {visible.length === 1 ? "article" : "articles"} in this category.
          </p>

          <div className="mt-8">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : visible.length === 0 ? (
              <p className="text-white/40 py-12 text-center">No published articles in this category yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {visible.map((p) => <BlogCard key={p.id} post={p} />)}
              </div>
            )}
          </div>
        </div>

        <BlogSidebar posts={posts} activeTag={tag} />
      </div>
    </div>
  );
}