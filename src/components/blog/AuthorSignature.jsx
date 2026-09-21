import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getBlogAuthor } from "@/lib/blogAuthors";

// Each blogger signs off their posts in their own voice.
export default function AuthorSignature({ authorName }) {
  const author = getBlogAuthor(authorName);
  if (!author?.signature) return null;

  return (
    <div className="mt-10 max-w-[68ch] rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
      <p className="text-sm text-white/55 italic leading-relaxed">{author.signature.sign_off}</p>
      <p className="mt-3 text-2xl text-amber-300/90 font-serif italic tracking-wide">{author.signature.signed}</p>
      <div className="mt-2 flex items-center gap-3">
        {author.portrait && (
          <img src={author.portrait} alt={author.name} loading="lazy" className="w-8 h-8 rounded-full object-cover" />
        )}
        <Link
          to={createPageUrl(`BlogAuthor?name=${encodeURIComponent(author.name)}`)}
          className="text-xs text-white/40 hover:text-amber-300 transition-colors"
        >
          {author.name} · {author.title}
        </Link>
      </div>
    </div>
  );
}