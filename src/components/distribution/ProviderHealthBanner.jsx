import React from "react";
import { Plug, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProviderHealthBanner({ providers = [] }) {
  if (!providers.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
      <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Plug className="w-4 h-4 text-amber-400" /> Publishing Infrastructure
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {providers.map((p) => (
          <div
            key={p.provider}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-sm",
              p.connected
                ? "bg-emerald-500/8 border-emerald-500/20"
                : "bg-amber-500/8 border-amber-500/20"
            )}
          >
            {p.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={p.connected ? "text-emerald-300" : "text-amber-300"}>{p.label}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {p.connected
                  ? "Connected — live provider operations enabled"
                  : p.mode === "estimates_only"
                    ? "Not connected — print costs shown as internal estimates"
                    : "Not connected — submissions are staged locally until connected"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}