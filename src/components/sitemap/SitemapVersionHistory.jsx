import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const invoke = (action, extra = {}) => base44.functions.invoke("sitemap", { action, ...extra });

export default function SitemapVersionHistory({ onBack, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await invoke("versions");
      setVersions(res.data.versions || []);
      setLoading(false);
    })();
  }, []);

  const handleRestore = async (id) => {
    setRestoring(id);
    await onRestore(id);
    setRestoring(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-white font-bold text-sm">Platform Sitemap · Version History</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-white/30 text-center py-32">No versions saved yet.</p>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "flex items-center justify-between gap-4 p-5 rounded-xl border transition-all",
                  v.is_current
                    ? "bg-amber-500/8 border-amber-500/25"
                    : "bg-white/[0.02] border-white/6 hover:border-white/12"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold",
                    v.is_current ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/40"
                  )}>
                    v{v.version_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">Version {v.version_number}</p>
                      {v.is_current && (
                        <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-white/20" />
                      <p className="text-white/30 text-xs">
                        {v.generated_at ? new Date(v.generated_at).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                    {v.generation_notes && (
                      <p className="text-white/25 text-xs mt-0.5">{v.generation_notes}</p>
                    )}
                  </div>
                </div>

                {!v.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(v.id)}
                    disabled={restoring === v.id}
                  >
                    {restoring === v.id
                      ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      : <RotateCcw className="w-3 h-3 mr-1" />}
                    Restore
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}