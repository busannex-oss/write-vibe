import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Activity, BookOpen, Milestone, Megaphone, CheckCircle2 } from "lucide-react";
import HealthStatCard from "@/components/health/HealthStatCard";
import BookProgressList, { bookProgress } from "@/components/health/BookProgressList";
import MilestoneSummary from "@/components/health/MilestoneSummary";
import MarketingStatus from "@/components/health/MarketingStatus";

export default function PlatformHealth() {
  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["health-books"],
    queryFn: () => base44.entities.Book.list("-updated_date", 50),
  });
  const { data: milestones = [], isLoading: loadingMilestones } = useQuery({
    queryKey: ["health-milestones"],
    queryFn: () => base44.entities.CharacterMilestone.list("-updated_date", 200),
  });
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["health-posts"],
    queryFn: () => base44.entities.SocialPost.list("-updated_date", 100),
  });

  if (loadingBooks || loadingMilestones || loadingPosts) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const bookIds = new Set(books.map((b) => b.id));
  const myMilestones = milestones.filter((m) => bookIds.has(m.book_id));
  const completedMilestones = myMilestones.filter((m) => m.completed).length;
  const published = books.filter((b) => b.status === "published").length;
  const queued = posts.filter((p) => p.status === "queued").length;
  const avgProgress = books.length
    ? Math.round(books.reduce((sum, b) => sum + bookProgress(b), 0) / books.length)
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-amber-400" />
          Platform Health
        </h1>
        <p className="text-white/40 text-sm mt-1">
          A live overview of your books, character milestones, and marketing activity
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthStatCard
          icon={BookOpen}
          label="Books in Production"
          value={books.length}
          sub={`${avgProgress}% average progress`}
          tone="amber"
        />
        <HealthStatCard
          icon={CheckCircle2}
          label="Published"
          value={published}
          sub={books.length ? `of ${books.length} books` : undefined}
          tone="emerald"
        />
        <HealthStatCard
          icon={Milestone}
          label="Milestones Complete"
          value={`${completedMilestones}/${myMilestones.length}`}
          sub="character arcs"
          tone="purple"
        />
        <HealthStatCard
          icon={Megaphone}
          label="Marketing Queue"
          value={queued}
          sub={`${posts.length} posts total`}
          tone="sky"
        />
      </div>

      <BookProgressList books={books} />

      <div className="grid md:grid-cols-2 gap-6">
        <MilestoneSummary milestones={myMilestones} books={books} />
        <MarketingStatus posts={posts} />
      </div>
    </div>
  );
}