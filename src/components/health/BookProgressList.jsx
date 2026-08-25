import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CHECKS = [
  (b) => !!b.title && b.title !== "Untitled Book",
  (b) => (b.table_of_contents?.length || 0) > 0,
  (b) => !!b.book_summary,
  (b) => (b.manuscript_chapters?.length || 0) > 0,
  (b) => !!b.front_cover_url,
  (b) => !!b.formatted_manuscript,
  (b) => !!b.website_config?.status,
];

export function bookProgress(book) {
  const done = CHECKS.filter((c) => c(book)).length;
  return Math.round((done / CHECKS.length) * 100);
}

export default function BookProgressList({ books }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-amber-400" />
        Book Progress
      </h3>
      {books.length === 0 ? (
        <p className="text-sm text-white/40 py-4">No books yet — create your first book to see progress here.</p>
      ) : (
        <div className="space-y-3">
          {books.map((book) => {
            const pct = bookProgress(book);
            const chapters = book.manuscript_chapters || [];
            const finalized = chapters.filter((c) => c?.status === "finalized").length;
            return (
              <Link
                key={book.id}
                to={`/BookEditor?id=${book.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{book.title || "Untitled Book"}</span>
                    <Badge className="bg-white/8 text-white/40 border-0 text-[10px] capitalize shrink-0">
                      {(book.status || "draft").replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white/40 tabular-nums w-9 text-right">{pct}%</span>
                  </div>
                  {chapters.length > 0 && (
                    <p className="text-[11px] text-white/30 mt-1">
                      {finalized}/{chapters.length} chapters finalized
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}