import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import PostCoverImage from "@/components/blog/PostCoverImage";

export default function FeaturedPost({ post }) {
  return (
    <Link
      to={createPageUrl(`BlogPost?slug=${post.slug}`)}
      className="group block rounded-2xl overflow-hidden border border-amber-500/30 bg-white/5 hover:border-amber-500/60 transition-colors mb-8"
    >
      <PostCoverImage src={post.cover_image_url} alt={post.title} rounded="rounded-none" zoomOnHover />
      <div className="p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">Featured</p>
        <h2 className="text-2xl font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">{post.title}</h2>
        {post.excerpt && <p className="text-white/60 mt-3 line-clamp-3">{post.excerpt}</p>}
        <p className="text-xs text-white/30 mt-4">
          {post.author_name ? `${post.author_name} · ` : ""}
          {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
        </p>
      </div>
    </Link>
  );
}