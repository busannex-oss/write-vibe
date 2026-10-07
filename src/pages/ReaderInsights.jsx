import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, MessageSquare, Mail, Loader2, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subDays } from "date-fns";
import InsightStatCard from "@/components/insights/InsightStatCard";
import ViewsTrendChart from "@/components/insights/ViewsTrendChart";
import TrafficSourceList from "@/components/insights/TrafficSourceList";
import MilestoneAttentionTable from "@/components/insights/MilestoneAttentionTable";
import MilestoneTrafficChart from "@/components/insights/MilestoneTrafficChart";
import DraftFeedbackPanel from "@/components/insights/DraftFeedbackPanel";
import LandingPageTraffic from "@/components/insights/LandingPageTraffic";
import {
  buildViewTrend,
  buildSourceBreakdown,
  buildMilestoneAttention,
  buildMilestoneTrafficSeries,
  buildBookEngagement
} from "@/lib/insights";

export default function ReaderInsights() {
  const [scope, setScope] = useState("mine");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";
  const allScope = isAdmin && scope === "all";

  const { data, isLoading } = useQuery({
    queryKey: ["reader-insights", allScope, user?.email],
    enabled: !!user,
    queryFn: async () => {
      const [books, views, comments, reviews, subscribers, posts] = await Promise.all([
        base44.entities.Book.list("-created_date", 200),
        base44.entities.BookPageView.list("-created_date", 2000),
        base44.entities.BookComment.list("-created_date", 1000),
        base44.entities.Review.list("-created_date", 500),
        base44.entities.NewsletterSubscriber.list("-created_date", 1000),
        base44.entities.SocialPost.list("-created_date", 200)
      ]);
      const mine = (list, field = "created_by") =>
        allScope ? list : list.filter((r) => r[field] === user.email);
      const myBooks = mine(books);
      const bookIds = new Set(myBooks.map((b) => b.id));
      const scopeByBook = (list) => (allScope ? list : list.filter((r) => bookIds.has(r.book_id)));
      return {
        books: myBooks,
        views: allScope ? views : views.filter((v) => v.owner_email === user.email),
        comments: scopeByBook(comments),
        reviews: scopeByBook(reviews),
        subscribers: scopeByBook(subscribers),
        posts: scopeByBook(posts)
      };
    }
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  const { books, views, comments, reviews, subscribers, posts } = data;
  const recentViews = views.filter(
    (v) => new Date(v.viewed_at || v.created_date) >= subDays(new Date(), 30)
  );
  const uniqueVisitors = new Set(recentViews.map((v) => v.session_id).filter(Boolean)).size;
  const sources = buildSourceBreakdown(recentViews);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Reader Insights
          </h1>
          <p className="text-white/40 text-sm mt-1">
            How readers are engaging with your books, and which marketing milestones earned attention.
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={scope === "mine" ? "default" : "outline"}
              onClick={() => setScope("mine")}
              className={scope === "mine" ? "bg-amber-500 text-slate-950 hover:bg-amber-600" : "border-white/20 text-white/70"}
            >
              My books
            </Button>
            <Button
              size="sm"
              variant={scope === "all" ? "default" : "outline"}
              onClick={() => setScope("all")}
              className={scope === "all" ? "bg-amber-500 text-slate-950 hover:bg-amber-600" : "border-white/20 text-white/70"}
            >
              All authors
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InsightStatCard icon={Eye} label="Visits (30d)" value={recentViews.length} hint={`${views.length} all time`} />
        <InsightStatCard icon={Users} label="Unique readers" value={uniqueVisitors} hint="Last 30 days" accent="text-blue-400" />
        <InsightStatCard
          icon={MessageSquare}
          label="Draft comments"
          value={comments.length}
          hint={`${comments.filter((c) => c.status === "open").length} open`}
          accent="text-purple-400"
        />
        <InsightStatCard icon={Mail} label="Subscribers" value={subscribers.length} hint="Across all books" accent="text-emerald-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ViewsTrendChart data={buildViewTrend(recentViews)} />
        </div>
        <TrafficSourceList sources={sources} total={recentViews.length || 1} />
      </div>

      <LandingPageTraffic views={recentViews} />

      <MilestoneTrafficChart data={buildMilestoneTrafficSeries(views, books, posts)} />

      <MilestoneAttentionTable milestones={buildMilestoneAttention(posts, views, subscribers)} />

      <DraftFeedbackPanel books={buildBookEngagement(books, comments, reviews, views)} />

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/25">
        <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-200/80">
          Every number here comes from real activity in your app — visits to your published book pages, reviewer
          comments, reader reviews and newsletter signups. Visit history starts from today. Want richer traffic
          detail (devices, locations, search terms)? I can connect your Google Analytics account next.
        </p>
      </div>
    </div>
  );
}