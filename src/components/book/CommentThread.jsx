import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function CommentThread({ comments, onAdd, onResolve, isAdding, canComment }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <MessageSquare className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Comments</h3>
        <span className="text-xs text-white/40">({comments.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {comments.length === 0 ? (
          <p className="text-sm text-white/30 italic text-center py-8">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-medium text-white shrink-0">
                    {(c.author_name || c.author_email || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-white truncate">{c.author_name || c.author_email}</span>
                </div>
                <span className="text-xs text-white/30 whitespace-nowrap">{fmtDate(c.created_date)}</span>
              </div>
              <p className="text-sm text-white/80 whitespace-pre-wrap break-words">{c.content}</p>
              {onResolve && (
                <button
                  onClick={() => onResolve(c)}
                  className={cn(
                    "mt-2 flex items-center gap-1 text-xs transition-colors",
                    c.status === "open" ? "text-white/40 hover:text-amber-300" : "text-emerald-400"
                  )}
                >
                  {c.status === "open" ? <Circle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {c.status === "open" ? "Mark addressed" : "Addressed"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {canComment && (
        <div className="p-3 border-t border-white/10 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="bg-white/5 border-white/10 text-white text-sm resize-none"
            rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
          />
          <Button size="sm" onClick={submit} disabled={isAdding || !text.trim()} className="w-full">
            <Send className="w-3.5 h-3.5" />
            {isAdding ? "Posting…" : "Post comment"}
          </Button>
        </div>
      )}
    </div>
  );
}