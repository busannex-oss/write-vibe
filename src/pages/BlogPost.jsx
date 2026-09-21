import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import NewsletterSignupForm from "@/components/blog/NewsletterSignupForm";
import RelatedPostsCarousel from "@/components/blog/RelatedPostsCarousel";
import BlogHero from "@/components/blog/BlogHero";
import BlogSidebar from "@/components/blog/BlogSidebar";
import PostMeta from "@/components/blog/PostMeta";
import PostTagLinks from "@/components/blog/PostTagLinks";
import ShareButtons from "@/components/blog/ShareButtons";
import CommentSection from "@/components/blog/CommentSection";
import PostCoverImage from "@/components/blog/PostCoverImage";
import AuthorSignature from "@/components/blog/AuthorSignature";

export default function BlogPost() {
  const slug = new URLSearchParams(window.location.search).get("slug");

  const { data, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => (await base44.functions.invoke('blogPublic', { slug })).data,
    enabled: !!slug
  });

  const { data: index } = useQuery({
    queryKey: ['blog-index'],
    queryFn: async () => (await base44.functions.invoke('blogPublic', {})).data,
    staleTime: 60000
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
      <BlogHero />

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
        <article>
          <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> All posts
          </Link>

          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">{post.title}</h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <PostMeta post={post} />
            <ShareButtons title={post.title} excerpt={post.excerpt} />
          </div>

          {post.cover_image_url && (
            <div className="mt-8">
              <PostCoverImage src={post.cover_image_url} alt={post.title} ratio="banner" className="border border-white/10" />
            </div>
          )}

          <div className="prose prose-invert prose-amber article-body max-w-[68ch] mt-9 text-white/75">
            <ReactMarkdown>{post.content || post.excerpt || ""}</ReactMarkdown>
          </div>

          <AuthorSignature authorName={post.author_name} />

          <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <PostTagLinks tags={post.tags} />
              {post.published_at && (
                <span className="flex items-center gap-1.5 text-xs text-white/35">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Published {format(new Date(post.published_at), "MMMM d, yyyy")}
                </span>
              )}
            </div>
            <ShareButtons title={post.title} excerpt={post.excerpt} />
          </div>

          <div className="mt-12">
            <NewsletterSignupForm
              headline={post.cta_headline || "Enjoyed this? Get the next one in your inbox"}
              bookId={post.related_book_id}
            />
          </div>

          <RelatedPostsCarousel posts={data?.related || []} />

          <CommentSection post={post} />
        </article>

        <BlogSidebar posts={index?.posts || []} />
      </div>
    </div>
  );
}