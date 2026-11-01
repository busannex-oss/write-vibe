import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Lock, Unlock, RefreshCw } from "lucide-react";
import { PHOTO_SET } from "@/components/book/characterImageStyles";
import { generatePhotoSet } from "@/lib/characterPhotoSet";

// Headshot, full body, professional and casual photos — all the same locked identity.
export default function CharacterPhotoSet({ char, book, onPatch, onLock, generatingAll }) {
  const [localBusy, setBusy] = useState(null);
  const busy = generatingAll ? "all" : localBusy;
  const set = char.photo_set || {};

  const run = async (keys) => {
    if (!char.appearance && !char.description) return alert("Please add appearance or description first");
    setBusy(keys.length > 1 ? "all" : keys[0]);
    try {
      if (!char.identity_image_url && !confirm("No locked identity image yet. Lock a portrait first (padlock icon on a picture), or continue to create a new identity?")) return setBusy(null);
      onPatch(await generatePhotoSet(char, book, keys));
    } catch (e) {
      alert("Failed to generate photos: " + e.message);
    }
    setBusy(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-white flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-400" />Identity Photo Set</p>
        <Button size="sm" onClick={() => run(PHOTO_SET.map((s) => s.key))} disabled={!!busy} className="bg-amber-500 hover:bg-amber-600 text-slate-950 border-0">
          {busy === "all" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Camera className="w-3 h-3 mr-1" />}
          {busy === "all" ? "Generating…" : "Generate All 4"}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PHOTO_SET.map((s) => (
          <div key={s.key} className="space-y-1">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group">
              {busy === s.key || (busy === "all") ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                : set[s.key] ? <img src={set[s.key]} alt={`${char.name} ${s.label}`} className="w-full h-full object-cover" />
                : <Camera className="w-5 h-5 text-white/20" />}
              {!busy && set[s.key] && (
                <button onClick={() => onLock(set[s.key])} title={set[s.key] === char.identity_image_url ? "Locked identity — click to unlock" : "Lock as permanent identity"} className={`absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center ${set[s.key] === char.identity_image_url ? "bg-amber-500 text-slate-950" : "bg-black/70 text-white hover:bg-amber-500/80"}`}>
                  {set[s.key] === char.identity_image_url ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
              )}
              {!busy && set[s.key] !== char.identity_image_url && (
                <button onClick={() => run([s.key])} title={`Regenerate ${s.label}`} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-center text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/40">The locked identity photo is used as the reference for every shot, so the face and body stay the same. Add Occupation and Hobbies below for the professional and casual photos.</p>
    </div>
  );
}