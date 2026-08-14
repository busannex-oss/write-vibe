import React from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { EVENT_STYLES } from "@/lib/publishingTimeline";

export default function DayEventList({ selectedDay, events }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-semibold text-white">
        {selectedDay ? format(parseISO(selectedDay), "EEEE, MMMM d, yyyy") : "Select a day"}
      </h3>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-white/40">Nothing scheduled for this day.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", EVENT_STYLES[e.type].dot)} />
              <div className="min-w-0">
                <p className="text-sm text-white/85">{e.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide", EVENT_STYLES[e.type].chip)}>
                    {EVENT_STYLES[e.type].label}
                  </span>
                  {e.meta && <span className="truncate text-xs text-white/40">{e.meta}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}