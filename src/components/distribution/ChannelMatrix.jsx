import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe2, Upload, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  not_ready: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  ready: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  awaiting_approval: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  submitted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  under_review: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  live: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  update_pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  action_required: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  suspended: "bg-red-500/20 text-red-300 border-red-500/30",
  retired: "bg-slate-500/20 text-slate-300 border-slate-500/30"
};

const PROVIDER_TAGS = {
  amazon_kdp: "Amazon", amazon_acx: "Amazon", publishdrive: "Distribution", lulu: "Print", direct: "Direct"
};

export default function ChannelMatrix({ channels = [], publishing, onSubmit }) {
  if (!channels.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/8">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-amber-400" /> Distribution Channels
        </h2>
        <p className="text-white/30 text-xs mt-1">All channels are managed here — providers are handled behind the scenes.</p>
      </div>
      <div className="divide-y divide-white/5">
        {channels.map((ch) => {
          const isAmazon = ch.provider === "amazon_kdp" || ch.provider === "amazon_acx";
          const statusLabel = ch.status.replace(/_/g, " ");
          return (
            <div key={ch.channel} className="px-4 py-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <p className="text-sm text-white font-medium">{ch.label}</p>
                <p className="text-[11px] text-white/30 capitalize">
                  {PROVIDER_TAGS[ch.provider]} · {ch.formats.join(", ").replace(/_/g, " ")}
                </p>
                {ch.required_action && (
                  <p className="text-[11px] text-orange-300/80 mt-1">{ch.required_action}</p>
                )}
              </div>
              <Badge className={cn("text-xs capitalize", STATUS_STYLES[ch.status] || STATUS_STYLES.not_ready)}>
                {statusLabel}
              </Badge>
              {ch.retailer_url && (
                <a href={ch.retailer_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {isAmazon ? (
                <span className="text-[11px] text-white/25">Managed above</span>
              ) : (
                <Button
                  size="sm" variant="outline" className="text-xs h-7"
                  disabled={publishing === ch.channel || ch.status === "live"}
                  onClick={() => onSubmit(ch.channel, ch.formats[0])}
                >
                  {publishing === ch.channel
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <><Upload className="w-3 h-3 mr-1" /> {ch.status === "not_ready" ? "Submit" : "Re-Submit"}</>}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}