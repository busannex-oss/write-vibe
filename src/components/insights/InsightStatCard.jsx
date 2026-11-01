import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

// details: [{ id, primary, secondary }] — the records behind the number
export default function InsightStatCard({ icon: Icon, label, value, hint, accent = "text-amber-400", details = [], description }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card onClick={() => setOpen(true)} className="bg-white/5 border-white/10 cursor-pointer hover:border-amber-500/40 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${accent}`} />
            <p className="text-xs text-white/50 uppercase tracking-wide flex-1">{label}</p>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
          {hint && <p className="text-xs text-white/35 mt-1">{hint}</p>}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Icon className={`w-4 h-4 ${accent}`} />{label}: {value}</DialogTitle>
          </DialogHeader>
          {description && <p className="text-sm text-white/50">{description}</p>}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {details.length === 0 ? (
              <p className="text-sm text-white/40 py-6 text-center">Nothing recorded yet.</p>
            ) : details.map((d) => (
              <div key={d.id} className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-sm text-white">{d.primary}</p>
                {d.secondary && <p className="text-xs text-white/40">{d.secondary}</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}