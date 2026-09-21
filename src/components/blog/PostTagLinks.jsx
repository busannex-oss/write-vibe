import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tag } from "lucide-react";

export default function PostTagLinks({ tags = [] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tag className="w-3.5 h-3.5 text-white/30" />
      {tags.map((t) => (
        <Link
          key={t}
          to={`${createPageUrl("BlogTag")}?tag=${encodeURIComponent(t)}`}
          className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] hover:bg-amber-500/25 transition-colors"
        >
          {t}
        </Link>
      ))}
    </div>
  );
}