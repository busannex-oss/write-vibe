import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import NewsletterSignupForm from "@/components/blog/NewsletterSignupForm";

export default function Blog() {
  const { data, isLoading } = useQuery({
    queryKey: ['blog-index'],
    queryFn: async () => (await base44.functions.invoke('blogPublic', {})).data,
    staleTime: 60000
  });

  const posts = data?.posts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <Link to={createPageUrl("Landing")} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-300">The Write Vibe Journal</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Stories, craft and the business of publishing</h1>
          <p className="text-white/50 mt-3 max-w-2xl">
            Practical writing and marketing lessons from authors building real audiences — plus behind-the-scenes looks at books in progress.
          </p>
        </div>

        <div className="mb-12">
          <NewsletterSignupForm />
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-white/40 py-12 text-center">No posts published yet — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}