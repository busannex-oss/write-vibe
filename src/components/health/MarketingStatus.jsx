import React from "react";
import { Megaphone } from "lucide-react";

const STATUS_STYLES = {
  queued: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  posted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function MarketingStatus({ posts }) {
  const counts = posts.reduce((acc, p) => {
    acc[p.status || "queued"] = (acc[p.status || "queued"] || 0) + 1;
    return acc;
  }, {});
  const recent = posts.slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-sky-400" />
          Marketing Activity
        </h3>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-400 border-sky-500/20">{counts.queued || 0} queued</span>
          <span className="px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{counts.posted || 0} posted</span>
        </div>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-white/40 py-4">No social posts yet — generate marketing content from any book.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((post) => (
            <div key={post.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-medium capitalize shrink-0 mt-0.5 ${
                  STATUS_STYLES[post.status] || STATUS_STYLES.queued
                }`}
              >
                {post.status || "queued"}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white/80 line-clamp-2">{post.caption}</p>
                <p className="text-[11px] text-white/30 mt-0.5 capitalize">{(post.platforms || []).join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}