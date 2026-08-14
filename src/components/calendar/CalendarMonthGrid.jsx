import React from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, format } from "date-fns";
import { cn } from "@/lib/utils";
import { dayKey, EVENT_STYLES } from "@/lib/publishingTimeline";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonthGrid({ month, eventsByDay, selectedDay, onSelectDay }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/10">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-white/40">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = dayKey(day);
          const dayEvents = eventsByDay[key] || [];
          const outside = !isSameMonth(day, month);
          const selected = selectedDay === key;
          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={cn(
                "min-h-[92px] border-b border-r border-white/5 p-2 text-left align-top transition-colors",
                outside ? "bg-slate-950/40 text-white/25" : "hover:bg-white/5 text-white/70",
                selected && "bg-amber-500/10 ring-1 ring-inset ring-amber-500/40"
              )}
            >
              <span className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isToday(day) ? "bg-amber-500 text-slate-950" : "text-inherit"
              )}>
                {format(day, "d")}
              </span>
              <div className="mt-1.5 space-y-1">
                {dayEvents.slice(0, 2).map((e) => (
                  <div key={e.id} className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", EVENT_STYLES[e.type].dot)} />
                    <span className="truncate text-[11px] text-white/60">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[11px] text-white/40">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}