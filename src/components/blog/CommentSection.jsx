import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import CommentList from "@/components/blog/CommentList";

export default function CommentSection({ post }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 60000
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['blog-comments', post.id],
    queryFn: () => base44.entities.BlogComment.filter({ post_id: post.id, status: "visible" }, 'created_date', 100)
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['blog-comments', post.id] });

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await base44.entities.BlogComment.create({
      post_id: post.id,
      post_slug: post.slug,
      author_email: user.email,
      author_name: user.full_name || user.email,
      author_photo_url: user.author_photo_url,
      content: text.trim()
    });
    setText("");
    setSaving(false);
    refresh();
  };

  const remove = async (c) => {
    await base44.entities.BlogComment.delete(c.id);
    refresh();
  };

  return (
    <section className="mt-14 pt-10 border-t border-white/5">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-4 h-4 text-amber-400" />
        <h2 className="text-lg font-bold text-white">
          Comments {comments.length > 0 && <span className="text-white/35 font-normal">({comments.length})</span>}
        </h2>
      </div>

      {user ? (
        <div className="mb-8">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add your thoughts…"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={submit}
              disabled={saving || !text.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
            >
              {saving ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/60">Sign in to join the conversation.</p>
          <p className="text-xs text-white/35 mt-1">Continue with Google, Facebook, LinkedIn or email.</p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
          >
            Sign in to comment
          </Button>
        </div>
      )}

      <CommentList comments={comments} user={user} onDelete={remove} />
    </section>
  );
}