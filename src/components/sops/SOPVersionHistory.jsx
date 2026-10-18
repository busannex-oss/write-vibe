import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SOPVersionHistory({ sop, onRefresh }) {
  const [busy, setBusy] = useState(null);
  const versions = [...(sop.version_history || [])].reverse();

  const restore = async (version) => {
    setBusy(version);
    await base44.functions.invoke("sops", { action: "restore", id: sop.id, version });
    setBusy(null);
    onRefresh?.();
  };

  return (
    <Card className="bg-slate-900 border-white/10">
      <CardHeader className="pb-3"><CardTitle className="text-white text-base">Version History</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-amber-400">v{sop.version} — current</p>
        {versions.length === 0 && <p className="text-white/40 text-sm">No earlier versions yet. Editing this SOP saves the current version here.</p>}
        {versions.map((v) => (
          <div key={`${v.version}-${v.saved_at}`} className="flex items-center justify-between gap-3 border-t border-white/5 pt-2">
            <div className="text-sm min-w-0">
              <p className="text-white">v{v.version} <span className="text-white/40">· {v.status}</span></p>
              {v.change_note && <p className="text-white/60 truncate">{v.change_note}</p>}
              <p className="text-white/30 text-xs">{v.saved_by} · {v.saved_at && format(new Date(v.saved_at), "MMM d, yyyy h:mm a")}</p>
            </div>
            <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => restore(v.version)}>
              {busy === v.version ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}Restore
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}