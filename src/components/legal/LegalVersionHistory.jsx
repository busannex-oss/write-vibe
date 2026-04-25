import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Loader2, Clock, CheckCircle2 } from "lucide-react";

const invoke = (action, extra = {}) => base44.functions.invoke("legalDocuments", { action, ...extra });

export default function LegalVersionHistory({ docType, onBack, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    invoke("versions", { doc_type: docType }).then(r => {
      setVersions(r.data.versions || []);
      setLoading(false);
    });
  }, [docType]);

  const handleRestore = async (id) => {
    setRestoring(id);
    await onRestore(id);
    setRestoring(null);
  };

  const label = docType === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service';

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to {label}
          </Button>
          <h1 className="text-white font-bold text-lg">{label} — Version History</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
        ) : versions.length === 0 ? (
          <p className="text-white/30 text-center py-20">No versions yet. Generate a document to create the first version.</p>
        ) : (
          <div className="space-y-3">
            {versions.map(v => (
              <div key={v.id} className="bg-slate-900 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-white/30 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">v{v.version_number}</span>
                      {v.is_current && (
                        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Current
                        </span>
                      )}
                      {v.effective_date && (
                        <span className="text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          Effective: {new Date(v.effective_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">
                      Generated: {v.generated_at ? new Date(v.generated_at).toLocaleString() : 'Unknown'}
                      {v.generation_notes && ` · ${v.generation_notes}`}
                    </p>
                  </div>
                </div>
                {!v.is_current && (
                  <Button variant="outline" size="sm" onClick={() => handleRestore(v.id)} disabled={restoring === v.id}>
                    {restoring === v.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RotateCcw className="w-3 h-3 mr-1" />}
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