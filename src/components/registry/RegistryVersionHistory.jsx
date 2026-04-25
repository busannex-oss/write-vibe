import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Loader2, History } from "lucide-react";
import { cn } from "@/lib/utils";

const invoke = (action, extra = {}) => base44.functions.invoke("masterRegistry", { action, ...extra });

export default function RegistryVersionHistory({ onBack, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await invoke("versions");
      setVersions(res.data.versions || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleRestore = async (id) => {
    setRestoring(id);
    await onRestore(id);
    setRestoring(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> Version History
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-white/40 text-center py-20">No versions yet.</p>
        ) : (
          <div className="space-y-3">
            {versions.map(v => (
              <Card key={v.id} className={cn("border transition-all", v.is_current ? "bg-amber-500/5 border-amber-500/30" : "bg-slate-900 border-white/10")}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">Version {v.version_number}</span>
                        {v.is_current && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Current</Badge>}
                      </div>
                      <p className="text-white/40 text-xs">
                        {v.generated_at ? new Date(v.generated_at).toLocaleString() : '—'}
                      </p>
                      {v.generation_notes && <p className="text-white/30 text-xs mt-1 italic">{v.generation_notes}</p>}
                    </div>
                    {!v.is_current && (
                      <Button variant="outline" size="sm" onClick={() => handleRestore(v.id)} disabled={!!restoring}>
                        {restoring === v.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                        Restore
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}