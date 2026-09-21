import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PostCoverImage from "@/components/blog/PostCoverImage";

export default function BlogCard({ post }) {
  return (
    <Link
      to={createPageUrl(`BlogPost?slug=${post.slug}`)}
      className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-amber-500/40 transition-colors flex flex-col h-full"
    >
      <PostCoverImage src={post.cover_image_url} alt={post.title} rounded="rounded-none" zoomOnHover />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(post.tags || []).slice(0, 2).map((t) => (
            <Badge key={t} className="bg-amber-500/15 text-amber-300 border-0 text-[10px]">{t}</Badge>
          ))}
        </div>
        <h3 className="text-white font-semibold leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">{post.title}</h3>
        {post.excerpt && <p className="text-sm text-white/50 mt-2 line-clamp-3 flex-1">{post.excerpt}</p>}
        <p className="text-xs text-white/30 mt-3">
          {post.author_name ? `${post.author_name} · ` : ""}
          {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
        </p>
      </div>
    </Link>
  );
}