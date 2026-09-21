import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { getBlogAuthor } from "@/lib/blogAuthors";

export default function PostMeta({ post }) {
  const author = getBlogAuthor(post.author_name);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {author && (
        <img src={author.portrait} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
      )}
      <div className="text-sm">
        {post.author_name && (
          author ? (
            <Link
              to={`${createPageUrl("BlogAuthor")}?id=${author.id}`}
              className="text-amber-300 hover:text-amber-200 font-medium"
            >
              {post.author_name}
            </Link>
          ) : (
            <span className="text-white/70 font-medium">{post.author_name}</span>
          )
        )}
        {author && <p className="text-xs text-white/35">{author.title}</p>}
      </div>
      {post.published_at && (
        <span className="flex items-center gap-1.5 text-xs text-white/35">
          <CalendarDays className="w-3.5 h-3.5" />
          {format(new Date(post.published_at), "MMMM d, yyyy")}
        </span>
      )}
    </div>
  );
}