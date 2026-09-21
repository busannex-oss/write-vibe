import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export default function BlogScheduleDayPanel({ date, posts, onChanged }) {
  const [savingId, setSavingId] = useState(null);

  const reschedule = async (post, value) => {
    if (!value) return;
    setSavingId(post.id);
    await base44.entities.BlogPost.update(post.id, { published_at: new Date(value).toISOString() });
    setSavingId(null);
    onChanged();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-amber-400" />
        <p className="text-white font-medium">{date ? format(date, "EEEE, MMM d, yyyy") : "Pick a day"}</p>
      </div>

      {!date ? (
        <p className="text-sm text-white/40">Select a day to see what's scheduled.</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-white/40">Nothing scheduled on this day.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-sm text-white/80">{p.title}</p>
                <Badge className={p.status === "published" ? "bg-emerald-500/15 text-emerald-300 border-0" : "bg-amber-500/15 text-amber-200 border-0"}>
                  {p.status}
                </Badge>
              </div>
              <p className="text-xs text-white/40">{p.author_name || "Unassigned"}</p>
              <div className="flex items-center gap-2">
                <Input
                  type="datetime-local"
                  defaultValue={format(new Date(p.published_at), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => (p._pending = e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  size="sm"
                  disabled={savingId === p.id}
                  onClick={() => reschedule(p, p._pending)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                >
                  {savingId === p.id ? "…" : "Move"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}