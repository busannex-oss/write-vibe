import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import NewsletterSignupForm from "@/components/blog/NewsletterSignupForm";
import BlogCard from "@/components/blog/BlogCard";

export default function BlogPost() {
  const slug = new URLSearchParams(window.location.search).get("slug");

  const { data, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => (await base44.functions.invoke('blogPublic', { slug })).data,
    enabled: !!slug
  });

  const post = data?.post;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">That post isn't available.</p>
        <Link to={createPageUrl("Blog")} className="text-amber-300 hover:text-amber-200">Back to the blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> All posts
        </Link>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {(post.tags || []).map((t) => (
            <Badge key={t} className="bg-amber-500/15 text-amber-300 border-0 text-[10px]">{t}</Badge>
          ))}
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">{post.title}</h1>
        <p className="text-sm text-white/35 mt-3">
          {post.author_name ? `${post.author_name} · ` : ""}
          {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : ""}
        </p>

        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl mt-8 border border-white/10" />
        )}

        <div className="prose prose-invert prose-amber max-w-none mt-8 text-white/80">
          <ReactMarkdown>{post.content || post.excerpt || ""}</ReactMarkdown>
        </div>

        <div className="mt-12">
          <NewsletterSignupForm
            headline={post.cta_headline || "Enjoyed this? Get the next one in your inbox"}
            bookId={post.related_book_id}
          />
        </div>

        {data?.related?.length > 0 && (
          <div className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Keep reading</p>
            <div className="grid sm:grid-cols-3 gap-5">
              {data.related.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}