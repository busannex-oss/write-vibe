import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

export default function CommentList({ comments, user, onDelete }) {
  if (comments.length === 0) {
    return <p className="text-sm text-white/40">No comments yet — be the first to respond.</p>;
  }

  return (
    <div className="space-y-5">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
            {c.author_photo_url ? (
              <img src={c.author_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-white/50">{(c.author_name || "?").charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-white/80 font-medium">{c.author_name || "Reader"}</p>
              <span className="text-[11px] text-white/30">
                {formatDistanceToNow(new Date(c.created_date), { addSuffix: true })}
              </span>
              {(user?.role === "admin" || user?.email === c.author_email) && (
                <button onClick={() => onDelete(c)} className="ml-auto text-white/25 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm text-white/60 mt-1 whitespace-pre-wrap">{c.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}