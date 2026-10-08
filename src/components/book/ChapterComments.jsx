import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import CommentThread from "./CommentThread";

export default function ChapterComments({ book, chapterNumber, chapterTitle, chapterContent, onRevised }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const queryKey = ["chapterComments", book.id, chapterNumber];

  const { data: comments = [] } = useQuery({
    queryKey,
    queryFn: () =>
      base44.entities.BookComment.filter(
        { book_id: book.id, target_type: "chapter", chapter_number: chapterNumber },
        "-created_date"
      ),
  });

  const addMutation = useMutation({
    mutationFn: async (content) => {
      const user = await base44.auth.me();
      // Share the comment with the book owner and every invited team member
      const visibleTo = Array.from(new Set([
        book.created_by,
        ...(book.collaborator_emails || []),
        user.email
      ].filter(Boolean)));
      return base44.entities.BookComment.create({
        book_id: book.id,
        target_type: "chapter",
        chapter_number: chapterNumber,
        visible_to: visibleTo,
        author_email: user.email,
        author_name: user.full_name,
        content,
        status: "open",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const resolveMutation = useMutation({
    mutationFn: (c) =>
      base44.entities.BookComment.update(c.id, {
        status: c.status === "open" ? "addressed" : "open",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const openComments = comments.filter((c) => c.status === "open");

  const processFeedback = async () => {
    setProcessing(true);
    try {
      const feedbackList = openComments
        .map((c, i) => `${i + 1}. ${c.author_name || c.author_email}: ${c.content}`)
        .join("\n");

      const response = await ai.InvokeLLM({
        prompt: `You are a professional book editor revising a chapter based on editorial feedback.

Book: "${book.title}" (${book.category || "General"})
Chapter ${chapterNumber}: ${chapterTitle}

EDITORIAL FEEDBACK TO ADDRESS:
${feedbackList}

CURRENT CHAPTER CONTENT:
${chapterContent}

Revise the chapter to fully address every piece of feedback while preserving the author's voice, style, plot, and overall length. Only change what the feedback requires. Return the complete revised chapter text.`,
        response_json_schema: {
          type: "object",
          properties: { revised_content: { type: "string" } },
        },
      });

      if (response.revised_content) {
        onRevised(response.revised_content);
        await Promise.all(
          openComments.map((c) =>
            base44.entities.BookComment.update(c.id, { status: "addressed" })
          )
        );
        queryClient.invalidateQueries({ queryKey });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
      <CommentThread
        comments={comments}
        onAdd={(text) => addMutation.mutate(text)}
        onResolve={(c) => resolveMutation.mutate(c)}
        isAdding={addMutation.isPending}
        canComment={true}
      />
      <div className="px-3 pb-3">
        <Button
          onClick={processFeedback}
          disabled={processing || openComments.length === 0 || !chapterContent}
          size="sm"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          {processing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              AI is revising the chapter…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Process Feedback with AI ({openComments.length} open)
            </>
          )}
        </Button>
        {!chapterContent && (
          <p className="text-xs text-white/30 mt-2 text-center">
            Write the chapter first, then AI can apply the feedback
          </p>
        )}
      </div>
    </div>
  );
}