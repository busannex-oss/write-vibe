import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addMonths, subMonths, format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import BlogCalendarGrid from "@/components/blog/BlogCalendarGrid";
import BlogScheduleDayPanel from "@/components/blog/BlogScheduleDayPanel";

export default function BlogCalendar() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [author, setAuthor] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 200)
  });

  const authors = Array.from(new Set(posts.map((p) => p.author_name).filter(Boolean)));
  const filtered = author === "all" ? posts : posts.filter((p) => p.author_name === author);
  const dayPosts = selectedDate
    ? filtered.filter((p) => p.published_at && isSameDay(new Date(p.published_at), selectedDate))
    : [];

  const refresh = () => qc.invalidateQueries({ queryKey: ['blog-posts-admin'] });

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <Link to={createPageUrl("BlogManager")} className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Blog
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Publishing Calendar</h1>
          <p className="text-white/50 mt-1">See what each writer is publishing and move dates around.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))} className="text-white/60 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium w-36 text-center">{format(month, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))} className="text-white/60 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setAuthor("all")}
          className={author === "all" ? "px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300" : "px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 hover:text-white"}
        >
          All writers
        </button>
        {authors.map((a) => (
          <button
            key={a}
            onClick={() => setAuthor(a)}
            className={author === a ? "px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300" : "px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 hover:text-white"}
          >
            {a}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <BlogCalendarGrid month={month} posts={filtered} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <BlogScheduleDayPanel date={selectedDate} posts={dayPosts} onChanged={refresh} />
        </div>
      )}
    </div>
  );
}