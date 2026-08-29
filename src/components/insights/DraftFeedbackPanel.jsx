import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Star } from "lucide-react";

export default function DraftFeedbackPanel({ books }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm">Engagement with your drafts</CardTitle>
        <CardDescription className="text-white/40 text-xs">
          Reviewer comments on chapters and reader ratings, per book.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {books.length === 0 ? (
          <p className="text-white/40 text-sm py-6 text-center">No books yet</p>
        ) : (
          books.map((b) => (
            <div key={b.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{b.title}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {b.chaptersWithFeedback} of {b.chapterCount || 0} chapters have feedback
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  <span className="flex items-center gap-1 text-purple-300">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {b.commentCount}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5" />
                    {b.avgRating ? b.avgRating.toFixed(1) : "—"}
                  </span>
                  <span className="text-white/50">{b.views} visits</span>
                </div>
              </div>
              {b.openComments > 0 && (
                <p className="text-xs text-amber-400/70 mt-2">{b.openComments} comments still open</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}