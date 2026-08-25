import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PenLine, CheckCircle2 } from "lucide-react";
import { format, isSameMonth } from "date-fns";

const DAILY_GOAL = 1000;
const STORAGE_KEY = "wv_daily_word_baseline";

// Records the day's starting word count once per day so we can show today's delta.
function getTodayBaseline(totalWords) {
  const today = format(new Date(), "yyyy-MM-dd");
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.date === today) return saved.words;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, words: totalWords }));
  } catch {
    return totalWords;
  }
  return totalWords;
}

export default function WritingProgressWidget({ books = [] }) {
  const { wordsToday, finalizedThisMonth } = useMemo(() => {
    const now = new Date();
    let totalWords = 0;
    let finalized = 0;

    books.forEach((book) => {
      const chapters = book.manuscript_chapters || [];
      chapters.forEach((ch) => {
        totalWords += ch?.word_count || 0;
      });
      if (book.updated_date && isSameMonth(new Date(book.updated_date), now)) {
        finalized += chapters.filter((ch) => ch?.status === "finalized").length;
      }
    });

    const baseline = getTodayBaseline(totalWords);
    return {
      wordsToday: Math.max(0, totalWords - baseline),
      finalizedThisMonth: finalized,
    };
  }, [books]);

  const pct = Math.min(100, Math.round((wordsToday / DAILY_GOAL) * 100));

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <PenLine className="w-4 h-4 text-amber-400" />
          Writing Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">Words Today</span>
            <span className="text-xs text-white/40 tabular-nums">{pct}% of {DAILY_GOAL.toLocaleString()}</span>
          </div>
          <div className="text-3xl font-bold text-white leading-none">{wordsToday.toLocaleString()}</div>
          <Progress value={pct} className="h-1.5 mt-3 bg-white/10" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white leading-none">{finalizedThisMonth}</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-white/40 mt-1">
              Chapters finalized in {format(new Date(), "MMMM")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}