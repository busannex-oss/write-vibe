import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import moment from "moment";

export default function OverrideRow({ title, subtitle, status, since, onApprove, onReject }) {
  const [busy, setBusy] = useState(null);
  const run = async (kind, fn) => { setBusy(kind); await fn(); setBusy(null); };
  const days = moment().diff(moment(since), "days");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/50">
          <Badge variant="outline" className="text-amber-400 border-amber-400/30">{status}</Badge>
          {subtitle && <span>{subtitle}</span>}
          <span className={days >= 3 ? "text-red-400" : ""}>Pending {days === 0 ? "today" : `${days}d`}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={!!busy} onClick={() => run("approve", onApprove)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
          {busy === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}Force approve
        </Button>
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run("reject", onReject)} className="border-white/20">
          {busy === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}Reject
        </Button>
      </div>
    </div>
  );
}