import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { addMonths, subMonths, format, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CalendarMonthGrid from "@/components/calendar/CalendarMonthGrid";
import DayEventList from "@/components/calendar/DayEventList";
import { buildTimelineEvents, groupByDay, dayKey, EVENT_STYLES } from "@/lib/publishingTimeline";

export default function PublishingCalendar() {
  const [month, setMonth] = useState(startOfToday());
  const [selectedDay, setSelectedDay] = useState(dayKey(startOfToday()));

  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: () => base44.entities.Book.list("-updated_date", 200),
  });
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["socialPosts"],
    queryFn: () => base44.entities.SocialPost.list("-created_date", 300),
  });

  const events = useMemo(() => buildTimelineEvents(books, posts), [books, posts]);
  const eventsByDay = useMemo(() => groupByDay(events), [events]);
  const dayEvents = eventsByDay[selectedDay] || [];
  const loading = loadingBooks || loadingPosts;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <CalendarDays className="h-6 w-6 text-amber-400" />
            Publishing Calendar
          </h1>
          <p className="mt-1 text-sm text-white/50">Book milestones and social posting schedule in one timeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))} className="text-white/60 hover:text-white hover:bg-white/10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-40 text-center text-sm font-medium text-white">{format(month, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))} className="text-white/60 hover:text-white hover:bg-white/10">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setMonth(startOfToday())} className="ml-2 border-white/10 text-white/70 hover:text-white">
            Today
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {Object.entries(EVENT_STYLES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-white/50">
            <span className={cn("h-2 w-2 rounded-full", style.dot)} />
            {style.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <CalendarMonthGrid
            month={month}
            eventsByDay={eventsByDay}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          <DayEventList selectedDay={selectedDay} events={dayEvents} />
        </div>
      )}
    </div>
  );
}