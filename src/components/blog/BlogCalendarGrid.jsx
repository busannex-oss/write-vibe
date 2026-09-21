import React from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BlogCalendarGrid({ month, posts, selectedDate, onSelectDate }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month))
  });

  const postsOn = (day) =>
    posts.filter((p) => p.published_at && isSameDay(new Date(p.published_at), day));

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-wider text-white/30 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayPosts = postsOn(day);
          const inMonth = isSameMonth(day, month);
          const selected = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[76px] rounded-lg border p-1.5 text-left transition-colors",
                inMonth ? "border-white/10 bg-white/[0.03]" : "border-transparent bg-transparent opacity-40",
                selected && "border-amber-500/60 bg-amber-500/10"
              )}
            >
              <span className="text-[11px] text-white/50">{format(day, "d")}</span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 2).map((p) => (
                  <p
                    key={p.id}
                    className={cn(
                      "truncate text-[10px] px-1 py-0.5 rounded",
                      p.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"
                    )}
                  >
                    {p.title}
                  </p>
                ))}
                {dayPosts.length > 2 && (
                  <p className="text-[10px] text-white/40 px-1">+{dayPosts.length - 2} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}